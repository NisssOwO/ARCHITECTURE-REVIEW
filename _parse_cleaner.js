const fs = require('fs');
const path = require('path');

function cleanTitle(str) {
  if (!str) return '';
  return str
    .replace(/^==\*\*|\*\*==$/g, '')
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/^[#\s]+/, '')
    .replace(/^[【(（]?([0-9]+|[一二三四五六七八九十]+|[①②③④⑤⑥⑦⑧⑨⑩]+)[)）】、.]\s*/, '')
    .replace(/^([0-9]+|[一二三四五六七八九十]+)[、.]\s*/, '')
    .replace(/[：:]\s*$/, '')
    .replace(/^<u>|<\/u>$/g, '')
    .trim();
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
  return m ? m[1] : base;
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

  function flush() {
    if (!current) return;
    let b = current.body.trim();
    // 增加调试信息：如果 body 很短，看看到底是什么
    if (b.length > 0 && b.length < 10) {
       console.log('DEBUG: Short body flushed:', current.title, '|', b);
    }
    if (!b || /^[-—\s_]+$/.test(b)) {
      current = null;
      return;
    }
    cards.push({
      id: stableId(`${relPath}|${current.title}|${cards.length}`),
      title: current.title,
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

    // 忽略 markdown 标题 #, ##，但可提取为全局上下文（暂不作为题干切分）
    if (/^#{1,3}\s+/.test(line)) {
      continue;
    }

    // 规则 1：子序号（①②③、a. b. c. 等），子项绝不作为新卡片，必须归属于当前卡片
    // 关键修正：必须包含前导星号或者是明显子项，且不能是像“②缺点”这种带冒号作为题干的
    const isSubBullet = /^[　\s]*\*{0,2}[①②③④⑤⑥⑦⑧⑨⑩a-eA-E][、.：:\s]/.test(line);
    const isSubNumbered = /^[　\s]*\*{0,2}[（(][\d①②③④⑤⑥⑦⑧⑨⑩]+[)）]/.test(line);
    
    // 排除掉截图中的那种伪子项：如果这一行包含冒号，且冒号前的内容很短，它可能是题干，不应归为子项
    const isColonHeader = line.includes('：') || line.includes(':');
    const isShortHeader = isColonHeader && line.split(/[：:]/)[0].length < 15;

    if ((isSubBullet || isSubNumbered) && !isShortHeader) {
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

    // 重点：调试截图2，为什么【5】综合大厅式空间组合没被捕获
    if (line.includes('综合大厅')) {
        console.log('DEBUG: matched 综合大厅 line:', line, 'isHeaderOnly:', isHeaderOnly);
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
      current = {
        title: cleanTitle(qPart) || '重点考点',
        body: line, // 答案保留整行内容，方便完整阅读
        level: line.includes('==') ? 'high' : 'normal'
      };
      continue;
    }

    if (isHeaderOnly) {
      flush();
      current = {
        title: cleanTitle(line) || '重点考点',
        body: '',
        level: line.includes('==') ? 'high' : 'normal'
      };
      console.log('DEBUG: started new header:', current.title);
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
appJs = appJs.replace(/const SAMPLE_CARDS = \[[\s\S]*?\];/, sampleCardsStr);
fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('Updated app.js SAMPLE_CARDS successfully.');
