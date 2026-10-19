// The favicon remains the Elgui logo; only the tab text follows the tenant.
const workspace = document.querySelector('#workspace');
const baseTitle = 'Gift Card Store';
function updatePageTitle() {
  let name = '';
  if (workspace && !workspace.hidden && !/^#\/admin\/platform(?:\/|$)/.test(location.hash)) {
    name = workspace.querySelector('.store-navbar-name')?.textContent?.trim()
      || workspace.querySelector('.store-navbar-logo')?.getAttribute('alt')?.trim()
      || workspace.querySelector('#tenant-select option:checked')?.textContent?.trim()
      || workspace.querySelector('.gift-brand-logo')?.getAttribute('alt')?.trim()
      || workspace.querySelector('.gift-brand-name')?.textContent?.trim()
      || workspace.querySelector('.shop-store-name')?.textContent?.trim() || '';
  }
  document.title = name ? baseTitle + ' / ' + name : baseTitle;
}
if (workspace) {
  new MutationObserver(updatePageTitle).observe(workspace, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
  workspace.addEventListener('change', updatePageTitle);
}
window.addEventListener('hashchange', updatePageTitle);
updatePageTitle();
