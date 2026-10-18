export function mountPlatformAccounts({host, tenants, call, escape: e}) {
  host.innerHTML = '<h2>Cuentas de cobro · Mercado Pago</h2><p>El número mostrado es el ID de la cuenta receptora. Los datos del titular se registran al vincular la cuenta.</p><button class="button" id="refresh-payment-accounts">Actualizar tabla</button><p role="status"></p><div class="account-rows" style="overflow-x:auto"></div>';
  const status = host.querySelector('[role="status"]'), rows = host.querySelector('.account-rows');
  const button = host.querySelector('button');
  let generation = 0;
  const date = value => value ? new Date(value).toLocaleString('es-AR') : 'No informado';
  const labels = {connected:'Conectada',reconnect:'Requiere reconexión',disabled:'Deshabilitada',unknown:'Sin verificar'};
  async function load() {
    const current = ++generation;
    button.disabled = true; status.textContent = 'Cargando cuentas…';
    try {
      const accounts = new Map(); let cursor = '';
      do {
        const page = await call('getPlatformPaymentAccounts', {cursor});
        for (const account of page.accounts) accounts.set(account.tenantId, account);
        cursor = page.nextCursor;
      } while (cursor);
      if (current !== generation || !host.isConnected) return;
      const stores = new Map(tenants.map(t => [t.id, t]));
      for (const key of accounts.keys()) if (!stores.has(key)) stores.set(key, {id:key,name:key});
      rows.innerHTML = '<table><thead><tr>'+['Comercio','ID cuenta de cobro','Estado','Titular','Correo MP','Usuario MP','País / sitio','Alta en MP','Primera vinculación','Última vinculación','Vinculada por','Datos verificados'].map(v=>'<th scope="col">'+v+'</th>').join('')+'</tr></thead><tbody>'+[...stores.values()].map(t=>{
        const a = accounts.get(t.id), p = a?.profile || {};
        const values = [t.name+' ('+t.id+')',a?.collectorId || 'Sin vincular',a ? labels[a.status] || 'Sin verificar' : 'Sin vincular',
          [p.firstName,p.lastName].filter(Boolean).join(' ') || 'No informado',p.email || 'No informado',
          p.nickname || 'No informado',[p.countryId,p.siteId].filter(Boolean).join(' / ') || 'No informado',
          p.registeredAt || 'No informado',date(a?.firstConnectedAt),date(a?.lastConnectedAt),
          a?.connectedEmail || a?.connectedBy || 'No informado',date(a?.profileVerifiedAt)];
        return '<tr>'+values.map(v=>'<td>'+e(String(v))+'</td>').join('')+'</tr>';
      }).join('')+'</tbody></table>';
      status.textContent = stores.size ? 'Tabla actualizada.' : 'Todavía no hay comercios.';
    } catch { if (current === generation) status.textContent = 'No pudimos cargar las cuentas. Volvé a intentar.'; }
    finally { if (current === generation) button.disabled = false; }
  }
  button.onclick = load;
  load();
}
