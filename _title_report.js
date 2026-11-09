// 标题质量体检：重复、过短、过长、残句
const fs = require('fs');
const cards = JSON.parse(fs.readFileSync('all-cards.json', 'utf8'));

const byTitle = new Map();
for (const c of cards) byTitle.set(c.title, (byTitle.get(c.title) || 0) + 1);
const dups = [...byTitle.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);

console.log('总卡片:', cards.length);
console.log('重复标题种类:', dups.length, '｜涉及卡片:', dups.reduce((s, [, n]) => s + n, 0));
console.log('前 12 大重复:');
dups.slice(0, 12).forEach(([t, n]) => console.log('  ', n + '×', t));

const shortOnes = cards.filter((c) => c.title.length <= 5);
console.log('\n标题 ≤5 字:', shortOnes.length);
shortOnes.slice(0, 10).forEach((c) => console.log('  ', c.title, '|', c.source));

const longOnes = cards.filter((c) => c.title.length > 40).sort((a, b) => b.title.length - a.title.length);
console.log('\n标题 >40 字:', longOnes.length);
longOnes.slice(0, 5).forEach((c) => console.log('  ', c.title.length + '字 |', c.title.slice(0, 60) + '…'));

// 残句特征：标题里出现句号、逗号、分号，或以「）」结尾且无动作词
const badPunct = cards.filter((c) => /[。，；]/.test(c.title));
console.log('\n标题含 。，； 的:', badPunct.length);
badPunct.slice(0, 8).forEach((c) => console.log('  ', c.title, '|', c.source));

const noCtx = cards.filter((c) => !c.context);
console.log('\n无 context 字段的卡:', noCtx.length);

const g6 = cards.filter((c) => c.source && c.source.includes('公共建筑设计原理/6.md'));
console.log('\n【截图来源】公共建筑设计原理/6.md:', g6.length, '张');
g6.forEach((c, i) => console.log('  ', i + 1, '|', c.title));