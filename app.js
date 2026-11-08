const SUBJECTS = [
  { id: 'china', name: '中国建筑史', files: 12, color: '#a56842', desc: '中国古代建筑、木构架与建筑群体' },
  { id: 'foreign', name: '外国建筑史', files: 12, color: '#53758b', desc: '古代文明、古典建筑与历史类型' },
  { id: 'modern', name: '外国近现代建筑史', files: 12, color: '#866e85', desc: '现代建筑运动、流派与代表作品' },
  { id: 'public', name: '公共建筑设计原理', files: 7, color: '#75866c', desc: '总体环境、空间组织与设计原则' },
];

const SAMPLE_CARDS = [
  { id: 'c1', subject: 'china', chapter: '绪论：中国古代建筑的特征', title: '木构架建筑的优缺点', level: 'high', body: '==**【1】优点**==：==**①取材方便**==；==**②适应性强**==；==**③有较强的抗震性能**==；==**④施工速度快**==；==**⑤便于修缮、搬迁**==。\n==**【2】缺点**==：==**①木材越来越少**==；==**②木架建筑易遭火灾、虫蚀、雨水侵蚀**==；==**③难以满足更大、更复杂空间需求**==。', source: '中国建筑史 / 1.md', tag: '结构体系', status: 'new', nextReview: null, reviewLog: [] },
  { id: 'c2', subject: 'china', chapter: '绪论：中国古代建筑的特征', title: '抬梁式与穿斗式对比', level: 'high', body: '==**①用料尺寸**==：抬梁式梁柱**用料硕大**，耗材多；穿斗式柱细密、穿枋断面小，**用料较小、省材**；\n==**②结构整体性**==：穿斗式纵横向由穿枋、斗枋串联成网架，**整体性与抗震性更强**；抬梁式需依赖纵向额枋、檩条加强联系；\n==**③营造的空间尺度**==：抬梁式可跨越大进深、减少室内柱数，**适合营造高大宽敞的宏伟空间**；穿斗式落地柱密集，**室内空间较局促**。', source: '中国建筑史 / 1.md', tag: '对比', status: 'new', nextReview: null, reviewLog: [] },
  { id: 'c3', subject: 'china', chapter: '绪论：中国古代建筑的特征', title: '庭院的作用', level: 'high', body: '==**【1】功能**==：作为室外起居、祭祀礼仪、交通联系与家务活动的延伸空间；\n==**【2】防卫**==：外墙封闭少窗，形成**内向围合空间**，兼具物理安全与私密归属感；\n==**【3】生态**==：调节微气候，满足**日照采光、自然通风、遮风挡沙与雨水收集排放**；\n==**【4】景观**==：植树栽花、叠石理水，将自然引入室内，实现**室内外空间与景致的交融**。', source: '中国建筑史 / 1.md', tag: '建筑群', status: 'new', nextReview: null, reviewLog: [] },
  { id: 'c4', subject: 'china', chapter: '绪论：中国古代建筑的特征', title: '斗栱的演变', level: 'normal', body: '唐宋时期布置**舒朗、用料硕大、结构作用明显**；明清时期排列**丛密、用料变小，装饰作用加强**。\n汉代称**“欂栌”**，宋代称**“铺作”**，明清称**“斗科”或“斗栱”**。', source: '中国建筑史 / 1.md', tag: '构件', status: 'new', nextReview: null, reviewLog: [] },
  { id: 'f1', subject: 'foreign', chapter: '古代建筑', title: '古典柱式的基本构成', level: 'normal', body: '古典柱式主要由**柱础、柱身和柱头**构成，上承**檐部（檐额、檐壁、檐口）**。\n不同柱式（多立克、爱奥尼、科林斯等）通过严格的**比例体系、装饰构件和柱头形式**形成独特的艺术特征。', source: '外国建筑史 / 1.md', tag: '名词', status: 'new', nextReview: null, reviewLog: [] },
  { id: 'm1', subject: 'modern', chapter: '现代建筑运动', title: '现代建筑的功能主义倾向', level: 'high', body: '强调**功能、结构和材料的真实表达**，反对不必要的历史主义复古装饰，追求**简洁、理性和适应现代工业化生产与现代生活**的空间形式。\n核心口号包括“形式追随功能”（沙利文）与“房屋是住人的机器”（柯布西耶）。', source: '外国近现代建筑史 / 1.md', tag: '理论', status: 'new', nextReview: null, reviewLog: [] },
  { id: 'p1', subject: 'public', chapter: '第一章 公共建筑的总体环境布局', title: '室内外空间的关系', level: 'high', body: '建筑室内与室外空间构成**完整的空间环境体系**：\n①彼此联系、相互延伸；\n②相互渗透、虚实交融；\n③相互补充，共同承载人群的行为活动与精神体验。', source: '公共建筑设计原理 / 1.md', tag: '原则', status: 'new', nextReview: null, reviewLog: [] },
];

const savedCards = JSON.parse(localStorage.getItem('arch-cards') || '[]');
const savedImported = JSON.parse(localStorage.getItem('arch-imported') || 'null');
function saveProgress() {
  const currentCard = cardRangeCards()[state.cardIndex];
  const progress = {
    view: state.view,
    rangeSubject: state.rangeSubject,
    rangeChapter: state.rangeChapter,
    cardIndex: state.cardIndex,
    lastCardId: currentCard ? currentCard.id : null,
    cardFilter: state.cardFilter,
    cardMode: state.cardMode
  };
  localStorage.setItem('arch-last-progress', JSON.stringify(progress));
  dbPut('last-progress', progress);
}

let savedProgress = null;
try {
  savedProgress = JSON.parse(localStorage.getItem('arch-last-progress'));
} catch (e) {}

let state = {
  view: savedProgress?.view || 'dashboard',
  subject: savedProgress?.rangeSubject || 'all',
  chapter: savedProgress?.rangeChapter || 'all',
  cardFilter: savedProgress?.cardFilter || 'all',
  cardMode: savedProgress?.cardMode || 'browse', // 'browse' | 'review'
  rangeSubject: savedProgress?.rangeSubject || 'all',
  rangeBook: 'all',
  rangeChapter: savedProgress?.rangeChapter || 'all',
  search: '',
  answerShown: false,
  cardIndex: typeof savedProgress?.cardIndex === 'number' ? savedProgress.cardIndex : 0,
  reviewIndex: 0,
  focusMode: JSON.parse(localStorage.getItem('arch-focus-mode') || 'false'),
  autoNextChapter: JSON.parse(localStorage.getItem('arch-auto-next') || 'true'), // 默认开启
  reviewed: JSON.parse(localStorage.getItem('arch-reviewed') || '[]'),
  lastReview: null,
  favorites: JSON.parse(localStorage.getItem('arch-favorites') || '[]'),
  imported: savedImported,
  cards: savedCards.length ? savedCards : [...SAMPLE_CARDS]
};

const $ = (selector) => document.querySelector(selector);
const content = $('#content');
let dbPromise = null;

function openDatabase() {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      const request = indexedDB.open('architecture-review', 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('app')) {
          request.result.createObjectStore('app', { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  }
  return dbPromise;
}

async function dbPut(key, value) {
  try {
    const db = await openDatabase();
    if (!db) return;
    const tx = db.transaction('app', 'readwrite');
    tx.objectStore('app').put({ key, value });
  } catch (err) {
    console.error('dbPut error:', err);
  }
}

async function dbGet(key) {
  try {
    const db = await openDatabase();
    if (!db) return null;
    return new Promise((resolve) => {
      const request = db.transaction('app').objectStore('app').get(key);
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('dbGet error:', err);
    return null;
  }
}

function save() {
  localStorage.setItem('arch-favorites', JSON.stringify(state.favorites));
  localStorage.setItem('arch-reviewed', JSON.stringify(state.reviewed));
  localStorage.setItem('arch-imported', JSON.stringify(state.imported));
  // 完整持久化所有当前卡片（无论是导入、自建、副本还是已编辑的示例卡片）
  localStorage.setItem('arch-cards', JSON.stringify(state.cards));

  dbPut('favorites', state.favorites);
  dbPut('reviewed', state.reviewed);
  dbPut('imported', state.imported);
  dbPut('cards', state.cards);

  updateChrome();
}

function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2200);
}

function allCards() {
  return state.cards;
}

function subjectName(id) {
  return SUBJECTS.find((s) => s.id === id)?.name || id;
}

function dueCards() {
  const now = Date.now();
  return allCards().filter((card) => !card.nextReview || new Date(card.nextReview).getTime() <= now);
}

function updateChrome() {
  const total = allCards().length;
  const due = dueCards().length;
  const favCount = state.favorites.length;

  const matEl = $('#nav-materials-count');
  if (matEl) matEl.textContent = total;

  const dueEl = $('#nav-due-count');
  if (dueEl) dueEl.textContent = due;

  const favEl = $('#nav-fav-count');
  if (favEl) favEl.textContent = favCount;

  const statusEl = $('#sidebar-import-status');
  if (statusEl) {
    if (state.imported && state.imported.count) {
      statusEl.textContent = `已导入 ${state.imported.count} 个文件，共 ${total} 个知识点。`;
    } else {
      statusEl.textContent = '当前使用内置示例卡片，可导入 Markdown 笔记建立完整题库。';
    }
  }

  // 顶栏清除搜索按钮状态
  const clearSearchBtn = $('#clear-search');
  if (clearSearchBtn) {
    clearSearchBtn.classList.toggle('hidden', !state.search);
  }
}

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatBody(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  // 取消正文红字，重点与加粗统一使用加粗表现，卡片右上角已专门标明重点
  // 支持 ==**重点**==、==重点==、**重点**
  html = html.replace(/==\*\*(.+?)\*\*==/g, '<strong class="hl-bold">$1</strong>');
  html = html.replace(/==(.+?)==/g, '<strong class="hl-bold">$1</strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="hl-bold">$1</strong>');
  // 保持换行与清晰排版
  html = html.replace(/\r?\n/g, '<br>');
  return html;
}

function subjectFromPath(path) {
  const normalized = (path || '').replace(/\\/g, '/');
  const name = normalized.split('/')[0] || '';
  if (name.includes('中国')) return 'china';
  if (name.includes('外国近现代') || name.includes('近现代')) return 'modern';
  if (name.includes('外国')) return 'foreign';
  if (name.includes('公共') || name.includes('原理')) return 'public';
  return 'china';
}

function stableId(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  return `import-${(hash >>> 0).toString(16)}`;
}

function cleanTitle(str) {
  return String(str || '')
    .replace(/^[（(【\d①②③④⑤⑥⑦⑧⑨⑩一二三四五六七八九十]+[、.)）】\s]*/, '')
    .replace(/^【\d+】\s*/, '')
    .replace(/[:：].*$/, '')
    .replace(/[*=]/g, '')
    .trim();
}

function parseMarkdown(file, text) {
  const lines = text.split(/\r?\n/);
  let chapter = file.name.replace(/\.md$/i, '');
  let current = null;
  const cards = [];

  const flush = () => {
    if (!current || !current.body.trim()) return;
    const body = current.body.trim();
    if (body.length < 3) return;
    cards.push({
      ...current,
      body,
      generated: true,
      type: 'short_answer',
      status: 'new',
      nextReview: null,
      reviewLog: [],
      id: stableId(`${current.source}|${current.title}|${cards.length}`)
    });
  };

  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('>') || line.startsWith('---')) continue;

    const heading = line.match(/^#{1,3}\s+(.+)/);
    if (heading) {
      if (line.startsWith('# ') || line.startsWith('## ')) {
        chapter = heading[1].replace(/[*=]/g, '').trim();
      }
      continue;
    }

    const high = line.match(/==\*\*(.+?)\*\*==/);
    const bold = line.match(/\*\*(.+?)\*\*/);

    const isMainNumbered = /^(?:==\*\*|\*\*)?\d+[、.][\s\S]*/.test(line);
    const isSoloHeader = /^(?:==\*\*[^*=]+?\*\*==|\*\*[^*]+?\*\*)$/.test(line);
    const isSubBullet = /^[（(【][\d①②③④⑤⑥⑦⑧⑨⑩一二三四五六七八九十]+[）)】]|^[①②③④⑤⑥⑦⑧⑨⑩]/.test(line);

    if (isMainNumbered || isSoloHeader) {
      flush();
      const match = high || bold;
      const title = match ? cleanTitle(match[1]) : cleanTitle(line);
      const isHeaderOnly = isSoloHeader || /^(?:==\*\*.+?\*\*==|\*\*.+?\*\*|\d+[、.].+?)$/.test(line.replace(/[:：]\s*$/, ''));
      current = {
        subject: subjectFromPath(file.webkitRelativePath || file.name),
        chapter,
        title: title || '重点知识点',
        level: high ? 'high' : (bold ? 'normal' : 'normal'),
        body: isHeaderOnly ? '' : line,
        source: file.webkitRelativePath || file.name,
        tag: '导入资料'
      };
      continue;
    }

    if (high || bold) {
      if (current && current.body === '') {
        current.body = line;
        if (high) current.level = 'high';
        continue;
      }

      if (current && isSubBullet) {
        current.body += '\n' + line;
        if (high) current.level = 'high';
        continue;
      }

      flush();
      const match = high || bold;
      current = {
        subject: subjectFromPath(file.webkitRelativePath || file.name),
        chapter,
        title: cleanTitle(match[1]) || '重点知识点',
        level: high ? 'high' : 'normal',
        body: line,
        source: file.webkitRelativePath || file.name,
        tag: '导入资料'
      };
    } else if (current) {
      current.body += '\n' + line;
    }
  }

  flush();
  return cards; // 彻底移除 .slice(0, 80)
}

function go(view) {
  state.view = view;
  layout();
}

function openSubject(id) {
  state.subject = id;
  state.rangeSubject = id;
  state.rangeBook = 'all';
  state.rangeChapter = 'all';
  state.view = 'materials';
  layout();
}

function setSubject(id) {
  state.subject = id;
  render();
}

function setChapter(chapter) {
  state.chapter = chapter;
  render();
}

function layout() {
  document.querySelectorAll('.nav-item[data-view]').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === state.view);
  });
  const names = {
    dashboard: '学习总览 / 今日状态',
    materials: '资料浏览 / 知识点',
    cards: '复习卡片 / 记忆练习',
    mistakes: '错题与收藏 / 重点突破',
    settings: '设置 / 本地数据'
  };
  const crumbEl = $('#crumb');
  if (crumbEl) crumbEl.textContent = names[state.view] || '学习总览';
  updateChrome();
  render();
}

function render() {
  document.body.classList.toggle('cards-view', state.view === 'cards');
  const viewMap = {
    dashboard,
    materials,
    cards: cardsV2,
    mistakes,
    settings
  };
  const renderFn = viewMap[state.view] || dashboard;
  renderFn();
}

// ---------------- 视图 1: 学习总览 Dashboard ----------------
function dashboard() {
  const all = allCards();
  const total = all.length;
  const due = dueCards().length;
  const masterCount = all.filter((c) => (c.reviewLog || []).some((l) => l.rating >= 2)).length;
  const studyDays = Math.max(1, Math.min(14, new Set(all.flatMap((c) => (c.reviewLog || []).map((l) => l.at?.slice(0, 10)))).size || 1));

  // 计算每门科目的卡片总数与掌握比例
  const subjectsData = SUBJECTS.map((s) => {
    const subCards = all.filter((c) => c.subject === s.id);
    const count = subCards.length;
    const mastered = subCards.filter((c) => (c.reviewLog || []).some((l) => l.rating >= 2)).length;
    const pct = count ? Math.round((mastered / count) * 100) : 0;
    return { ...s, count, mastered, pct };
  });

  // 最近复习记录
  const recentLogs = [];
  all.forEach((card) => {
    (card.reviewLog || []).forEach((log) => {
      recentLogs.push({ card, ...log });
    });
  });
  recentLogs.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const displayRecents = recentLogs.slice(0, 5);

  const ratingNames = ['忘记', '困难', '记住', '熟练'];

  content.innerHTML = `
    <div class="welcome">
      <div>
        <p class="eyebrow">ARCHITECTURAL MEMORY · 建筑考研高效记忆</p>
        <h1 class="page-title">今天，记住建筑。</h1>
        <p class="page-subtitle">按艾宾浩斯遗忘曲线科学复习，强化核心考点与作图构件。</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="primary" onclick="startBrowse()">开始浏览卡片 →</button>
        ${due > 0 ? `<button class="primary" style="background:var(--accent)" onclick="startReview()">今日待复习 (${due}) →</button>` : ''}
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <label>全部卡片</label>
        <strong>${total}</strong>
        <em>${state.imported ? `来自 ${state.imported.count} 个 Markdown 笔记` : '内置标准卡片库'}</em>
      </div>
      <div class="stat">
        <label>今日待复习</label>
        <strong style="color:${due > 0 ? 'var(--accent)' : 'inherit'}">${due}</strong>
        <em>${due > 0 ? '按遗忘曲线推荐' : '今日复习已全部完成'}</em>
      </div>
      <div class="stat">
        <label>已掌握考点</label>
        <strong>${masterCount}</strong>
        <em>掌握率 ${total ? Math.round((masterCount / total) * 100) : 0}%</em>
      </div>
      <div class="stat">
        <label>复习天数</label>
        <strong>${studyDays} 天</strong>
        <em>保持每日节奏</em>
      </div>
    </div>

    <div class="grid-2">
      <section class="section-panel">
        <div class="panel-head">
          <h2>考研科目</h2>
          <button class="text-link" onclick="go('materials')">进入资料库 →</button>
        </div>
        <div class="subject-list">
          ${subjectsData.map((s) => `
            <button class="subject-row" onclick="openSubject('${s.id}')">
              <i class="subject-dot" style="background:${s.color}"></i>
              <span>
                <strong>${escapeHtml(s.name)}</strong>
                <small>${s.count} 个考点 · ${escapeHtml(s.desc)}</small>
              </span>
              <div class="progress"><i style="width:${Math.max(s.pct, 4)}%;background:${s.color}"></i></div>
              <small>${s.pct}%</small>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="section-panel">
        <div class="panel-head">
          <h2>最近复习动态</h2>
          <button class="text-link" onclick="startBrowse()">继续卡片 →</button>
        </div>
        <div class="review-list">
          ${displayRecents.length ? displayRecents.map((item) => `
            <div class="review-item">
              <span>
                <strong>${escapeHtml(item.card.title)}</strong>
                <small>${escapeHtml(subjectName(item.card.subject))} · ${escapeHtml(item.card.chapter)} · ${formatTime(item.at)}</small>
              </span>
              <span class="tag ${item.rating >= 2 ? 'accent' : ''}">${ratingNames[item.rating] || '已测'}</span>
            </div>
          `).join('') : `
            <div class="review-item">
              <span>
                <strong>尚未进行卡片测试</strong>
                <small>点击上方“开始浏览卡片”或选择科目开启复习之旅</small>
              </span>
              <span class="tag">未开始</span>
            </div>
          `}
        </div>
      </section>
    </div>
  `;
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);
  if (diffSec < 60) return '刚刚';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小时前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ---------------- 视图 2: 资料浏览 Materials ----------------
function materials() {
  const all = allCards();
  const chapters = [...new Set(all
    .filter((k) => state.subject === 'all' || k.subject === state.subject)
    .map((k) => k.chapter)
    .filter(Boolean)
  )];

  const searchKeyword = (state.search || '').trim().toLowerCase();
  const list = all.filter((k) => {
    if (state.subject !== 'all' && k.subject !== state.subject) return false;
    if (state.chapter !== 'all' && k.chapter !== state.chapter) return false;
    if (searchKeyword) {
      const match = `${k.title} ${k.body} ${k.chapter} ${k.tag || ''}`.toLowerCase();
      if (!match.includes(searchKeyword)) return false;
    }
    return true;
  });

  content.innerHTML = `
    <div class="view-head">
      <div>
        <p class="eyebrow">KNOWLEDGE LIBRARY</p>
        <h1 class="page-title">资料浏览</h1>
        <p class="page-subtitle">${state.imported ? `当前资料库已收录 ${all.length} 个知识点（来自 ${state.imported.count} 个文件）` : '先按章节查阅资料，查看高亮考点，或直接加入复习。'}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="ghost" onclick="$('#folder-input').click()">导入文件夹</button>
        <button class="primary" onclick="$('#files-input').click()">导入文件</button>
      </div>
    </div>

    <div class="filter-row">
      <button class="filter ${state.subject === 'all' ? 'active' : ''}" onclick="setSubject('all')">全部科目 (${all.length})</button>
      ${SUBJECTS.map((s) => {
        const count = all.filter((c) => c.subject === s.id).length;
        return `<button class="filter ${state.subject === s.id ? 'active' : ''}" onclick="setSubject('${s.id}')">${escapeHtml(s.name)} (${count})</button>`;
      }).join('')}
    </div>

    <div class="filter-row">
      <select class="filter" onchange="setChapter(this.value)">
        <option value="all">全部章节 (${chapters.length} 个章节)</option>
        ${chapters.map((c) => `<option value="${escapeAttr(c)}" ${state.chapter === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
      </select>
      ${searchKeyword ? `<span class="tag" style="margin-left:auto;">搜索词：“${escapeHtml(state.search)}” · 找到 ${list.length} 条</span>` : ''}
    </div>

    <section class="section-panel material-index">
      <div class="panel-head">
        <h2>知识点列表</h2>
        <span class="tag">${list.length} 条</span>
      </div>
      ${list.length ? list.map(materialRowHTML).join('') : '<div class="empty">没有匹配的知识点。尝试更换科目或清除搜索条件。</div>'}
    </section>
  `;
}

function materialRowHTML(k) {
  const isFav = state.favorites.includes(k.id);
  return `
    <div class="material-row">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span class="tag ${k.level === 'high' ? 'accent' : ''}">${k.level === 'high' ? '重点考点' : '基础知识'}</span>
          <small style="color:var(--muted)">${escapeHtml(subjectName(k.subject))} · ${escapeHtml(k.chapter)}</small>
        </div>
        <h3 style="margin:0 0 8px 0;font-size:16px;">${escapeHtml(k.title)}</h3>
        <p class="material-body-preview" style="color:var(--body);line-height:1.6;font-size:14px;margin:0 0 8px 0;">${formatBody(k.body)}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-self:flex-start;">
        <button class="small-btn primary-soft" onclick="addReview('${escapeAttr(k.id)}')">加入复习</button>
        <button class="small-btn" onclick="toggleFav('${escapeAttr(k.id)}')">${isFav ? '★ 已收藏' : '☆ 收藏'}</button>
      </div>
    </div>
  `;
}

// ---------------- 视图 3: 复习卡片 CardsV2 ----------------
function cardRangeCards() {
  let deck = allCards();
  if (state.cardFilter === 'high') deck = deck.filter((c) => c.level === 'high');
  if (state.cardFilter === 'due') {
    const now = Date.now();
    deck = deck.filter((c) => !c.nextReview || new Date(c.nextReview).getTime() <= now);
  }
  if (state.cardFilter === 'favorite') deck = deck.filter((c) => state.favorites.includes(c.id));
  if (state.rangeSubject !== 'all') deck = deck.filter((c) => c.subject === state.rangeSubject);
  if (state.rangeChapter !== 'all') deck = deck.filter((c) => c.chapter === state.rangeChapter);
  return deck;
}

function cardsV2() {
  const all = allCards();
  const subjects = [...new Set(all.map((c) => c.subject))];
  const chapters = [...new Set(all
    .filter((c) => state.rangeSubject === 'all' || c.subject === state.rangeSubject)
    .map((c) => c.chapter)
    .filter(Boolean)
  )];

  const deck = cardRangeCards();

  if (!deck.length) {
    content.innerHTML = `
      <div class="view-head">
        <div>
          <p class="eyebrow">CARD REVIEW</p>
          <h1 class="page-title">复习卡片</h1>
          <p class="page-subtitle">${state.cardMode === 'browse' ? '【浏览模式】正文已展开，左右滑动或方向键切换' : '【主动回忆模式】先尝试在脑海中回忆核心要点，再看参考答案'}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="ghost" onclick="newCard()">＋ 自建卡片</button>
          <button class="ghost" onclick="exportAnki()">导出 Anki</button>
        </div>
      </div>

      <div class="mode-tabs">
        <button class="mode-tab ${state.cardMode === 'browse' ? 'active' : ''}" onclick="setCardMode('browse')">📖 知识卡片浏览</button>
        <button class="mode-tab ${state.cardMode === 'review' ? 'active' : ''}" onclick="setCardMode('review')">🧠 艾宾浩斯自测复习</button>
      </div>

      <div class="range-panel section-panel">
        <div class="range-title">复习范围定制</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <select class="filter" onchange="setRange('subject', this.value)">
            <option value="all">全部科目</option>
            ${subjects.map((s) => `<option value="${escapeAttr(s)}" ${state.rangeSubject === s ? 'selected' : ''}>${escapeHtml(subjectName(s))}</option>`).join('')}
          </select>
          <select class="filter" onchange="setRange('chapter', this.value)">
            <option value="all">全部章节 (${chapters.length})</option>
            ${chapters.map((c) => `<option value="${escapeAttr(c)}" ${state.rangeChapter === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
          </select>
          <span style="font-size:13px;color:var(--muted);margin-left:auto;">当前筛选无卡片</span>
        </div>
      </div>

      <div class="filter-row">
        <button class="filter ${state.cardFilter === 'all' ? 'active' : ''}" onclick="setCardFilter('all')">全部 (${all.length})</button>
        <button class="filter ${state.cardFilter === 'due' ? 'active' : ''}" onclick="setCardFilter('due')">待复习 (${dueCards().length})</button>
        <button class="filter ${state.cardFilter === 'high' ? 'active' : ''}" onclick="setCardFilter('high')">核心考点</button>
        <button class="filter ${state.cardFilter === 'favorite' ? 'active' : ''}" onclick="setCardFilter('favorite')">我的收藏 (${state.favorites.length})</button>
      </div>

      <div class="empty">
        <p>当前筛选范围内暂无卡片。</p>
        <button class="primary" style="margin-top:12px;" onclick="resetCardFilters()">重置筛选条件</button>
      </div>
    `;
    return;
  }

  // 保证卡片游标在合法范围内
  if (state.cardIndex >= deck.length) state.cardIndex = 0;
  if (state.cardIndex < 0) state.cardIndex = deck.length - 1;
  const k = deck[state.cardIndex];
  const isFav = state.favorites.includes(k.id);

  content.innerHTML = `
    <div class="view-head">
      <div>
        <p class="eyebrow">CARD REVIEW</p>
        <h1 class="page-title">复习卡片</h1>
        <p class="page-subtitle">${state.cardMode === 'browse' ? '【浏览模式】正文已展开，左右滑动或方向键切换' : '【主动回忆模式】先尝试在脑海中回忆核心要点，再看参考答案'}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button class="ghost ${state.focusMode ? 'active' : ''}" onclick="toggleFocusMode()" title="快捷键 F 切换专注模式">
          ${state.focusMode ? '🔍 退出专注 (F)' : '🎯 专注模式 (F)'}
        </button>
        <button class="ghost ${state.autoNextChapter ? 'active' : ''}" onclick="toggleAutoNext()" title="章节结束后自动衔接下一章">
          ${state.autoNextChapter ? '⏩ 自动衔接已开启' : '⏭️ 自动衔接已关闭'}
        </button>
        <button class="ghost" onclick="nextChapter()" title="跳转至下一章">⏭️ 下一章</button>
        <button class="ghost" onclick="newCard()">＋ 自建卡片</button>
        <button class="ghost" onclick="exportAnki()">导出 Anki</button>
      </div>
    </div>

    <div class="mode-tabs">
      <button class="mode-tab ${state.cardMode === 'browse' ? 'active' : ''}" onclick="setCardMode('browse')">📖 知识卡片浏览</button>
      <button class="mode-tab ${state.cardMode === 'review' ? 'active' : ''}" onclick="setCardMode('review')">🧠 艾宾浩斯自测复习</button>
    </div>

    <div class="range-panel section-panel">
      <div class="range-title">复习范围定制</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <select class="filter" onchange="setRange('subject', this.value)">
          <option value="all">全部科目</option>
          ${subjects.map((s) => `<option value="${escapeAttr(s)}" ${state.rangeSubject === s ? 'selected' : ''}>${escapeHtml(subjectName(s))}</option>`).join('')}
        </select>
        <select class="filter" onchange="setRange('chapter', this.value)">
          <option value="all">全部章节 (${chapters.length})</option>
          ${chapters.map((c) => `<option value="${escapeAttr(c)}" ${state.rangeChapter === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
        </select>
        <span style="font-size:13px;color:var(--muted);margin-left:auto;">当前共 <b>${deck.length}</b> 张卡片 · 正在看第 <b>${state.cardIndex + 1}</b> 张</span>
      </div>
    </div>

    <div class="filter-row">
      <button class="filter ${state.cardFilter === 'all' ? 'active' : ''}" onclick="setCardFilter('all')">全部 (${all.length})</button>
      <button class="filter ${state.cardFilter === 'due' ? 'active' : ''}" onclick="setCardFilter('due')">待复习 (${dueCards().length})</button>
      <button class="filter ${state.cardFilter === 'high' ? 'active' : ''}" onclick="setCardFilter('high')">核心考点</button>
      <button class="filter ${state.cardFilter === 'favorite' ? 'active' : ''}" onclick="setCardFilter('favorite')">我的收藏 (${state.favorites.length})</button>
    </div>

    <div class="card-study-layout ${state.focusMode ? 'focus-layout' : ''}">
      <section class="review-card single-card swipe-card ${state.focusMode ? 'focus-card' : ''}" id="swipe-card">
        <div class="card-meta">
          <span>${escapeHtml(subjectName(k.subject))} · ${escapeHtml(k.chapter)}</span>
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="ghost-btn-micro" onclick="toggleFocusMode()" title="快捷键 F 切换专注模式">
              ${state.focusMode ? '退出专注' : '专注'}
            </button>
            <span class="tag ${k.level === 'high' ? 'accent' : ''}">${k.level === 'high' ? '核心考点' : '次重点'}</span>
          </div>
        </div>

        <div class="question ${k.level === 'high' ? 'high' : ''}">
          ${escapeHtml(k.title)}
          <small class="question-prompt">请回答核心考点与原理：</small>
        </div>

        ${state.cardMode === 'browse' || state.answerShown ? `
          <div class="answer">
            ${formatBody(k.body)}
          </div>
        ` : `
          <div class="answer-reveal-box" onclick="showCardAnswer()">
            <div class="reveal-badge">
              <span class="reveal-icon">💡</span>
              <strong>点击或按空格展开解析</strong>
            </div>
            <small>先在心里尝试回忆关键考点，主动回忆效果最佳</small>
          </div>
        `}

        ${state.cardMode === 'review' ? `
          <div class="rating-row">
            <button class="rating r-0" onclick="rateCard('${escapeAttr(k.id)}', 0)">忘记<small>当天重来 [1]</small></button>
            <button class="rating r-1" onclick="rateCard('${escapeAttr(k.id)}', 1)">困难<small>1 天后 [2]</small></button>
            <button class="rating r-2" onclick="rateCard('${escapeAttr(k.id)}', 2)">记住<small>3 天后 [3]</small></button>
            <button class="rating r-3" onclick="rateCard('${escapeAttr(k.id)}', 3)">熟练<small>7 天后 [4]</small></button>
          </div>
        ` : ''}

        <div class="card-footer-bar">
          <div class="card-actions">
            <button class="small-btn ${isFav ? 'active-fav' : ''}" onclick="toggleFav('${escapeAttr(k.id)}')">${isFav ? '★ 已收藏' : '☆ 收藏'}</button>
            <button class="small-btn" onclick="editCard('${escapeAttr(k.id)}')">编辑</button>
            <button class="small-btn" onclick="copyCard('${escapeAttr(k.id)}')">复制</button>
            <button class="small-btn" onclick="deleteCard('${escapeAttr(k.id)}')">删除</button>
            ${state.lastReview ? `<button class="small-btn" onclick="undoReview()">撤销上次评分</button>` : ''}
          </div>
        </div>

        <div class="swipe-controls">
          <div style="display:flex;flex-direction:column;gap:10px;width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <button class="small-btn" onclick="previousCard()" title="快捷键 A 或 ←">← 上一张</button>
              <div class="swipe-progress">
                <span>${state.cardIndex + 1} / ${deck.length}</span>
                <div class="swipe-progress-bar"><i style="width:${Math.round(((state.cardIndex + 1) / deck.length) * 100)}%"></i></div>
              </div>
              <button class="small-btn" onclick="nextCard()" title="快捷键 D 或 →">下一张 →</button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <button class="small-btn" onclick="previousChapter()">上一章</button>
              <button class="small-btn" onclick="nextChapter()">下一章</button>
            </div>
          </div>
        </div>

        <div class="card-meta card-meta-bottom">
          <span>来源：${escapeHtml(k.source || '自定义卡片')}</span>
          <span>${k.status ? `状态：${k.status}` : ''}</span>
          ${k.nextReview ? `<span>下次复习：${k.nextReview.slice(0, 10)}</span>` : ''}
        </div>
      </section>

      ${state.focusMode ? '' : `
      <aside class="section-panel card-directory">
        <div class="panel-head">
          <h2>章节知识点</h2>
          <span class="tag">${deck.length} 条</span>
        </div>
        <div class="review-list" id="card-directory">
          ${deck.map((c, i) => `
            <button class="directory-item ${i === state.cardIndex ? 'selected' : ''}" onclick="selectCard(${i})" title="${escapeAttr(c.title)} (${escapeAttr(c.chapter || '')})">
              <span class="directory-item-main">
                <strong>${escapeHtml(c.title)}</strong>
                <small>${escapeHtml(c.chapter || '未归类章节')}</small>
              </span>
              ${c.level === 'high' ? '<span class="tag accent mini">重点</span>' : ''}
            </button>
          `).join('')}
        </div>
      </aside>
      `}
    </div>
  `;

  bindSwipe();
  scrollDirectoryIntoView();
}

function resetCardFilters() {
  state.cardFilter = 'all';
  state.rangeSubject = 'all';
  state.rangeChapter = 'all';
  state.cardIndex = 0;
  state.answerShown = false;
  render();
}

function startBrowse() {
  state.view = 'cards';
  state.cardMode = 'browse';
  state.cardFilter = 'all';
  // 保留用户原本看书的进度，如果超出则归零
  const deck = cardRangeCards();
  if (state.cardIndex >= deck.length) state.cardIndex = 0;
  state.answerShown = false;
  saveProgress();
  layout();
}

function startReview() {
  state.view = 'cards';
  state.cardMode = 'review';
  state.cardFilter = dueCards().length ? 'due' : 'all';
  state.cardIndex = 0;
  state.answerShown = false;
  saveProgress();
  layout();
}

function setCardMode(mode) {
  state.cardMode = mode;
  state.answerShown = false;
  render();
}

function setCardFilter(filter) {
  state.cardFilter = filter;
  state.cardIndex = 0;
  state.answerShown = false;
  render();
}

function setRange(type, value) {
  if (type === 'subject') {
    state.rangeSubject = value;
    state.rangeChapter = 'all';
  } else if (type === 'chapter') {
    state.rangeChapter = value;
  }
  state.cardIndex = 0;
  state.answerShown = false;
  saveProgress();
  render();
}

function getChapters(subject) {
  const all = allCards();
  return [...new Set(all
    .filter((c) => subject === 'all' || c.subject === subject)
    .map((c) => c.chapter)
    .filter(Boolean)
  )];
}

function previousCard() {
  const deck = cardRangeCards();
  if (!deck.length) return;

  // 如果已是第一张卡片，且开启了自动衔接：自动跳转到上一章的最后一张
  if (state.cardIndex === 0 && state.autoNextChapter) {
    const chapters = getChapters(state.rangeSubject);
    let curChapter = state.rangeChapter;
    if (curChapter === 'all' && deck[0]) {
      curChapter = deck[0].chapter;
    }
    const currentChapterIdx = chapters.indexOf(curChapter);
    if (currentChapterIdx > 0) {
      const prevChap = chapters[currentChapterIdx - 1];
      state.rangeChapter = prevChap;
      const prevDeck = cardRangeCards();
      state.cardIndex = Math.max(0, prevDeck.length - 1);
      state.answerShown = false;
      saveProgress();
      toast(`已自动切换至上一章：${prevChap} (末页)`);
      render();
      return;
    }
  }

  state.cardIndex = (state.cardIndex - 1 + deck.length) % deck.length;
  state.answerShown = false;
  saveProgress();
  render();
}

function nextCard() {
  const deck = cardRangeCards();
  if (!deck.length) return;

  // 如果已是最后一张卡片，且开启了自动衔接：自动跳转到下一章的第一张
  if (state.cardIndex === deck.length - 1 && state.autoNextChapter) {
    const chapters = getChapters(state.rangeSubject);
    let curChapter = state.rangeChapter;
    if (curChapter === 'all' && deck[state.cardIndex]) {
      curChapter = deck[state.cardIndex].chapter;
    }
    const currentChapterIdx = chapters.indexOf(curChapter);
    if (currentChapterIdx !== -1 && currentChapterIdx < chapters.length - 1) {
      const nextChap = chapters[currentChapterIdx + 1];
      state.rangeChapter = nextChap;
      state.cardIndex = 0;
      state.answerShown = false;
      saveProgress();
      toast(`章节已自动切换至：${nextChap}`);
      render();
      return;
    }
  }

  state.cardIndex = (state.cardIndex + 1) % deck.length;
  state.answerShown = false;
  saveProgress();
  render();
}

function nextChapter() {
  const chapters = getChapters(state.rangeSubject);
  if (!chapters.length) {
    toast('当前没有可用章节');
    return;
  }
  const deck = cardRangeCards();
  const currentCard = deck[state.cardIndex];
  let curChapter = state.rangeChapter;
  if (curChapter === 'all' && currentCard) {
    curChapter = currentCard.chapter;
  }
  const currentChapterIdx = chapters.indexOf(curChapter);
  if (currentChapterIdx !== -1 && currentChapterIdx < chapters.length - 1) {
    const nextChap = chapters[currentChapterIdx + 1];
    state.rangeChapter = nextChap;
    state.cardIndex = 0;
    state.answerShown = false;
    saveProgress();
    toast(`已切换至下一章：${nextChap}`);
    render();
  } else {
    toast('已经是最后一章了');
  }
}

function previousChapter() {
  const chapters = getChapters(state.rangeSubject);
  if (!chapters.length) {
    toast('当前没有可用章节');
    return;
  }
  const deck = cardRangeCards();
  const currentCard = deck[state.cardIndex];
  let curChapter = state.rangeChapter;
  if (curChapter === 'all' && currentCard) {
    curChapter = currentCard.chapter;
  }
  const currentChapterIdx = chapters.indexOf(curChapter);
  if (currentChapterIdx > 0) {
    const prevChap = chapters[currentChapterIdx - 1];
    state.rangeChapter = prevChap;
    state.cardIndex = 0;
    state.answerShown = false;
    saveProgress();
    toast(`已切换至上一章：${prevChap}`);
    render();
  } else {
    toast('已经是第一章了');
  }
}

function toggleAutoNext() {
  state.autoNextChapter = !state.autoNextChapter;
  localStorage.setItem('arch-auto-next', JSON.stringify(state.autoNextChapter));
  toast(state.autoNextChapter ? '已开启章节自动衔接' : '已关闭章节自动衔接');
  render();
}

function selectCard(index) {
  const deck = cardRangeCards();
  if (!deck.length) return;
  const target = Math.max(0, Math.min(index, deck.length - 1));
  state.cardIndex = target;
  state.answerShown = false;
  saveProgress();
  render();
}

function scrollDirectoryIntoView() {
  const list = $('#card-directory');
  if (!list) return;
  const selected = list.querySelector('.directory-item.selected');
  if (!selected) return;
  const listTop = list.scrollTop;
  const listBottom = listTop + list.clientHeight;
  const itemTop = selected.offsetTop;
  const itemBottom = itemTop + selected.offsetHeight;
  if (itemTop < listTop || itemBottom > listBottom) {
    list.scrollTop = Math.max(0, itemTop - list.clientHeight / 2 + selected.offsetHeight / 2);
  }
}

function bindSwipe() {
  const card = $('#swipe-card');
  if (!card) return;
  let startX = 0;
  card.ontouchstart = (e) => {
    startX = e.changedTouches[0].screenX;
  };
  card.ontouchend = (e) => {
    const delta = e.changedTouches[0].screenX - startX;
    if (Math.abs(delta) > 45) {
      if (delta < 0) nextCard();
      else previousCard();
    }
  };
}

function toggleFocusMode() {
  state.focusMode = !state.focusMode;
  localStorage.setItem('arch-focus-mode', JSON.stringify(state.focusMode));
  toast(state.focusMode ? '已开启沉浸专注模式（隐藏目录与干扰，快捷键 F）' : '已退出专注模式');
  render();
}

function showCardAnswer() {
  state.answerShown = true;
  render();
}

function rateCard(id, rating) {
  rate(id, rating);
  const deck = cardRangeCards();
  if (deck.length > 0) {
    state.cardIndex = state.cardIndex % deck.length;
  } else {
    state.cardIndex = 0;
  }
  state.answerShown = false;
  render();
}

function rate(id, i) {
  const card = allCards().find((item) => item.id === id);
  const intervals = [0, 1, 3, 7];
  if (card) {
    state.lastReview = {
      id,
      status: card.status,
      nextReview: card.nextReview,
      reviewLog: [...(card.reviewLog || [])]
    };
    card.status = i === 0 ? 'learning' : 'review';
    card.nextReview = new Date(Date.now() + intervals[i] * 86400000).toISOString();
    card.reviewLog = [...(card.reviewLog || []), { at: new Date().toISOString(), rating: i }];
  }
  if (!state.reviewed.includes(id)) {
    state.reviewed.push(id);
  }
  save();
  toast(i === 0 ? '已标记为需巩固' : '已记录复习进度');
}

function undoReview() {
  if (!state.lastReview) return;
  const card = allCards().find((item) => item.id === state.lastReview.id);
  if (card) {
    card.status = state.lastReview.status;
    card.nextReview = state.lastReview.nextReview;
    card.reviewLog = state.lastReview.reviewLog;
    state.reviewed = state.reviewed.filter((id) => id !== card.id);
    save();
  }
  state.lastReview = null;
  toast('已撤销上次评价');
  render();
}

function addReview(id) {
  const card = allCards().find((item) => item.id === id);
  if (!card) return;
  card.nextReview = new Date().toISOString(); // 设定为立即到期
  save();
  state.view = 'cards';
  state.cardMode = 'review';
  state.cardFilter = 'due';
  const deck = cardRangeCards();
  const idx = deck.findIndex((c) => c.id === id);
  state.cardIndex = idx >= 0 ? idx : 0;
  state.answerShown = false;
  layout();
  toast(`“${card.title}” 已加入今日复习`);
}

function toggleFav(id) {
  const exists = state.favorites.includes(id);
  state.favorites = exists ? state.favorites.filter((x) => x !== id) : [...state.favorites, id];
  save();
  toast(exists ? '已取消收藏' : '已加入收藏');
  render();
}

function newCard() {
  const title = prompt('请输入新知识点标题 / 核心考点：');
  if (!title?.trim()) return;
  const body = prompt('请输入参考答案（支持 **粗体** 或 ==**重点**==）：');
  if (!body?.trim()) return;

  const card = {
    id: `custom-${Date.now()}`,
    subject: state.rangeSubject !== 'all' ? state.rangeSubject : (state.subject !== 'all' ? state.subject : 'china'),
    chapter: state.rangeChapter !== 'all' ? state.rangeChapter : '自建核心考点',
    title: title.trim(),
    body: body.trim(),
    level: 'high',
    source: '自定义添加',
    tag: '自建卡片',
    type: 'short_answer',
    status: 'new',
    nextReview: new Date().toISOString(),
    reviewLog: [],
    generated: true
  };

  state.cards.unshift(card);
  save();
  toast('新考点卡片已创建并置顶');
  render();
}

function editCard(id) {
  const card = allCards().find((item) => item.id === id);
  if (!card) return;
  const title = prompt('修改卡片考点标题：', card.title);
  if (!title?.trim()) return;
  const body = prompt('修改参考答案：', card.body);
  if (!body?.trim()) return;

  card.title = title.trim();
  card.body = body.trim();
  save();
  toast('卡片内容已更新');
  render();
}

function copyCard(id) {
  const card = allCards().find((item) => item.id === id);
  if (!card) return;
  const copy = {
    ...card,
    id: `custom-${Date.now()}`,
    title: `${card.title}（副本）`,
    level: card.level || 'normal',
    source: '自定义副本',
    status: 'new',
    nextReview: null,
    reviewLog: [],
    generated: true
  };
  state.cards.unshift(copy);
  save();
  toast('已生成卡片副本');
  render();
}

function deleteCard(id) {
  const card = allCards().find((item) => item.id === id);
  if (!card || !confirm(`确定删除考点卡片“${card.title}”吗？`)) return;
  state.cards = state.cards.filter((item) => item.id !== id);
  state.favorites = state.favorites.filter((item) => item !== id);
  save();
  state.cardIndex = Math.max(0, state.cardIndex - 1);
  toast('卡片已删除');
  render();
}

// ---------------- 视图 4: 错题与收藏 Mistakes ----------------
function mistakes() {
  const favs = allCards().filter((k) => state.favorites.includes(k.id));
  const difficults = allCards().filter((k) => (k.reviewLog || []).some((l) => l.rating === 0 || l.rating === 1));

  content.innerHTML = `
    <div class="view-head">
      <div>
        <p class="eyebrow">HIGH PRIORITY REVIEW</p>
        <h1 class="page-title">错题与收藏</h1>
        <p class="page-subtitle">集中攻克模糊考点与易错要点，针对性突破薄弱环节。</p>
      </div>
    </div>

    <section class="section-panel" style="margin-bottom:24px;">
      <div class="panel-head">
        <h2>已收藏知识点</h2>
        <span class="tag accent">${favs.length} 条</span>
      </div>
      ${favs.length ? `
        <div class="material-index">
          ${favs.map(materialRowHTML).join('')}
        </div>
      ` : '<div class="empty">暂无收藏卡片。在资料浏览或复习卡片中点击“★ 收藏”即可归纳在此。</div>'}
    </section>

    <section class="section-panel">
      <div class="panel-head">
        <h2>易错与遗忘考点</h2>
        <span class="tag">${difficults.length} 条</span>
      </div>
      ${difficults.length ? `
        <div class="material-index">
          ${difficults.map(materialRowHTML).join('')}
        </div>
      ` : '<div class="empty">暂无易错记录。自测复习时评为“忘记”或“困难”的卡片将自动归集。</div>'}
    </section>
  `;
}

// ---------------- 视图 5: 设置 Settings ----------------
function settings() {
  const total = allCards().length;
  const importedCount = state.imported ? state.imported.count : 0;

  const isIndexedDBSupported = 'indexedDB' in window;

  content.innerHTML = `
    <div class="view-head">
      <div>
        <p class="eyebrow">LOCAL DATABASE & SETTINGS</p>
        <h1 class="page-title">数据与设置</h1>
        <p class="page-subtitle">所有笔记、复习记录均保存在本地浏览器（LocalStorage + IndexedDB），完全支持离线使用。</p>
      </div>
    </div>

    <section class="section-panel settings-list">
      <div class="setting">
        <span>
          <strong>本地持久化存储状态</strong>
          <small>${isIndexedDBSupported ? 'IndexedDB 大容量持久化 + LocalStorage 双通道正常运行' : '当前环境仅支持 LocalStorage 基础存储'}</small>
        </span>
        <span class="tag ${isIndexedDBSupported ? 'accent' : ''}">${isIndexedDBSupported ? '● 状态良好' : '基础模式'}</span>
      </div>

      <div class="setting">
        <span>
          <strong>重点字体粗体渲染</strong>
          <small>卡片正文不使用红字干扰阅读，重点通过粗体与卡片右上角徽标标明</small>
        </span>
        <span class="tag accent">已启用 (v2.0)</span>
      </div>

      <div class="setting">
        <span>
          <strong>导入本地资料</strong>
          <small>当前库中共 ${total} 个知识点（${importedCount ? `已导入 ${importedCount} 个 Markdown 文件` : '默认示例题库'}）</small>
        </span>
        <div style="display:flex;gap:8px;">
          <button class="ghost" onclick="$('#folder-input').click()">导入文件夹</button>
          <button class="ghost" onclick="$('#files-input').click()">导入多文件</button>
        </div>
      </div>

      <div class="setting">
        <span>
          <strong>Anki 格式导出</strong>
          <small>导出全部考点为制表符分隔 TSV 文件，可直接导入 Anki 桌面版/移动端</small>
        </span>
        <button class="ghost" onclick="exportAnki()">导出 Anki TSV</button>
      </div>

      <div class="setting">
        <span>
          <strong>数据完整备份与恢复</strong>
          <small>导出所有考点、自建卡片、收藏及复习记录为 JSON 格式备份</small>
        </span>
        <div style="display:flex;gap:8px;">
          <button class="ghost" onclick="exportData()">导出备份 JSON</button>
          <button class="ghost" onclick="$('#backup-input').click()">恢复备份</button>
        </div>
      </div>

      <div class="setting">
        <span>
          <strong>清空本地所有数据</strong>
          <small>清除本地缓存、自建卡片及导入记录，恢复初始内置题库（不影响电脑中的原 Markdown）</small>
        </span>
        <button class="ghost" style="color:var(--accent);border-color:var(--accent);" onclick="clearData()">清空重置</button>
      </div>
    </section>
  `;
}

// ---------------- 数据导入导出与备份 ----------------
function exportAnki() {
  const cards = allCards();
  const cleanTag = (value) => String(value || '').trim().replace(/\s+/g, '-').replace(/[\\/|]+/g, '-');
  const rows = cards.map((c) => {
    const question = `${c.title}：请说出核心内容。`;
    const answer = formatBody(c.body).replace(/\t/g, ' ');
    const tags = ['建筑考研', c.subject, c.chapter, c.tag, c.level === 'high' ? '重点' : '次重点'].map(cleanTag).join(' ');
    return `${question}\t${answer}\t${tags}`;
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `architecture-review-anki-${new Date().toISOString().slice(0, 10)}.tsv`;
  a.click();
  toast(`已导出 ${cards.length} 张 Anki 卡片`);
}

function exportData() {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    favorites: state.favorites,
    reviewed: state.reviewed,
    cards: allCards()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `architecture-review-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  toast('本地备份 JSON 已导出');
}

function clearData() {
  const total = allCards().length;
  const hasHistory = state.reviewed.length > 0 || state.favorites.length > 0;
  let confirmMsg = `确定清空本地所有数据吗？\n当前共有 ${total} 张卡片`;
  if (hasHistory) {
    confirmMsg += `，包含 ${state.reviewed.length} 条复习记录与 ${state.favorites.length} 个收藏`;
  }
  confirmMsg += '。\n此操作不可逆（原 Markdown 文件不会受影响）。建议先点击“导出本地备份”。\n\n确定要继续彻底清空吗？';

  if (!confirm(confirmMsg)) return;

  // 二次防误触确认
  if (hasHistory) {
    const input = prompt('请在下方输入“清空”以确认彻底删除所有学习进度：');
    if (input !== '清空') {
      toast('已取消清空操作');
      return;
    }
  }
  state.favorites = [];
  state.reviewed = [];
  state.imported = null;
  state.cards = [...SAMPLE_CARDS];
  state.cardIndex = 0;
  localStorage.clear();
  if ('indexedDB' in window) {
    try {
      indexedDB.deleteDatabase('architecture-review');
      dbPromise = null;
    } catch (e) {
      console.error(e);
    }
  }
  toast('本地数据已清空恢复初始状态');
  layout();
}

async function handleImportFiles(fileList) {
  const files = [...fileList].filter((f) => f.name.toLowerCase().endsWith('.md'));
  if (!files.length) {
    toast('未找到 .md 格式的 Markdown 笔记文件');
    return;
  }

  toast(`正在解析 ${files.length} 个文件...`);
  const generated = [];
  const importedSources = new Set();
  for (const file of files) {
    const text = await file.text();
    const sourceKey = file.webkitRelativePath || file.name;
    importedSources.add(sourceKey);
    generated.push(...parseMarkdown(file, text));
  }

  // 建立历史卡片映射表：保留原有复习记录、到期时间和收藏状态
  const existingMap = new Map();
  state.cards.forEach((c) => {
    if (c.id) existingMap.set(c.id, c);
    const key = `${c.source || ''}::${c.title || ''}`;
    if (key !== '::') existingMap.set(key, c);
  });

  const mergedGenerated = generated.map((c) => {
    const key = `${c.source || ''}::${c.title || ''}`;
    const old = existingMap.get(c.id) || existingMap.get(key);
    if (old) {
      return {
        ...c,
        status: old.status || c.status,
        nextReview: old.nextReview || c.nextReview,
        reviewLog: old.reviewLog && old.reviewLog.length ? old.reviewLog : c.reviewLog,
      };
    }
    return c;
  });

  // 模式 B：全量替换覆盖策略
  // 1. 保留用户自建/手动添加的卡片（不因导入文件夹而丢失自建考点）
  // 2. 彻底替换所有导入卡片为本次选中的这批文件
  // 3. 移除系统内置的初始示例卡片 (SAMPLE_CARDS)
  // 4. 对与旧卡片匹配上的知识点，依然无缝继承原有复习进度与收藏标记
  const customCards = state.cards.filter(
    (c) => c.source === '自定义' || c.source === '自定义添加' || c.source === '自定义副本'
  );

  state.cards = [...customCards, ...mergedGenerated];

  state.imported = {
    count: files.length,
    cards: mergedGenerated.length,
    at: new Date().toISOString(),
    names: files.map((f) => f.webkitRelativePath || f.name)
  };

  save();
  toast(`已全量更新资料库：共导入 ${files.length} 个文件，生成 ${mergedGenerated.length} 个知识点`);
  go('materials');
}

// ---------------- DOM 事件绑定与键盘快捷键 ----------------
function initEvents() {
  // 移动端菜单与侧边栏遮罩
  const menuBtn = $('#mobile-menu');
  const sidebar = $('#sidebar');
  const backdrop = $('#sidebar-backdrop');

  if (menuBtn && sidebar) {
    menuBtn.onclick = () => {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('open', sidebar.classList.contains('open'));
    };
  }
  if (backdrop && sidebar) {
    backdrop.onclick = () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
    };
  }

  // 侧边栏导航点击
  document.querySelectorAll('.nav-item[data-view]').forEach((b) => {
    b.onclick = () => {
      state.view = b.dataset.view;
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      layout();
    };
  });

  // 顶栏搜索防抖
  let searchDebounceTimer = null;
  const triggerSearch = (val) => {
    state.search = val;
    if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', !state.search);
    if (state.view !== 'materials') state.view = 'materials';
    render();
  };

  // 顶栏搜索
  const searchInput = $('#search-input');
  const clearSearchBtn = $('#clear-search');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const val = e.target.value;
      if (mobileSearchInput) mobileSearchInput.value = val;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => triggerSearch(val), 180);
    };
  }
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.onclick = () => {
      clearTimeout(searchDebounceTimer);
      searchInput.value = '';
      if (mobileSearchInput) mobileSearchInput.value = '';
      state.search = '';
      clearSearchBtn.classList.add('hidden');
      render();
    };
  }

  // 移动端折叠搜索栏
  const searchToggle = $('#search-toggle');
  const searchRow = $('#search-row');
  const mobileSearchInput = $('#mobile-search-input');
  const mobileClearSearch = $('#mobile-clear-search');

  if (searchToggle && searchRow) {
    searchToggle.onclick = () => searchRow.classList.toggle('hidden');
  }
  if (mobileSearchInput) {
    mobileSearchInput.oninput = (e) => {
      const val = e.target.value;
      if (searchInput) searchInput.value = val;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => triggerSearch(val), 180);
    };
  }
  if (mobileClearSearch && mobileSearchInput) {
    mobileClearSearch.onclick = () => {
      clearTimeout(searchDebounceTimer);
      mobileSearchInput.value = '';
      if (searchInput) searchInput.value = '';
      state.search = '';
      if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
      render();
    };
  }

  // 文件夹导入与文件导入
  const folderInput = $('#folder-input');
  if (folderInput) {
    folderInput.onchange = async (e) => {
      await handleImportFiles(e.target.files);
      e.target.value = '';
    };
  }

  const filesInput = $('#files-input');
  if (filesInput) {
    filesInput.onchange = async (e) => {
      await handleImportFiles(e.target.files);
      e.target.value = '';
    };
  }

  // 备份恢复
  const backupInput = $('#backup-input');
  if (backupInput) {
    backupInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data.cards)) throw new Error('Invalid format');
        state.cards = data.cards;
        state.favorites = Array.isArray(data.favorites) ? data.favorites : [];
        state.reviewed = Array.isArray(data.reviewed) ? data.reviewed : [];
        save();
        toast(`成功恢复备份：${state.cards.length} 张卡片`);
        layout();
      } catch {
        toast('备份文件损坏或格式不正确');
      }
      e.target.value = '';
    };
  }

  // 键盘快捷键 (全局与卡片)
  document.addEventListener('keydown', (e) => {
    // ESC 键关闭移动端侧边栏
    if (e.key === 'Escape') {
      const sidebar = $('#sidebar');
      const backdrop = $('#sidebar-backdrop');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        return;
      }
    }

    // 如果焦点在输入框，则不响应卡片快捷键
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

    if (state.view === 'cards') {
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        previousCard();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        nextCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        showCardAnswer();
      } else if (state.cardMode === 'review') {
        const deck = cardRangeCards();
        const currentCard = deck[state.cardIndex];
        if (currentCard) {
          if (e.key === '1') { e.preventDefault(); rateCard(currentCard.id, 0); }
          else if (e.key === '2') { e.preventDefault(); rateCard(currentCard.id, 1); }
          else if (e.key === '3') { e.preventDefault(); rateCard(currentCard.id, 2); }
          else if (e.key === '4') { e.preventDefault(); rateCard(currentCard.id, 3); }
        }
      }
    }
  });
}

// ---------------- 异步恢复本地持久化数据 ----------------
async function hydrate() {
  try {
    const [favorites, reviewed, imported, cards] = await Promise.all([
      dbGet('favorites'),
      dbGet('reviewed'),
      dbGet('imported'),
      dbGet('cards')
    ]);

    if (Array.isArray(favorites)) state.favorites = favorites;
    if (Array.isArray(reviewed)) state.reviewed = reviewed;
    if (imported) state.imported = imported;
    if (Array.isArray(cards) && cards.length) {
      state.cards = cards;
    }
  } catch (err) {
    console.warn('Hydration from IndexedDB fallback to localStorage:', err);
  }

  layout();
}

// 启动初始化
initEvents();
hydrate();
