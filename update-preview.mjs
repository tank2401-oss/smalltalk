import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import './assets/data.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const readJSON = name => {
  try {return JSON.parse(readFileSync(join(root, 'data', name), 'utf8'));}
  catch (error) {throw new Error(`${name}: 파일 또는 JSON 문법을 확인해 주세요. ${error.message}`);}
};
const common = readJSON('common.json');
if (!Array.isArray(common.departments)) throw new Error('common.json의 departments를 확인해 주세요.');
const parts = common.departments.map(d => {
  if (!/^[a-z][a-z0-9-]*\.json$/.test(d.file || '')) throw new Error('학과 파일 이름을 확인해 주세요.');
  return readJSON(d.file);
});
// Validate everything before replacing either generated file.
const catalog = globalThis.SmalltalkData.assemble(common, parts);
const embedded = JSON.stringify(catalog).replaceAll('<', '\\u003c');
const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let html = readFileSync(join(root, 'index.html'), 'utf8')
  .replace(/<script id="offline-catalog" type="application\/json">[\s\S]*?<\/script>/, '')
  .replace(/<script src="\.\/assets\/data.js" defer><\/script>/g, '')
  .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHTML(common.app.title)}</title>`);
html = html.replace('<script src="./assets/app.js" defer></script>', () =>
  `<script id="offline-catalog" type="application/json">${embedded}</script><script src="./assets/data.js" defer></script><script src="./assets/app.js" defer></script>`);
if (!html.includes('id="offline-catalog"')) throw new Error('index.html의 app.js script 태그를 확인해 주세요.');
const style = readFileSync(join(root, 'assets/style.css'), 'utf8');
const app = readFileSync(join(root, 'assets/app.js'), 'utf8');
const data = readFileSync(join(root, 'assets/data.js'), 'utf8');
const inline = source => source.replaceAll('</script', '<\\/script');
const preview = html.replace('<html lang="ko">', '<html lang="ko" data-preview="standalone">')
  .replace('<link rel="stylesheet" href="./assets/style.css">', () => `<style>${style}</style>`)
  .replace('<script src="./assets/data.js" defer></script>', () => `<script>${inline(data)}</script>`)
  .replace('<script src="./assets/app.js" defer></script>', () => `<script>${inline(app)}</script>`);
writeFileSync(join(root, 'index.html'), html);
writeFileSync(join(root, 'preview.html'), preview);
console.log(`갱신 완료: ${catalog.departments.length}개 학과, ${catalog.expressions.length}개 표현. index.html과 preview.html을 새로고침하세요.`);
