const fs = require('fs');
const path = require('path');

// —— 章节上下文工具（用于给“功能组成”“特征”这类短标题补足所属语境）——
// 去掉 Markdown 装饰、序号前缀与“-分析”后缀
function stripHeadingDecor(raw) {
  return String(raw || '')
    .replace(/\*\*/g, '')
    .replace(/==/g, '')
    .replace(/^#{1,4}\s*/, '')
    .trim()
    .replace(/^[（(【\[]?\s*[0-9]+\s*[)）】\].、]\s*/, '')
    .replace(/^[一二三四五六七八九十]+\s*[、.]\s*/, '')
    .replace(/[-－—]分析$/g, '')
    .replace(/-分析/g, '')
    .trim();
}

// 取标题主干：优先取破折号前的名称部分（如“办公建筑-功能关系与空间组合” → “办公建筑”）
function headingCore(raw) {
  const full = stripHeadingDecor(raw);
  const head = full.split(/[-－—]/)[0].trim();
  return head.length >= 2 ? head : full;
}

// 这些词自身没有区分度，不能单独当作上下文
const GENERIC_HEADING = /^(特征|类型|要点|分析|组成|优缺点|设计要点|功能组成|空间组合|五种类型|四种类型|分类|形式)$/;

function cleanTitle(str) {
  if (!str) return '';
  // 题头常见形态是「**（1）** 有机材料」或「==**（1）** 有机材料**==」；
  // 先移除成对装饰，避免装饰残留在标题中间（如“** 有机材料”）。
  str = String(str).replace(/==|\*\*/g, '').trim();
  str = str.replace(/^[0-9①②③④⑤⑥⑦⑧⑨⑩一二三四五六七八九十]+[、.）)）]*/g, '');
  if (!str) return '';
  return str
    .replace(/==|\*\*/g, '')
    .replace(/<\/?u>/gi, '')
    .replace(/\*/g, '')
    .replace(/^[#\s]+/, '')
    .replace(/^[【(（]?([0-9]+|[一二三四五六七八九十]+|[①②③④⑤⑥⑦⑧⑨⑩]+)[)）】、.]\s*/, '')
    .replace(/^([0-9]+|[一二三四五六七八九十]+)[、.]\s*/, '')
    .replace(/[：:]\s*$/, '')
    .replace(/^<u>|<\/u>$/g, '')
    .trim();
}

// 冒号前只是「代表建筑」「建筑实例」这类说明性标签，真正的名字在冒号后面
const GENERIC_LABEL = /^(代表建筑|建筑实例|代表人物|建筑成就|建筑主张|实例|代表作品|代表作)$/;

// 从冒号后的内容里取出第一个有意义的名称，用于替换掉泛化标签标题
// 例：'==**①布鲁塞尔都灵路12号住宅**==、**②德国魏玛艺术学校**' → '布鲁塞尔都灵路12号住宅'
function firstMeaningfulSegment(str) {
  const m = String(str).match(/==\*\*(.+?)\*\*==|\*\*(.+?)\*\*/);
  let t = (m ? (m[1] || m[2]) : String(str))
    .replace(/==|\*\*/g, '')
    .replace(/<u>|<\/u>/g, '')
    .replace(/^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮\s]+/, '')
    .trim();
  t = t.split(/[、，,；;。]/)[0].trim();
  t = t.split(/[（(]/)[0].trim();
  t = t.split(/[-－—]/)[0].trim();
  return t;
}

function stableId(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return 'import-' + (hash >>> 0).toString(16);
}

function subjectFromPath(p) {
  const norm = p.replace(/\\/g, '/');
  if (norm.includes('建筑理论专题')) return 'theory';
  if (norm.includes('中国')) return 'china';
  if (norm.includes('近现代')) return 'modern';
  if (norm.includes('外国')) return 'foreign';
  if (norm.includes('公共') || norm.includes('原理')) return 'public';
  return 'china';
}

function chapterFromPath(p) {
  const base = path.basename(p, '.md');
  const m = base.match(/^(\d+)/);
  // 统一 01 / 1，保证与 CHAPTER_TITLES 的键一致。
  return m ? String(Number(m[1])) : base;
}

// 智能切分单篇 Markdown
function parseMarkdownFile(fullPath) {
  const text = fs.readFileSync(fullPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const relPath = path.relative(path.join(__dirname, '..'), fullPath).replace(/\\/g, '/');
  const subject = subjectFromPath(relPath);
  const chapter = chapterFromPath(relPath);

  const cards = [];
  let current = null;
  // 章节层级栈：h1 是文档标题，h2 是「一、二、三」，h3 是「（4）办公建筑-…」
  let h1 = '', h2 = '', h3 = '';

  // 当前可用的上下文标签：优先最具体的 h3，其次 h2，最后 h1
  function contextLabel() {
    const c3 = headingCore(h3);
    const c2 = headingCore(h2);
    const c1 = headingCore(h1);
    if (c3 && c3.length >= 2 && !GENERIC_HEADING.test(c3)) return c3;
    if (c2 && !GENERIC_HEADING.test(c2)) return c2;
    return c1 || c2 || c3 || '';
  }

  // 合成最终标题：短标题补上章节语境，长标题保持原样
  function buildTitle(rawTitle, ctx) {
    const t = String(rawTitle || '').trim();
    if (!t || !ctx || t.length > 18 || t.includes(ctx)) return t;
    return `${ctx} · ${t}`;
  }

  function flush() {
    if (!current) return;
    let b = current.body.trim();
    if (!b || /^[-—\s_]+$/.test(b)) {
      current = null;
      return;
    }
    const finalTitle = buildTitle(current.title, current.ctx);

    cards.push({
      id: stableId(`${relPath}|${finalTitle}|${cards.length}`),
      title: finalTitle,
      context: current.ctx || '',
      body: b,
      subject,
      chapter,
      tag: current.level === 'high' ? '核心考点' : '基础知识',
      level: current.level || 'normal',
      status: 'new',
      source: relPath.replace(/^fuxi\/zl\//, '').replace(/^fuxi\//, ''),
      nextReview: null,
      reviewLog: []
    });
    current = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line.startsWith('>') || line.startsWith('---')) continue;

    // 捕获 #/##/### 标题：先 flush（旧的卡片属于上一节），再更新层级栈
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      if (level === 1) {
        h1 = text; h2 = ''; h3 = '';
      } else if (level === 2) {
        h2 = text; h3 = '';
      } else if (level === 3) {
        h3 = text;
      }
      // CIAM 笔记使用普通段落，没有加粗题头；以二级章节作为卡片容器，
      // 否则整篇内容会因没有 current 而被丢弃。
      if (subject === 'theory' && /12-CIAM专题/.test(relPath) && level === 2) {
        current = {
          title: cleanTitle(headingCore(text)) || '重点考点',
          ctx: contextLabel(),
          body: '',
          level: 'normal'
        };
      }
      continue;
    }

    // 规则 0：纯“标签行”，例如 ==**特征：**==、**布局：**、**①平面**：
    // 这类行只是上一张卡片的正文小标题，绝不能独立成卡（否则会产出大量重复的“特征”“特点”标题）
    const labelOnly = /^=*\*{0,2}\s*(特征|特点|优点|缺点|布局|平面|空间|形式|形式风格|风格|结构|材料|流线|功能|设计者|代表作|代表作品|建筑实例|实例|评价|局限性|进步意义|要求|选址|总平面|功能构成|功能组成|设计要点|建筑成就|代表人物)\s*[:：]\s*\*{0,2}=*$/;
    if (labelOnly.test(line)) {
      if (current) current.body += (current.body ? '\n' : '') + line;
      continue;
    }

    // 规则 1：子序号（①②③、a. b. c. 等），子项绝不作为新卡片，必须归属于当前卡片
    // 关键修正：pending 整行高亮形如 ==**④艺术：理性、感性相结合…**== 时，先剥掉 == 与 ** 再判断首字符，
    // 否则会被 isHeaderOnly 误认成题干，产出「④艺术：…」这类残句标题。
    const bareLine = line
      .replace(/^={1,2}\s*/, '')
      .replace(/^\*{1,2}\s*/, '')
      .replace(/^={1,2}\s*/, '')
      .trim();
    const startsWithCircleNumber = /^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]/.test(bareLine);
    const isSubBullet = /^[　\s]*\*{0,2}[①②③④⑤⑥⑦⑧⑨⑩a-eA-E][、.：:\s]/.test(line) || startsWithCircleNumber;
    const isSubNumbered = /^[　\s]*\*{0,2}[（(][\d①②③④⑤⑥⑦⑧⑨⑩]+[)）]/.test(line);
    const isStandaloneEmphasis = /^(?:==)?\*\*[^*]+?\*\*(?:==)?$/.test(line);

    // 排除掉截图中的那种伪子项：如果这一行包含冒号，且冒号前的内容很短，它可能是题干，不应归为子项
    // 但圈号开头的行例外——「④艺术：理性、感性相结合」属于上一张卡的要点，不应独立成卡
    const isColonHeader = line.includes('：') || line.includes(':');
    const isShortHeader = isColonHeader && line.split(/[：:]/)[0].length < 15;

    if ((isSubBullet || isSubNumbered) && !isStandaloneEmphasis && (!isShortHeader || startsWithCircleNumber)) {
      if (current) {
        current.body += (current.body ? '\n' : '') + line;
      }
      continue;
    }

    // 规则 2：独立的主考点标题行（不带具体答案正文，或者后面跟换行子项的）
    // 例如：==**【1】串联式空间组合**==
    // 例如：**1）混合结构-按不同承重方式-分类**
    const isHeaderOnly = /^(?:==\*\*[^*=]+?\*\*==|\*\*[^*]+?\*\*)$/.test(line) ||
                         /^(?:==\*\*)?[【(（]?(?:[0-9]+|[一二三四五六七八九十]+)[)）】、.][^：:\n]+(?:\*\*==|\*\*)?$/.test(line);

    // CIAM 原文的【1】…【2】…条目没有冒号，也不应被当作新题头。
    if (subject === 'theory' && /12-CIAM专题/.test(relPath) && /^【\d+】/.test(line) && current) {
      current.body += (current.body ? '\n' : '') + line;
      continue;
    }

    // 规则 3：一行内包含【考点/题干】和【答案正文/实例】
    // 例如：**4）【生态性】高层建筑：【1】法兰克福商业银行大厦（N.福斯特）；【2】...**
    // 例如：**（4）影剧院建筑-设计要点：①总体布置与交通组织；②声学设计；...**
    const colonMatch = line.match(/^(\*{0,2}(?:==\*\*)?[【(（]?(?:[0-9]+|[一二三四五六七八九十]+)[)）】、.]?\s*[^：:\n]+?)(?:[:：])\s*(.+)$/);

    if (colonMatch && colonMatch[2].trim().length > 3) {
      const qPart = colonMatch[1].trim();
      const aPart = colonMatch[2].trim();
      // 确认冒号前确实是题干，而不是 ①优点： 这种子项（已被规则1过滤）
      flush();
      let cardTitle = cleanTitle(qPart) || '重点考点';
      // 「（2）代表建筑：**红屋（韦布）**」这类行，冒号前只是标签，实测会产出 9 张同名「代表建筑」，
      // 因此改用冒号后第一个具体名称作为标题，正文仍保留整行不丢信息。
      if (GENERIC_LABEL.test(cardTitle)) {
        const named = firstMeaningfulSegment(aPart);
        if (named && named.length >= 2 && named.length <= 24) cardTitle = named;
      }
      current = {
        title: cardTitle,
        ctx: contextLabel(), // 章节上下文快照（避免被后续标题覆盖）
        body: line, // 答案保留整行内容，方便完整阅读
        level: line.includes('==') ? 'high' : 'normal'
      };
      continue;
    }

    if (isHeaderOnly) {
      flush();
      current = {
        title: cleanTitle(line) || '重点考点',
        ctx: contextLabel(), // 章节上下文快照（避免被后续标题覆盖）
        body: '',
        level: line.includes('==') ? 'high' : 'normal'
      };
      continue;
    }

// 在处理完 line 内容后，如果 current 有内容，但这一行是空的，我们不要直接停
// 这是一个很好的修复点：
    if (current) {
        // 关键逻辑：如果上一行是空的或者已经是 body 的一部分，继续拼
        current.body += (current.body ? '\n' : '') + line;
    } else {
        // 如果没有 current，这是纯垃圾行，跳过
    }
  }

  flush();
  return cards;
}

// 递归获取所有 markdown 文件
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) results = results.concat(getFiles(fullPath));
    else if (file.endsWith('.md')) results.push(fullPath);
  });
  return results;
}

const zlDir = path.join(__dirname, '../fuxi/zl');
const thDir = path.join(__dirname, '../fuxi/建筑理论专题');
const allMd = [...getFiles(zlDir), ...getFiles(thDir)];

console.log('Total md files to parse:', allMd.length);

let totalCards = [];
allMd.forEach(f => {
  const cards = parseMarkdownFile(f);
  totalCards.push(...cards);
});

// 对重复标题补充正文中的第一个具体名词，保留原有语义并提升目录可辨识度。
// 若正文没有可用区分词，则保持原题名，避免人为制造无意义编号。
const titleGroups = new Map();
totalCards.forEach(card => {
  if (!titleGroups.has(card.title)) titleGroups.set(card.title, []);
  titleGroups.get(card.title).push(card);
});
for (const [title, group] of titleGroups) {
  if (group.length < 2) continue;
  const used = new Set();
  for (const card of group) {
    const bodyTail = String(card.body).split(/[：:]/).slice(1).join(':') || card.body;
    const named = firstMeaningfulSegment(bodyTail)
      .replace(/^[（(【\[]?\d+[)）】\].、]?\s*/, '')
      .replace(/^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]\s*/, '')
      .trim();
    if (!named || named.length < 2 || named === title) continue;
    const shortName = named.length > 18 ? `${named.slice(0, 18)}…` : named;
    const candidate = `${title} · ${shortName}`;
    if (used.has(candidate)) continue;
    card.title = candidate;
    used.add(candidate);
  }
  const remaining = group.filter(card => card.title === title);
  if (remaining.length > 1) {
    remaining.forEach((card, idx) => { card.title = `${title}（第${idx + 1}项）`; });
  }
}
// 标题变化后重算 ID，确保导入和后续升级仍保持稳定。
totalCards.forEach((card, index) => {
  card.id = stableId(`${card.source}|${card.title}|${index}`);
});

console.log('Total generated cards:', totalCards.length);

// 质量审计
const badBody = totalCards.filter(c => !c.body || /^[-—\s_]+$/.test(c.body.trim()) || c.body.trim().length <= 3);
const badTitle = totalCards.filter(c => /^[①②③④⑤⑥⑦⑧⑨⑩]/.test(c.title));
console.log('Bad body count (should be 0):', badBody.length);
console.log('Bad title count (starts with ①②, should be 0):', badTitle.length);

if (badTitle.length > 0) {
  console.log('Bad title samples:');
  badTitle.forEach(c => console.log('  ', c.source, '|', c.title, '|', c.body.slice(0, 50)));
}

// 保存全量 cards 到 all-cards.json，并更新 app.js 中的 SAMPLE_CARDS
fs.writeFileSync(path.join(__dirname, 'all-cards.json'), JSON.stringify(totalCards, null, 2), 'utf8');
console.log('Saved to all-cards.json, total:', totalCards.length);

const appJsPath = path.join(__dirname, 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');
const sampleCardsStr = 'const SAMPLE_CARDS = ' + JSON.stringify(totalCards) + ';';

// 只在行尾（后面紧跟空行或文件结束）处收尾，避免卡片正文里出现 "];" 时被提前截断
const sampleRe = /const SAMPLE_CARDS = \[[\s\S]*?\];(?=\r?\n\r?\n|$)/;
if (!sampleRe.test(appJs)) {
  throw new Error('app.js 中找不到 SAMPLE_CARDS 声明，注入失败');
}
appJs = appJs.replace(sampleRe, () => sampleCardsStr);

// 题库每次重编译都必须递增数据版本，否则浏览器会继续使用 localStorage/IndexedDB 里的旧卡片，
// 用户看到的就是「改了代码但页面标题还是旧的」。
const verMatch = appJs.match(/const DATA_VERSION = '(\d+)\.(\d+)';/);
if (!verMatch) {
  throw new Error('app.js 中找不到 DATA_VERSION 常量，无法自动失效浏览器缓存');
}
const nextVer = `${verMatch[1]}.${Number(verMatch[2]) + 1}`;
appJs = appJs.replace(/const DATA_VERSION = '\d+\.\d+';/, `const DATA_VERSION = '${nextVer}';`);
fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('Updated app.js SAMPLE_CARDS successfully. DATA_VERSION →', nextVer);

// index.html 的 ?v= 查询串同时升级，确保浏览器重新拉取 app.js（而不是用旧缓存）
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const before = html;
html = html.replace(/app\.js\?v=[\d.]+/g, `app.js?v=${nextVer}`);
html = html.replace(/style\.css\?v=[\d.]+/g, `style.css?v=${nextVer}`);
if (html !== before) {
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Bumped index.html asset version →', nextVer);
}
