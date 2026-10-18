import { distributePalette, validHex } from './store-palette-model.js';

export function mountStorePalette(root = document) {
  const fields = root.querySelector('.color-fields:not([hidden])');
  if (!fields || fields.previousElementSibling?.hasAttribute('data-store-palette')) return;
  const form = fields.closest('form');
  if (!form) return;
  const section = document.createElement('section');
  section.dataset.storePalette = '';
  section.style.cssText = 'padding:20px;border:1px solid #d9cee5;border-radius:16px;margin-bottom:24px;background:#faf8fc;color:#422364';
  section.innerHTML = `<h3 style="margin:0 0 8px">Paleta del local</h3>
    <p style="margin:0 0 16px">Elegí 4 colores y generá una distribución automática. Después podés editar cada color por separado.</p>
    <div data-palette-inputs style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px"></div>
    <p style="font-size:.85rem">Los textos se ajustan para que contrasten con el fondo. Si hace falta, se usa blanco o negro.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="button button-secondary" data-generate style="width:auto">Generar vista previa</button><button type="button" class="button button-secondary" data-undo style="width:auto" hidden>Deshacer paleta</button></div>
    <div data-palette-preview hidden style="margin-top:20px"></div>
    <p role="status" data-palette-status style="font-size:.9rem;margin-bottom:0"></p>`;
  fields.before(section);
  const status = section.querySelector('[data-palette-status]');
  const preview = section.querySelector('[data-palette-preview]');
  const controls = section.querySelector('[data-palette-inputs]');
  let generated, previous;
  const defaults = ['#422364', '#d7f75b', '#fff7ea', '#000000'];
  const labels = ['Principal', 'Secundario', 'Fondo', 'Acento'];
  const paletteInputs = labels.map((label, i) => {
    const box = document.createElement('div');
    box.innerHTML = `<label style="display:block;margin-bottom:6px" for="palette-color-${i}">${label}</label><div style="display:flex;gap:8px;align-items:center"><input id="palette-color-${i}" type="color" aria-label="Paleta: ${label}" style="width:60px;min-width:60px;height:44px"><input type="text" aria-label="Hexadecimal de paleta: ${label}" maxlength="7" pattern="#[0-9a-fA-F]{6}" spellcheck="false" style="width:104px;min-width:0;font-family:monospace;text-transform:uppercase"></div>`;
    controls.append(box);
    const picker = box.querySelector('[type=color]'), hex = box.querySelector('[type=text]');
    picker.value = defaults[i];
    hex.value = picker.value.toUpperCase();
    const invalidate = () => { generated = null; preview.hidden = true; preview.replaceChildren(); status.textContent = ''; };
    picker.addEventListener('input', () => { hex.value = picker.value.toUpperCase(); hex.setCustomValidity(''); invalidate(); });
    hex.addEventListener('input', () => { hex.setCustomValidity(validHex(hex.value) ? '' : 'Usá un código como #422364.'); if (validHex(hex.value)) picker.value = hex.value; invalidate(); });
    return {box, picker, hex};
  });
  const applyValues = values => {
    for (const [name, value] of Object.entries(values)) {
      const input = form.elements[name];
      if (!input) continue;
      input.value = value;
      input.dispatchEvent(new Event('input', {bubbles:true}));
    }
  };
  section.querySelector('[data-generate]').addEventListener('click', () => {
    const chosen = paletteInputs;
    if (chosen.some(({hex}) => !hex.reportValidity())) return;
    generated = distributePalette(chosen.map(({hex}) => hex.value));
    const p = generated;
    preview.innerHTML = `<h4 style="margin:0 0 10px">Vista previa de la paleta</h4><div style="border:1px solid #d9cee5;border-radius:12px;overflow:hidden"><div style="padding:14px;background:${p.headerColor};color:${p.headerTextColor};font-weight:700">Tu local</div><div style="padding:18px;background:${p.pageColor};color:${p.pageTextColor}"><p style="margin:0 0 12px">Un regalo para disfrutar</p><div style="padding:24px;text-align:center;border-radius:12px;background:${p.color};color:${p.textColor}"><strong style="font-size:1.5rem">$25.000</strong><div>GIFT CARD</div></div><div style="padding:12px;background:${p.cardColor};color:${p.cardTextColor}">Nombre del regalo</div><div style="padding:12px;text-align:center;border-radius:8px;background:${p.buttonColor};color:${p.buttonTextColor};font-weight:700">Regalar esta giftcard</div></div><div style="padding:12px;text-align:center;background:${p.footerColor};color:${p.footerTextColor}">Redes y contacto</div></div><p style="font-size:.85rem">Esta vista previa no modifica tus colores ni guarda cambios.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="button" data-apply style="width:auto">Aplicar paleta</button><button type="button" class="button button-secondary" data-cancel style="width:auto">Cancelar vista previa</button></div>`;
    preview.hidden = false;
    status.textContent = '';
    preview.querySelector('[data-cancel]').onclick = () => { generated = null; preview.hidden = true; preview.replaceChildren(); };
    preview.querySelector('[data-apply]').onclick = () => {
      if (!generated) return;
      previous = Object.fromEntries(Object.keys(generated).map(name => [name, form.elements[name].value]));
      applyValues(generated);
      preview.hidden = true; preview.replaceChildren(); generated = null;
      section.querySelector('[data-undo]').hidden = false;
      status.textContent = 'Paleta aplicada. Podés ajustar cada color abajo. Tocá Guardar colores para guardar los cambios.';
    };
  });
  section.querySelector('[data-undo]').addEventListener('click', () => {
    if (!previous) return;
    applyValues(previous); previous = null;
    section.querySelector('[data-undo]').hidden = true;
    status.textContent = 'Volviste a los colores anteriores. Tocá Guardar colores para guardar los cambios.';
  });
}
const workspace = document.querySelector('#workspace');
if (workspace) {
  new MutationObserver(() => mountStorePalette(workspace)).observe(workspace, {childList:true,subtree:true});
  mountStorePalette(workspace);
}
