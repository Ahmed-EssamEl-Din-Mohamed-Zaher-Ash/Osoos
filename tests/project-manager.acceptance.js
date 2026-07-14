const assert = require('node:assert/strict');

(async () => {

const port = process.env.CDP_PORT || '9229';
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === 'page' && /index\.html/.test(item.url)) || targets.find(item => item.type === 'page');
assert.ok(target, 'A browser page target must be available');

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const runtimeErrors = [];
let sequence = 0;

socket.addEventListener('message', event => {
  const message = JSON.parse(String(event.data));
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') {
    runtimeErrors.push(message.params.exceptionDetails.text || 'Runtime exception');
  }
  if (message.method === 'Log.entryAdded' &&
      message.params.entry.level === 'error' &&
      message.params.entry.source === 'javascript') {
    runtimeErrors.push(message.params.entry.text);
  }
});

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

function send(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const response = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  }
  return response.result.value;
}

await send('Runtime.enable');
await send('Log.enable');
await evaluate(`new Promise(resolve => {
  if (document.readyState === 'complete' && window.appInstance?.projectManager) resolve(true);
  else window.addEventListener('load', () => setTimeout(() => resolve(true), 600), { once: true });
})`);

const result = await evaluate(`(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const app = window.appInstance;
  const manager = app.projectManager;

  document.getElementById('project-manager-btn').click();
  const drawerOpened = document.getElementById('project-drawer-backdrop').classList.contains('open');

  const createFile = async (kind, path) => {
    document.getElementById('project-new-file-btn').click();
    const modal = document.getElementById('project-modal');
    const type = modal.querySelector('select');
    const name = modal.querySelector('input[name="file-name"]');
    type.value = kind;
    name.value = path;
    modal.querySelector('form').requestSubmit();
    await wait(40);
  };

  await createFile('css', 'assets/theme.css');
  app.editor.textarea.value = '.acceptance-card { color: rgb(255, 0, 0); }';
  app.editor.textarea.dispatchEvent(new Event('input', { bubbles: true }));
  await wait(650);

  document.getElementById('project-manager-btn').click();
  await createFile('js', 'scripts/app.js');
  app.editor.textarea.value = 'window.__osoosAcceptance = true;';
  app.editor.textarea.dispatchEvent(new Event('input', { bubbles: true }));
  await wait(650);

  document.getElementById('project-manager-btn').click();
  await createFile('html', 'pages/about.html');
  manager.showLinksDialog();
  const pageLinkButton = document.querySelector('.project-page-link-row .btn');
  if (pageLinkButton) pageLinkButton.click();
  await wait(50);
  const linkedAnchor = app.canvas.querySelector('a[href="../index.html"]');

  const indexPage = manager.project.files.find(file => file.path === 'index.html');
  manager.openFile(indexPage.id);
  const exportedIndex = manager.composeHtmlPage(indexPage, false).content;
  const cssFile = manager.project.files.find(file => file.path === 'assets/theme.css');
  const jsFile = manager.project.files.find(file => file.path === 'scripts/app.js');
  const stored = JSON.parse(localStorage.getItem(manager.storageKey));

  return {
    initialized: Boolean(manager && manager.project),
    drawerOpened,
    fileCount: manager.project.files.length,
    htmlCount: manager.project.files.filter(file => file.kind === 'html').length,
    cssSaved: cssFile?.content.includes('.acceptance-card'),
    jsSaved: jsFile?.content.includes('__osoosAcceptance'),
    cssPreviewed: document.getElementById('project-linked-styles').textContent.includes('.acceptance-card'),
    pageLinked: Boolean(linkedAnchor),
    exportHasCssLink: exportedIndex.includes('href="assets/theme.css"'),
    exportHasJsLink: exportedIndex.includes('src="scripts/app.js"'),
    persisted: stored.projects[0].files.length >= 4
  };
})()`);

assert.equal(result.initialized, true);
assert.equal(result.drawerOpened, true);
assert.ok(result.fileCount >= 4);
assert.ok(result.htmlCount >= 2);
assert.equal(result.cssSaved, true);
assert.equal(result.jsSaved, true);
assert.equal(result.cssPreviewed, true);
assert.equal(result.pageLinked, true);
assert.equal(result.exportHasCssLink, true);
assert.equal(result.exportHasJsLink, true);
assert.equal(result.persisted, true);
assert.deepEqual(runtimeErrors, []);

console.log(JSON.stringify(result, null, 2));
socket.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
