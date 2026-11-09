// 离线冒烟测试：验证侧边栏折叠/展开状态机 + 入口元素 + 关键 CSS 规则
// 浏览器被本机沙箱禁止启动（Chrome/Edge 需要命名管道），因此用 mock DOM 直接跑状态机。
const fs = require('fs');
const path = require('path');
const root = __dirname;

function extractFunction(src, name) {
  const start = src.indexOf('function ' + name);
  if (start < 0) throw new Error('not found: ' + name);
  let i = src.indexOf('{', start);
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, j + 1);
    }
  }
  throw new Error('unbalanced: ' + name);
}

class ClassList {
  constructor(el) { this.el = el; this.set = new Set(); }
  add(...cs) { cs.forEach((c) => this.set.add(c)); }
  remove(...cs) { cs.forEach((c) => this.set.delete(c)); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    const on = force === undefined ? !this.set.has(c) : !!force;
    if (on) this.set.add(c); else this.set.delete(c);
    return on;
  }
  get value() { return [...this.set].join(' '); }
}
class El {
  constructor(tag) { this.tag = tag; this.classList = new ClassList(this); this.attrs = {}; this.textContent = ''; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k]; }
}

function makeEnv(width, opts = {}) {
  const sidebar = new El('aside');
  const shell = new El('div');
  const backdrop = new El('div');
  const menuBtn = new El('button');
  const foldBtn = new El('button');
  if (opts.collapsed) { sidebar.classList.add('collapsed'); shell.classList.add('sidebar-collapsed'); }

  const map = {
    sidebar,
    'sidebar-backdrop': backdrop,
    'mobile-menu': menuBtn,
    'sidebar-toggle-btn': foldBtn
  };
  const document = {
    getElementById: (id) => map[id] || null,
    querySelector: (sel) => (sel === '.app-shell' ? shell : null)
  };
  const window = { innerWidth: width, addEventListener() {} };
  return { document, window, sidebar, shell, backdrop, menuBtn, foldBtn };
}

function runAt(width, steps) {
  const env = makeEnv(width);
  const src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const code = extractFunction(src, 'syncSidebarState') + '\n' + extractFunction(src, 'toggleSidebar');
  const factory = new Function('document', 'window', 'SIDEBAR_BREAKPOINT', code + '\nreturn { toggleSidebar, syncSidebarState };');
  const api = factory(env.document, env.window, 680);
  const results = [];
  for (const step of steps) {
    if (step === 'toggle') api.toggleSidebar();
    if (step === 'collapse') api.toggleSidebar(true);
    if (step === 'expand') api.toggleSidebar(false);
    if (step === 'resize') { /* 由调用方另开 env */ }
    results.push({
      step,
      sbCollapsed: env.sidebar.classList.contains('collapsed'),
      shellCollapsed: env.shell.classList.contains('sidebar-collapsed'),
      sbOpen: env.sidebar.classList.contains('open'),
      backdropOpen: env.backdrop.classList.contains('open'),
      menuAria: env.menuBtn.getAttribute('aria-expanded'),
      foldIcon: env.foldBtn.textContent
    });
  }
  return { env, results };
}

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log('  PASS  ' + name); }
  else { failures++; console.log('  FAIL  ' + name + (detail ? '  → ' + detail : '')); }
}

console.log('[1] 桌面 1440px：折叠 → 再展开');
{
  const { env, results } = runAt(1440, ['toggle', 'toggle']);
  const [a, b] = results;
  check('第一次点击后 sidebar.collapsed', a.sbCollapsed);
  check('第一次点击后 .app-shell.sidebar-collapsed', a.shellCollapsed);
  check('顶栏按钮 aria-expanded=false', a.menuAria === 'false', a.menuAria);
  check('第二次点击后清除 collapsed', !b.sbCollapsed && !b.shellCollapsed);
  check('顶栏按钮 aria-expanded=true', b.menuAria === 'true', b.menuAria);
  check('brand 折叠图标回到 «', b.foldIcon === '«', JSON.stringify(b.foldIcon));
}

console.log('[2] 900px（旧代码 681~840 无反应的区间）：折叠 → 再展开');
{
  const { results } = runAt(900, ['toggle', 'toggle']);
  const [a, b] = results;
  check('点击生效（折叠）', a.sbCollapsed && a.shellCollapsed);
  check('再次点击生效（展开）', !b.sbCollapsed && !b.shellCollapsed);
}

console.log('[3] 移动端 500px：抽屉开关');
{
  const { results } = runAt(500, ['toggle', 'toggle']);
  const [a, b] = results;
  check('打开抽屉 sidebar.open', a.sbOpen);
  check('遮罩同步打开', a.backdropOpen);
  check('再次点击关闭抽屉', !b.sbOpen && !b.backdropOpen);
}

console.log('[4] 折叠态下 resize 到移动端不应残留桌面折叠类，反之亦然（状态互斥）');
{
  const { results } = runAt(1440, ['collapse']);
  check('桌面折叠后无 .open 残留', results[0].sbCollapsed && !results[0].sbOpen);
}

console.log('[5] HTML 入口元素检查');
{
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const brandBlock = html.slice(html.indexOf('<div class="brand">'), html.indexOf('</aside>'));
  check('折叠按钮位于 .brand 行内（不在 nav-list 里）', /class="brand"[\s\S]*id="sidebar-toggle-btn"[\s\S]*<\/div>\s*<div class="nav-group-label"/.test(brandBlock));
  check('折叠按钮不再出现在 nav-list 中', !/<nav class="nav-list">\s*<button[^>]*id="sidebar-toggle-btn"/.test(html));
  check('顶栏 ☰ 按钮存在', /id="mobile-menu"/.test(html));
  check('两个按钮都绑定了切换逻辑', /id="sidebar-toggle-btn"[^>]*onclick="toggleSidebar\(\)"/.test(html));
  const ver = (fs.readFileSync(path.join(root, 'app.js'), 'utf8').match(/const DATA_VERSION = '([0-9.]+)';/) || [])[1];
  check('style.css 引用版本与 DATA_VERSION 一致', html.includes('style.css?v=' + ver), ver);
  check('app.js 引用版本与 DATA_VERSION 一致', html.includes('app.js?v=' + ver), ver);
}

console.log('[6] CSS 关键规则检查');
{
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  check('.app-shell 为 flex 布局', /\.app-shell\s*\{[^}]*display:\s*flex/.test(css));
  check('折叠后 .main 复位 margin-left', /\.app-shell\.sidebar-collapsed\s+\.main\s*\{[^}]*margin-left:\s*0/.test(css));
  check('折叠后 .main 宽度占满', /\.app-shell\.sidebar-collapsed\s+\.main\s*\{[^}]*width:\s*100%/.test(css));
  check('折叠后 .sidebar 移出视口', /\.app-shell\.sidebar-collapsed\s+\.sidebar\s*\{[^}]*translateX\(-100%\)/.test(css));
  check('无效的 grid-template-columns 规则已移除', !/\.app-shell\.sidebar-collapsed\s*\{[^}]*grid-template-columns/.test(css));
  const mmDefault = /\.mobile-menu\s*\{[^}]*display:\s*inline-flex/.test(css);
  check('顶栏 ☰ 在桌面端常驻显示（inline-flex 默认值）', mmDefault);
  check('不存在把 .mobile-menu 默认隐藏的 display:none 规则', !/\.mobile-menu\s*\{[^}]*display:\s*none/.test(css));
}

console.log('[7] app.js 版本与断点一致性');
{
  const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  check('SIDEBAR_BREAKPOINT = 680', /const SIDEBAR_BREAKPOINT = 680;/.test(js));
  check('不再使用 window.innerWidth <= 840', !/innerWidth\s*<=\s*840/.test(js));
  check('DATA_VERSION 常量存在且为 x.y 形式', /const DATA_VERSION = '\d+\.\d+';/.test(js));
  check('版本比较使用 DATA_VERSION（不再硬编码 2.3/2.5）', !/storedVer\s*[!=]==\s*'2\.[0-9]'/.test(js));
  check('题库重建标志存在（防止 IndexedDB 旧数据盖掉新题库）', /let cardsRebuiltFromBuiltin = false;/.test(js));
  check('hydrate() 会跳过 IndexedDB 中的旧题库', /!cardsRebuiltFromBuiltin && storedVer === DATA_VERSION/.test(js));
  check('解析器会自动递增 DATA_VERSION', /nextVer/.test(fs.readFileSync(path.join(root, '_parse_cleaner.js'), 'utf8')));
}

console.log('\n' + (failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'));
process.exit(failures === 0 ? 0 : 1);