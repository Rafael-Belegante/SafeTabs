const STORAGE_KEY = 'safetabs.sessions.v2';
const THEME_KEY = 'safetabs.theme';
const LEGACY_STORAGE_KEY = 'abacofre.sessions.v1';
const LEGACY_THEME_KEY = 'abacofre.theme';
const PROJECT_URL = 'https://github.com/Rafael-Belegante/SafeTabs';
const PROFILE_URL = 'https://github.com/Rafael-Belegante/Hub-de-Projetos';

const state = {
  sessions: [],
  selected: new Set(),
  expanded: new Set(),
  importSessions: [],
  importSelected: new Set(),
  pendingDelete: null,
  renameSessionId: null,
  query: ''
};

const $ = (id) => document.getElementById(id);
const els = {};

const ICONS = {
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v6H5V6h6"/></svg>',
  all: '<svg viewBox="0 0 24 24"><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z"/></svg>',
  chevron: '<svg class="chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z"/>'
};

function initElements() {
  [
    'sessionName', 'saveBtn', 'themeBtn', 'themeIcon', 'aboutBtn', 'sessionCount', 'tabCount',
    'selectedCount', 'searchInput', 'selectAllBtn', 'sessionsList', 'emptyState',
    'noResults', 'importBtn', 'exportBtn', 'deleteSelectedBtn', 'fileInput',
    'importModal', 'closeImportBtn', 'importPreview', 'importSelectAll', 'importSelectNone',
    'importSelectionCount', 'confirmImportBtn', 'confirmModal', 'confirmTitle', 'confirmText',
    'cancelConfirmBtn', 'confirmDeleteBtn', 'renameModal', 'renameInput', 'closeRenameBtn',
    'cancelRenameBtn', 'confirmRenameBtn', 'aboutModal', 'closeAboutBtn', 'aboutVersion',
    'projectLinkBtn', 'profileLinkBtn', 'toast'
  ].forEach((id) => { els[id] = $(id); });
}

async function init() {
  initElements();
  bindEvents();
  await loadTheme();
  await loadSessions();
  render();
}

function bindEvents() {
  els.saveBtn.addEventListener('click', saveCurrentWindow);
  els.sessionName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') saveCurrentWindow();
  });
  els.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim().toLocaleLowerCase('pt-BR');
    renderSessions();
  });
  els.selectAllBtn.addEventListener('click', toggleSelectAllVisible);
  els.exportBtn.addEventListener('click', exportSelected);
  els.deleteSelectedBtn.addEventListener('click', () => askDeleteSessions([...state.selected]));
  els.importBtn.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', handleImportFile);
  els.themeBtn.addEventListener('click', toggleTheme);
  els.aboutBtn.addEventListener('click', openAboutModal);

  els.closeImportBtn.addEventListener('click', closeImportModal);
  els.importModal.addEventListener('click', (event) => {
    if (event.target === els.importModal) closeImportModal();
  });
  els.importSelectAll.addEventListener('click', () => {
    state.importSelected = new Set(state.importSessions.map((session) => session.id));
    renderImportPreview();
  });
  els.importSelectNone.addEventListener('click', () => {
    state.importSelected.clear();
    renderImportPreview();
  });
  els.confirmImportBtn.addEventListener('click', confirmImport);

  els.cancelConfirmBtn.addEventListener('click', closeConfirmModal);
  els.confirmModal.addEventListener('click', (event) => {
    if (event.target === els.confirmModal) closeConfirmModal();
  });
  els.confirmDeleteBtn.addEventListener('click', executePendingDelete);

  els.closeRenameBtn.addEventListener('click', closeRenameModal);
  els.cancelRenameBtn.addEventListener('click', closeRenameModal);
  els.renameModal.addEventListener('click', (event) => {
    if (event.target === els.renameModal) closeRenameModal();
  });
  els.renameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') confirmRenameSession();
  });
  els.confirmRenameBtn.addEventListener('click', confirmRenameSession);

  els.closeAboutBtn.addEventListener('click', closeAboutModal);
  els.aboutModal.addEventListener('click', (event) => {
    if (event.target === els.aboutModal) closeAboutModal();
  });
  els.projectLinkBtn.addEventListener('click', () => openExternalUrl(PROJECT_URL));
  els.profileLinkBtn.addEventListener('click', () => openExternalUrl(PROFILE_URL));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeImportModal();
      closeConfirmModal();
      closeRenameModal();
      closeAboutModal();
    }
  });
}

function openAboutModal() {
  els.aboutVersion.textContent = `v${chrome.runtime.getManifest().version}`;
  els.aboutModal.classList.remove('hidden');
}

function closeAboutModal() {
  els.aboutModal.classList.add('hidden');
}

async function openExternalUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com') throw new Error('URL externa não permitida');
    await chrome.tabs.create({ url: parsed.href, active: true });
  } catch (error) {
    console.error(error);
    toast('Não foi possível abrir o GitHub.', 'error');
  }
}

async function loadTheme() {
  const data = await chrome.storage.local.get([THEME_KEY, LEGACY_THEME_KEY]);
  const saved = data[THEME_KEY] || data[LEGACY_THEME_KEY];
  const preferred = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(preferred);
  if (!data[THEME_KEY]) await chrome.storage.local.set({ [THEME_KEY]: preferred });
}

function applyTheme(theme) {
  const safeTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = safeTheme;
  els.themeIcon.innerHTML = safeTheme === 'dark' ? ICONS.sun : ICONS.moon;
  els.themeBtn.title = safeTheme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro';
  els.themeBtn.setAttribute('aria-label', els.themeBtn.title);
}

async function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  await chrome.storage.local.set({ [THEME_KEY]: next });
}

async function loadSessions() {
  const data = await chrome.storage.local.get([STORAGE_KEY, LEGACY_STORAGE_KEY]);
  const current = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : null;
  const legacy = Array.isArray(data[LEGACY_STORAGE_KEY]) ? data[LEGACY_STORAGE_KEY] : [];
  state.sessions = current ?? legacy;
  normalizeStoredSessions();
  if (!current && legacy.length) await persist();
}

function normalizeStoredSessions() {
  state.sessions = state.sessions
    .filter((session) => session && Array.isArray(session.tabs))
    .map((session) => ({
      id: String(session.id || crypto.randomUUID()),
      name: String(session.name || 'Sessão sem nome').slice(0, 80),
      createdAt: isFinite(Date.parse(session.createdAt)) ? session.createdAt : new Date().toISOString(),
      tabs: session.tabs.map(normalizeTab).filter(Boolean)
    }))
    .filter((session) => session.tabs.length > 0)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function normalizeTab(tab, index = 0) {
  if (!tab || !isSafeWebUrl(tab.url)) return null;
  return {
    id: String(tab.id || crypto.randomUUID()),
    title: String(tab.title || safeHostname(tab.url) || 'Aba').slice(0, 500),
    url: String(tab.url),
    favIconUrl: isSafeImageUrl(tab.favIconUrl) ? String(tab.favIconUrl) : '',
    index: Number.isFinite(tab.index) ? tab.index : index
  };
}

async function persist() {
  await chrome.storage.local.set({ [STORAGE_KEY]: state.sessions });
}

function isSafeWebUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSafeImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

async function saveCurrentWindow() {
  setButtonBusy(els.saveBtn, true, 'Salvando…');
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const valid = [];
    let unsupported = 0;

    for (const tab of tabs) {
      if (!tab.url) {
        unsupported++;
        continue;
      }
      if (!isSafeWebUrl(tab.url)) {
        unsupported++;
        continue;
      }

      valid.push({
        id: crypto.randomUUID(),
        title: tab.title || safeHostname(tab.url) || 'Aba',
        url: tab.url,
        favIconUrl: isSafeImageUrl(tab.favIconUrl) ? tab.favIconUrl : '',
        index: tab.index
      });
    }

    if (!valid.length) {
      toast('Nenhuma aba válida para salvar nesta janela.', 'error');
      return;
    }

    const now = new Date();
    const customName = els.sessionName.value.trim();
    const session = {
      id: crypto.randomUUID(),
      name: customName || `Sessão • ${formatShortDate(now)}`,
      createdAt: now.toISOString(),
      tabs: valid
    };

    state.sessions.unshift(session);
    await persist();
    els.sessionName.value = '';
    state.expanded.add(session.id);
    render();

    const suffix = unsupported
      ? ` • ${unsupported} não compatível${unsupported === 1 ? '' : 'is'}`
      : '';
    toast(`${valid.length} aba${valid.length === 1 ? '' : 's'} salva${valid.length === 1 ? '' : 's'}${suffix}.`, 'success');
  } catch (error) {
    console.error(error);
    toast('Não foi possível ler as abas desta janela.', 'error');
  } finally {
    setButtonBusy(els.saveBtn, false);
  }
}

function setButtonBusy(button, busy, text) {
  if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
  button.disabled = busy;
  button.innerHTML = busy ? text : button.dataset.originalHtml;
}

function render() {
  renderStats();
  renderSessions();
  updateBulkButtons();
}

function renderStats() {
  els.sessionCount.textContent = state.sessions.length;
  els.tabCount.textContent = state.sessions.reduce((sum, session) => sum + session.tabs.length, 0);
  els.selectedCount.textContent = state.selected.size;
}

function getVisibleSessions() {
  if (!state.query) return state.sessions;
  return state.sessions.filter((session) => {
    const sessionMatch = session.name.toLocaleLowerCase('pt-BR').includes(state.query);
    const tabMatch = session.tabs.some((tab) =>
      tab.title.toLocaleLowerCase('pt-BR').includes(state.query) ||
      tab.url.toLocaleLowerCase('pt-BR').includes(state.query)
    );
    return sessionMatch || tabMatch;
  });
}

function renderSessions() {
  const visible = getVisibleSessions();
  els.sessionsList.textContent = '';
  els.emptyState.classList.toggle('hidden', state.sessions.length !== 0);
  els.noResults.classList.toggle('hidden', state.sessions.length === 0 || visible.length !== 0);

  for (const session of visible) {
    els.sessionsList.appendChild(buildSessionCard(session));
  }

  const allVisibleSelected = visible.length > 0 && visible.every((session) => state.selected.has(session.id));
  els.selectAllBtn.textContent = allVisibleSelected ? 'Limpar seleção' : 'Selecionar tudo';
  renderStats();
  updateBulkButtons();
}

function buildSessionCard(session) {
  const card = document.createElement('article');
  card.className = `session-card${state.selected.has(session.id) ? ' selected' : ''}`;
  card.dataset.id = session.id;

  const main = document.createElement('div');
  main.className = 'session-main';

  const checkLabel = document.createElement('label');
  checkLabel.className = 'check-wrap';
  checkLabel.title = 'Selecionar sessão';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = state.selected.has(session.id);
  const customCheck = document.createElement('span');
  customCheck.className = 'custom-check';
  customCheck.innerHTML = ICONS.check;
  checkbox.addEventListener('change', () => toggleSessionSelection(session.id, checkbox.checked));
  checkLabel.append(checkbox, customCheck);

  const info = document.createElement('div');
  info.className = 'session-info';
  const titleRow = document.createElement('div');
  titleRow.className = 'session-title-row';
  const title = document.createElement('h3');
  title.className = 'session-title';
  title.textContent = session.name;
  const count = document.createElement('span');
  count.className = 'count-pill';
  count.textContent = `${session.tabs.length} ${session.tabs.length === 1 ? 'aba' : 'abas'}`;
  titleRow.append(title, count);

  const meta = document.createElement('div');
  meta.className = 'session-meta';
  const date = document.createElement('span');
  date.textContent = formatDate(session.createdAt);
  const domains = document.createElement('span');
  domains.textContent = summarizeDomains(session.tabs);
  meta.append(date, domains);
  info.append(titleRow, meta);

  const actions = document.createElement('div');
  actions.className = 'session-actions';

  const openAll = makeButton('mini-btn', `${ICONS.all}<span>Abrir todas</span>`, 'Abrir esta sessão em uma nova janela');
  openAll.addEventListener('click', () => openSession(session));

  const rename = makeButton('icon-btn', ICONS.edit, 'Renomear esta sessão');
  rename.addEventListener('click', () => openRenameModal(session.id));

  const expand = makeButton('icon-btn', ICONS.chevron, 'Ver abas da sessão');
  if (state.expanded.has(session.id)) expand.querySelector('svg').classList.add('open');
  expand.addEventListener('click', () => {
    if (state.expanded.has(session.id)) state.expanded.delete(session.id);
    else state.expanded.add(session.id);
    renderSessions();
  });

  const remove = makeButton('icon-btn danger-icon', ICONS.trash, 'Excluir esta sessão');
  remove.addEventListener('click', () => askDeleteSessions([session.id]));

  actions.append(openAll, rename, expand, remove);
  main.append(checkLabel, info, actions);
  card.append(main);

  if (state.expanded.has(session.id)) {
    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    session.tabs.forEach((tab, index) => panel.appendChild(buildTabRow(session, tab, index)));
    card.append(panel);
  }

  return card;
}

function buildTabRow(session, tab, index) {
  const row = document.createElement('div');
  row.className = 'tab-row';

  const faviconBox = document.createElement('div');
  faviconBox.className = 'favicon-box';
  if (tab.favIconUrl) {
    const img = document.createElement('img');
    img.src = tab.favIconUrl;
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => {
      faviconBox.textContent = safeHostname(tab.url).charAt(0).toUpperCase() || '•';
      faviconBox.classList.add('fallback-favicon');
    }, { once: true });
    faviconBox.append(img);
  } else {
    faviconBox.textContent = safeHostname(tab.url).charAt(0).toUpperCase() || '•';
    faviconBox.classList.add('fallback-favicon');
  }

  const text = document.createElement('div');
  text.className = 'tab-text';
  const title = document.createElement('div');
  title.className = 'tab-title';
  title.textContent = tab.title || `Aba ${index + 1}`;
  title.title = tab.title;
  const url = document.createElement('div');
  url.className = 'tab-url';
  url.textContent = tab.url;
  url.title = tab.url;
  text.append(title, url);

  const open = makeButton('mini-btn', `${ICONS.open}<span>Abrir</span>`, 'Abrir esta aba');
  open.addEventListener('click', () => openTab(tab.url));

  const remove = makeButton('icon-btn danger-icon tab-remove', ICONS.trash, 'Remover esta aba da sessão');
  remove.addEventListener('click', () => askDeleteTab(session.id, tab.id));

  row.append(faviconBox, text, open, remove);
  return row;
}

function openRenameModal(sessionId) {
  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session) return;
  state.renameSessionId = sessionId;
  els.renameInput.value = session.name;
  els.renameModal.classList.remove('hidden');
  setTimeout(() => {
    els.renameInput.focus();
    els.renameInput.select();
  }, 0);
}

function closeRenameModal() {
  els.renameModal.classList.add('hidden');
  state.renameSessionId = null;
  els.renameInput.value = '';
}

async function confirmRenameSession() {
  const session = state.sessions.find((item) => item.id === state.renameSessionId);
  if (!session) {
    closeRenameModal();
    return;
  }

  const nextName = els.renameInput.value.trim().slice(0, 80);
  if (!nextName) {
    toast('Digite um nome para a sessão.', 'error');
    els.renameInput.focus();
    return;
  }

  if (nextName === session.name) {
    closeRenameModal();
    return;
  }

  session.name = nextName;
  await persist();
  closeRenameModal();
  render();
  toast('Nome da sessão atualizado.', 'success');
}

function makeButton(className, html, title) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.innerHTML = html;
  button.title = title;
  button.setAttribute('aria-label', title);
  return button;
}

function toggleSessionSelection(id, checked) {
  if (checked) state.selected.add(id);
  else state.selected.delete(id);
  renderSessions();
}

function toggleSelectAllVisible() {
  const visible = getVisibleSessions();
  if (!visible.length) return;
  const allSelected = visible.every((session) => state.selected.has(session.id));
  visible.forEach((session) => allSelected ? state.selected.delete(session.id) : state.selected.add(session.id));
  renderSessions();
}

function updateBulkButtons() {
  const hasSelection = state.selected.size > 0;
  els.exportBtn.disabled = !hasSelection;
  els.deleteSelectedBtn.disabled = !hasSelection;
}

async function openTab(url) {
  if (!isSafeWebUrl(url)) {
    toast('Esta URL não é permitida.', 'error');
    return;
  }
  try {
    await chrome.tabs.create({ url, active: true });
  } catch (error) {
    console.error(error);
    toast('Não foi possível abrir a aba.', 'error');
  }
}

async function openSession(session) {
  const urls = session.tabs.map((tab) => tab.url).filter(isSafeWebUrl);
  if (!urls.length) return;
  try {
    await chrome.windows.create({ url: urls, focused: true });
  } catch (error) {
    console.error(error);
    try {
      for (const url of urls) await chrome.tabs.create({ url, active: false });
    } catch (fallbackError) {
      console.error(fallbackError);
      toast('Não foi possível abrir todas as abas.', 'error');
    }
  }
}

function exportSelected() {
  const sessions = state.sessions.filter((session) => state.selected.has(session.id));
  if (!sessions.length) return;

  const payload = {
    app: 'SafeTabs',
    format: 'safetabs-sessions',
    appVersion: '1.0',
    formatVersion: 2,
    exportedAt: new Date().toISOString(),
    sessions
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SafeTabs_${formatFileDate(new Date())}_${sessions.length}-sessoes.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast(`${sessions.length} sessão${sessions.length === 1 ? '' : 'ões'} exportada${sessions.length === 1 ? '' : 's'}.`, 'success');
}

async function handleImportFile(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo muito grande');
    const text = await file.text();
    const json = JSON.parse(text);
    const rawSessions = Array.isArray(json) ? json : json.sessions;
    if (!Array.isArray(rawSessions)) throw new Error('Formato inválido');

    const valid = rawSessions.map(validateImportedSession).filter(Boolean);
    if (!valid.length) throw new Error('Nenhuma sessão válida');

    state.importSessions = valid;
    state.importSelected = new Set(valid.map((session) => session.id));
    renderImportPreview();
    els.importModal.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    toast('Arquivo inválido ou sem sessões compatíveis.', 'error');
  }
}

function validateImportedSession(raw, index) {
  if (!raw || !Array.isArray(raw.tabs)) return null;
  const tabs = raw.tabs.map((tab, tabIndex) => normalizeTab(tab, tabIndex)).filter(Boolean);
  if (!tabs.length) return null;
  return {
    id: String(raw.id || `import-${index}-${crypto.randomUUID()}`),
    name: String(raw.name || `Sessão importada ${index + 1}`).slice(0, 80),
    createdAt: isFinite(Date.parse(raw.createdAt)) ? raw.createdAt : new Date().toISOString(),
    tabs
  };
}

function renderImportPreview() {
  els.importPreview.textContent = '';
  for (const session of state.importSessions) {
    const item = document.createElement('label');
    item.className = 'import-item';

    const checkLabel = document.createElement('span');
    checkLabel.className = 'check-wrap';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.importSelected.has(session.id);
    const customCheck = document.createElement('span');
    customCheck.className = 'custom-check';
    customCheck.innerHTML = ICONS.check;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) state.importSelected.add(session.id);
      else state.importSelected.delete(session.id);
      updateImportSelectionCount();
    });
    checkLabel.append(checkbox, customCheck);

    const text = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'import-item-title';
    title.textContent = session.name;
    const meta = document.createElement('div');
    meta.className = 'import-item-meta';
    meta.textContent = formatDate(session.createdAt);
    text.append(title, meta);

    const count = document.createElement('span');
    count.className = 'import-item-count';
    count.textContent = `${session.tabs.length} ${session.tabs.length === 1 ? 'aba' : 'abas'}`;

    item.append(checkLabel, text, count);
    els.importPreview.append(item);
  }
  updateImportSelectionCount();
}

function updateImportSelectionCount() {
  const count = state.importSelected.size;
  els.importSelectionCount.textContent = `${count} selecionada${count === 1 ? '' : 's'}`;
  els.confirmImportBtn.disabled = count === 0;
}

async function confirmImport() {
  const chosen = state.importSessions.filter((session) => state.importSelected.has(session.id));
  if (!chosen.length) return;

  const signatures = new Set(state.sessions.map(sessionSignature));
  const ids = new Set(state.sessions.map((session) => session.id));
  let imported = 0;
  let skipped = 0;

  for (const incoming of chosen) {
    const signature = sessionSignature(incoming);
    if (signatures.has(signature)) {
      skipped++;
      continue;
    }

    const session = structuredClone(incoming);
    if (ids.has(session.id)) session.id = crypto.randomUUID();
    session.tabs = session.tabs.map((tab) => ({ ...tab, id: crypto.randomUUID() }));
    ids.add(session.id);
    signatures.add(signature);
    state.sessions.push(session);
    imported++;
  }

  state.sessions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  await persist();
  closeImportModal();
  render();
  const suffix = skipped ? ` • ${skipped} duplicada${skipped === 1 ? '' : 's'} ignorada${skipped === 1 ? '' : 's'}` : '';
  toast(`${imported} sessão${imported === 1 ? '' : 'ões'} importada${imported === 1 ? '' : 's'}${suffix}.`, 'success');
}

function sessionSignature(session) {
  return [session.createdAt, session.name, ...session.tabs.map((tab) => tab.url)].join('\u241f');
}

function closeImportModal() {
  els.importModal.classList.add('hidden');
  state.importSessions = [];
  state.importSelected.clear();
}

function askDeleteSessions(ids) {
  const validIds = ids.filter((id) => state.sessions.some((session) => session.id === id));
  if (!validIds.length) return;
  state.pendingDelete = { type: 'sessions', ids: validIds };
  const count = validIds.length;
  els.confirmTitle.textContent = count === 1 ? 'Excluir sessão?' : 'Excluir sessões?';
  els.confirmText.textContent = count === 1
    ? 'A sessão selecionada e todas as abas salvas nela serão removidas deste computador.'
    : `${count} sessões selecionadas e suas abas salvas serão removidas deste computador.`;
  els.confirmModal.classList.remove('hidden');
}

function askDeleteTab(sessionId, tabId) {
  const session = state.sessions.find((item) => item.id === sessionId);
  const tab = session?.tabs.find((item) => item.id === tabId);
  if (!session || !tab) return;
  state.pendingDelete = { type: 'tab', sessionId, tabId };
  els.confirmTitle.textContent = 'Remover aba salva?';
  els.confirmText.textContent = session.tabs.length === 1
    ? `“${truncate(tab.title, 80)}” é a última aba desta sessão. Ao removê-la, a sessão vazia também será excluída.`
    : `“${truncate(tab.title, 80)}” será removida da sessão “${truncate(session.name, 60)}”.`;
  els.confirmModal.classList.remove('hidden');
}

function closeConfirmModal() {
  els.confirmModal.classList.add('hidden');
  state.pendingDelete = null;
}

async function executePendingDelete() {
  const pending = state.pendingDelete;
  if (!pending) return;

  if (pending.type === 'sessions') {
    const ids = new Set(pending.ids);
    state.sessions = state.sessions.filter((session) => !ids.has(session.id));
    ids.forEach((id) => {
      state.expanded.delete(id);
      state.selected.delete(id);
    });
    await persist();
    closeConfirmModal();
    render();
    toast(`${ids.size} sessão${ids.size === 1 ? '' : 'ões'} excluída${ids.size === 1 ? '' : 's'}.`, 'success');
    return;
  }

  if (pending.type === 'tab') {
    const session = state.sessions.find((item) => item.id === pending.sessionId);
    if (!session) {
      closeConfirmModal();
      return;
    }

    const before = session.tabs.length;
    session.tabs = session.tabs.filter((tab) => tab.id !== pending.tabId);
    if (session.tabs.length === before) {
      closeConfirmModal();
      return;
    }

    if (!session.tabs.length) {
      state.sessions = state.sessions.filter((item) => item.id !== session.id);
      state.expanded.delete(session.id);
      state.selected.delete(session.id);
    }

    await persist();
    closeConfirmModal();
    render();
    toast(session.tabs.length ? 'Aba removida da sessão.' : 'Aba removida e sessão vazia excluída.', 'success');
  }
}

function summarizeDomains(tabs) {
  const unique = [...new Set(tabs.map((tab) => safeHostname(tab.url)).filter(Boolean))];
  if (!unique.length) return '';
  if (unique.length <= 2) return unique.join(' • ');
  return `${unique.slice(0, 2).join(' • ')} +${unique.length - 2}`;
}

function safeHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function truncate(value, maxLength) {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatFileDate(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
}

let toastTimer;
function toast(message, type = '') {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.className = `toast show ${type}`.trim();
  toastTimer = setTimeout(() => { els.toast.className = 'toast'; }, 2900);
}

document.addEventListener('DOMContentLoaded', init);
