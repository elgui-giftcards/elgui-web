// Add copy controls only to the visible store color editor.
export function mountColorCopy(root = document) {
  root.querySelectorAll('.color-fields:not([hidden]) input[type="color"]').forEach(input => {
    if (input.closest('[data-color-copy-row]')) return;
    const row = document.createElement('div');
    row.dataset.colorCopyRow = '';
    row.style.cssText = 'display:flex;align-items:center;gap:12px;flex-wrap:wrap';
    const value = document.createElement('input');
    value.type = 'text';
    value.readOnly = true;
    value.setAttribute('aria-label', 'Código hexadecimal de ' + (input.labels?.[0]?.textContent || 'color'));
    value.style.cssText = 'width:104px;flex:0 0 104px;font-family:monospace;text-transform:uppercase';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button-secondary button-small';
    button.style.cssText = 'width:auto;min-width:90px';
    button.textContent = 'Copiar';
    button.setAttribute('aria-label', 'Copiar ' + (input.labels?.[0]?.textContent || 'color'));
    const status = document.createElement('span');
    status.setAttribute('role', 'status');
    status.style.cssText = 'font-size:0.85rem';
    let timer;
    const sync = () => { value.value = input.value.toUpperCase(); button.textContent = 'Copiar'; status.textContent = ''; };
    input.before(row);
    row.append(input, value, button, status);
    sync();
    input.addEventListener('input', sync);
    value.addEventListener('click', () => value.select());
    button.addEventListener('click', async () => {
      button.disabled = true;
      clearTimeout(timer);
      const hex = input.value.toUpperCase();
      try {
        await navigator.clipboard.writeText(hex);
        if (!row.isConnected) return;
        button.textContent = 'Copiado';
        status.textContent = hex + ' copiado';
      } catch {
        value.focus();
        value.select();
        status.textContent = 'Seleccionado: copialo con tu teclado.';
      } finally {
        button.disabled = false;
        timer = setTimeout(() => { if (row.isConnected) { button.textContent = 'Copiar'; status.textContent = ''; } }, 2000);
      }
    });
    // Restoring the palette updates the native color inputs programmatically.
    root.querySelector('#restore-colors')?.addEventListener('click', sync);
  });
}
const workspace = document.querySelector('#workspace');
if (workspace) {
  new MutationObserver(() => mountColorCopy(workspace)).observe(workspace, {childList:true,subtree:true});
  mountColorCopy(workspace);
}
