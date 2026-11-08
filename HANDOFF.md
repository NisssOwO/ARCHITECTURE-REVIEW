# 筑忆：建筑理论复习网页交接文档（HANDOFF）

## 1. 项目概述与技术约束

这是一个面向建筑学考研理论复习（中国建筑史、外国建筑史、外国近现代建筑史、公共建筑设计原理）的**纯静态离线学习网页**，原始 Markdown 资料位于：

```text
F:\work\fuxi\zl
```

### 核心约束（不可违背）
- **零构建依赖**：不依赖 npm、React、Vite、TypeScript 或开发服务器，直接双击或通过浏览器打开 `F:\work\architecture-review\index.html` 即可运行。
- **深色沉浸式夜间界面**：采用深岩灰底色（`#0f1215` / `#13171b` / `#171c21`）、暖象牙白正文（`#f2ede4`）与赤陶色点缀（`#d4895c`），标题使用衬线体（`Songti SC` / `Noto Serif SC` / `Georgia`），正文使用无衬线体。
- **重点层级只用字体表达（严禁背景色块高亮）**：
  - `==**重点**==`（原思维导图红字核心重点）→ `.hl-red`：珊瑚红字色（`#eb7a6b`）+ 字重加粗 + 下划线，**不使用背景色块**。
  - `**次重点**`（原思维导图黑粗/蓝粗次重点）→ `.hl-bold`：高亮暖白加粗文字，**不使用背景色块**。
- **原始资料只读**：网页仅读取用户选择的 Markdown 文件并将解析结果保存在浏览器本地（`IndexedDB` + `localStorage`），绝不修改 `F:\work\fuxi\zl` 下的源文件。

---

## 2. 当前目录与文件状态

```text
F:\work\architecture-review\
├── index.html              [已完成优化] 页面骨架、侧边栏徽章、桌面/移动端双搜索栏、双模式文件导入器
├── style.css               [已完成重构] 清理重复覆盖样式，统一设计变量、卡片固定视口布局与响应式适配
├── app.js                  [待同步更新] 页面渲染逻辑、Markdown 解析、卡片复习与本地存储（需对接新 DOM 与样式）
├── README.md               使用说明
├── TODO.md                 分阶段任务清单
├── HANDOFF.md              本交接文档
├── material-audit.md       资料审计报告（4 门科目共 43 个 .md 文件）
├── material-manifest.json  资料清单 JSON
└── material-manifest.csv   资料清单 CSV
```

---

## 3. 接手诊断：原网页存在的核心问题清单

在对原始 `index.html`、`style.css` 和 `app.js` 进行全面代码审查后，定位出以下 4 大类问题：

### 3.1 UI 样式与布局层问题（已在 `index.html` 和 `style.css` 中修复）
1. **`style.css` 存在大量重复定义与尾部压缩覆盖**：原文件后半段追加了数段单行压缩 CSS，导致 `.material-row`、`.card-study-layout`、`.review-card`、`.card-directory` 等选择器被反复覆盖，维护困难且部分属性冲突。
2. **类名大小写拼写不一致**：原 `app.js` 混用了 `.subject-right` 与 `.subject-Right`，导致部分样式未命中。
3. **搜索栏与移动端导航体验割裂**：
   - 原顶栏只有“搜索”按钮，点击后才展开整行搜索框，桌面端空间未利用且输入体验多一步；
   - 移动端抽屉菜单打开后缺少半透明遮罩层（`#sidebar-backdrop`），点击正文区域无法收起侧边栏。
4. **移动端无法导入单文件**：原 `index.html` 仅提供带 `webkitdirectory` 的 `#folder-input`，在手机浏览器或只需导入单个 `.md` 文件时无法选择文件。

### 3.2 页面交互与状态死胡同问题（需在 `app.js` 中完成修复）
1. **复习卡片页（`cardsV2`）筛选为空时直接丢失筛选器（严重死胡同）**：
   - 原代码：`if (!deck.length) { content.innerHTML = '<div class="empty">当前范围没有可复习卡片。</div>'; return; }`
   - 后果：一旦用户选择的“科目 / 章节 / 收藏 / 重点”组合下没有卡片，整个页面的顶部标题、模式切换标签（浏览/复习）、范围下拉框全部被清空，用户无法切回其他范围，只能刷新或切走页面。
2. **“加入卡片 / 加入复习”按钮（`addReview(id)`）忽略了传入的 `id`**：
   - 原代码：`function addReview() { state.view = 'cards'; state.cardMode = 'review'; state.cardFilter = 'all'; state.cardIndex = 0; ... }`
   - 后果：用户在“资料浏览”或“错题与收藏”点击某条具体知识点的“加入卡片”时，永远只会跳到第 1 张卡片（`cardIndex = 0`），而不会定位到所点击的那张卡片。
3. **卡片目录硬编码 `.slice(0, 30)` 截断**：
   - 原代码在渲染右侧卡片目录时写了 `deck.slice(0, 30)`，当某科目或全部卡片超过 30 张时，第 31 张及之后的卡片在目录中完全不可见。
4. **复习打分后跳转索引计算错误（`rateCard`）**：
   - 原代码：`rate(id, rating); state.cardIndex = (state.cardIndex + 1) % Math.max(allCards().length, 1); render();`
   - 后果：`rate()` 内部已经调用了一次 `render()`，`rateCard()` 又用 `allCards().length`（而非当前筛选后的 `deck.length`）取模并再次 `render()`，导致重复渲染和卡片越界跳变。

### 3.3 数据展示失真与解析截断问题（需在 `app.js` 中完成修复）
1. **总览页（`dashboard`）存在多处写死（Hardcoded）的假数据**：
   - 日期固定写死为 `MONDAY · 08 NOV 2026`；
   - 统计卡片写死 `连续学习 6 天`、`已掌握卡片 86 + ...`、`本周学习时长 3.8h`；
   - 科目进度条使用 `SUBJECTS` 静态常量中的 `progress: 42%` 等固定值，未随导入资料与实际复习进度变化；
   - 右侧“最近复习”列表写死了 3 条固定假数据（“庭院的作用 · 2小时前”等），未绑定真实的待复习/最近复习记录。
2. **Markdown 导入存在两处静默截断**：
   - `parseMarkdown(file, text)` 末尾写了 `return cards.slice(0, 80)`，单文件超过 80 个知识点会被静默丢弃；
   - `materialRowHTML(k)` 中写了 `k.body.slice(0, 130)`，导致资料浏览页无法阅读完整知识点内容，且丢失了内联重点标记。
3. **冗余废弃函数残留**：
   - `app.js` 中仍留有早期版本的 `review()` 和 `cards()` 函数，与当前实际使用的 `cardsV2()` 重复且未清理。

---

## 4. 已完成的优化工作（第 1 阶段）

### 4.1 `F:\work\architecture-review\index.html`（已更新并验证）
- **侧边栏升级**：
  - 增加导航分组标题 `学习空间`；
  - 为导航项增加实时数量徽章：`#nav-materials-count`（资料总数）、`#nav-due-count`（待复习数）、`#nav-fav-count`（错题与收藏数）；
  - 底部新增本地资料库状态卡片 `#sidebar-import-status`，实时显示已导入文件数与卡片数；
  - 新增移动端抽屉遮罩层 `<div class="sidebar-backdrop" id="sidebar-backdrop"></div>`。
- **顶栏与搜索栏升级**：
  - 桌面端顶栏内嵌常驻搜索框（`#search-input` + `#clear-search`），支持快捷键 `/` 聚焦；
  - 移动端保留折叠式搜索按钮 `#search-toggle` 与独立展开行 `#search-row`（`#mobile-search-input` + `#mobile-clear-search`）；
  - 顶栏右侧增加快捷按钮 `＋ 导入资料`（`#quick-import-btn`）。
- **双模式文件选择器**：
  - 保留文件夹导入 `#folder-input`（`webkitdirectory multiple`）；
  - 新增多文件导入 `#files-input`（`accept=".md,text/markdown,text/plain" multiple`），兼容移动端与单文件导入。

### 4.2 `F:\work\architecture-review\style.css`（已重构并验证）
- 彻底清理了原文件尾部所有重复、冲突的压缩 CSS；
- 统一设计 Token（颜色、圆角、阴影、衬线/无衬线字体栈）；
- 完善 `.hl-red`（珊瑚红加粗下划线）与 `.hl-bold`（亮象牙白加粗）纯字体强调样式，无任何背景色块；
- 完善 `.toolbar-panel`、`.toolbar-row`、`.material-row`、`.material-meta-top`、`.material-row-actions` 资料浏览样式；
- 完善 `body.cards-view` 桌面端单屏固定高度布局（左侧 `.swipe-card` 内部滚动答案、底部固定操作栏与四档评价按钮 `.rating.r-0` ~ `.rating.r-3`，右侧 `.card-directory` 独立滚动）；
- 兼容 `.subject-right, .subject-Right` 选择器，完善 1080px 与 760px 两档响应式断点。

---

## 5. 待完成工作清单（第 2 阶段：更新 `app.js`）

接手后只需重写/更新 `F:\work\architecture-review\app.js`，即可完成全部 UI 与交互闭环。具体实现要求如下：

### 5.1 全局导航与顶栏状态同步（`layout()` & `updateChrome()`）
- 在每次 `layout()` / `render()` 时调用 `updateChrome()`：
  - 更新 `#nav-materials-count` 为 `allCards().length`；
  - 更新 `#nav-due-count` 为 `dueCards().length`；
  - 更新 `#nav-fav-count` 为收藏与错题（`status === 'learning'`）去重后的数量；
  - 更新 `#sidebar-import-status` 显示当前资料库状态（如已导入文件数/卡片数，或内置示例库状态）。
- 绑定移动端侧边栏与遮罩层：
  - 点击 `#mobile-menu` 同时切换 `#sidebar.open` 和 `#sidebar-backdrop.open`；
  - 点击 `#sidebar-backdrop` 或任意 `.nav-item` 时关闭侧边栏与遮罩层。
- 绑定顶栏与导入控件：
  - `#quick-import-btn` 点击触发 `#folder-input.click()`；
  - 桌面端 `#search-input` / `#clear-search` 与移动端 `#mobile-search-input` / `#mobile-clear-search` 双向同步 `state.search`；
  - 抽取统一的 `handleImportFiles(fileList)` 函数，同时绑定到 `#folder-input` 和 `#files-input`。

### 5.2 正文重点格式化辅助函数（`formatBody(text)`）
- 在 `parseMarkdown` 中保留正文的 `==**...**==` 和 `**...**` 标记（或提供结构化渲染函数 `formatBody(text)`）：
  - 将 `==**文本**==` 转为 `<span class="hl-red">文本</span>`；
  - 将 `**文本**` 转为 `<strong class="hl-bold">文本</strong>`；
  - 支持对 `①②③`、`1. 2. 3.`、`（1）（2）` 或换行列表进行清晰分段展示；
  - 移除 `parseMarkdown` 末尾的 `.slice(0, 80)` 限制。

### 5.3 五大视图 DOM 结构对齐（匹配新版 `style.css`）
1. **总览视图 `dashboard()`**：
   - `.eyebrow` 动态显示当前真实日期；
   - `.stats` 展示 4 项真实统计：全部卡片（含重点卡数量）、待复习卡片、重点核心卡、已收藏/已复习卡片；
   - 左侧“四门科目”列表：按各科目真实卡片数量、已复习比例计算动态进度条，使用 `.subject-row` > `.subject-dot` + `.subject-info` + `.subject-right`；
   - 右侧“最近复习 / 待复习预览”：展示真实复习记录或高优先级待复习卡片，点击可直接跳转到对应卡片（`openCardById(id)`）。
2. **资料浏览视图 `materials()`**：
   - 顶部 `.view-head` 右侧 `.head-actions` 同时提供 `＋ 导入文件夹`（触发 `#folder-input`）和 `选择 .md 文件`（触发 `#files-input`）；
   - 筛选面板使用 `.toolbar-panel` > `.toolbar-row`，包含科目筛选按钮（带各科目数量）、章节 `<select class="filter">`、以及重点层级筛选（全部 / 重点 / 次重点）；
   - 列表项 `materialRowHTML(k)` 使用 `.material-row` > `.material-main`（含 `.material-meta-top` 标签行、`<h3 class="${k.level}">`、完整格式化正文 `<p>${formatBody(k.body)}</p>`）+ `.material-row-actions`（收藏按钮 + `卡片复习` 按钮）。
3. **复习卡片视图 `cardsV2()`**：
   - **空状态保护**：无论 `deck.length` 是否为 0，始终渲染顶部 `.view-head`（含 `.mode-tabs` 浏览/复习切换、新建卡片按钮）和 `.range-panel`（科目、章节下拉框及 `全部 / 重点 / 待复习 / 已收藏` 筛选按钮）。当 `deck.length === 0` 时，仅在下方卡片区渲染 `.empty` 面板并提供 `重置筛选范围` 按钮（`resetCardFilters()`）；
   - **单卡复习区**：使用 `.review-card.single-card.swipe-card`，包含 `.card-meta`、`.question.${k.level}`、答案区（浏览模式或已翻开时显示 `.answer`，复习未翻开时显示 `.answer-reveal-box` 提示点击或按空格键显示）、`.card-footer-bar`（收藏/编辑/复制/删除/撤销，以及 `.swipe-controls` 上一张、进度条 `.swipe-progress-bar`、下一张）、以及复习模式下的四档评价按钮 `.rating.r-0` ~ `.rating.r-3`（附带间隔提示 `<small>当天重来 / 1 天后 / 3 天后 / 7 天后</small>`）；
   - **右侧卡片目录**：移除 `.slice(0, 30)` 限制，完整渲染当前 `deck` 的所有 `.directory-item`，并在切换卡片时自动将当前选中项滚动至可视区域；
   - **快捷键增强**：在 `cards` 视图下（且焦点不在输入框时），支持 `ArrowLeft` / `ArrowRight` 切换卡片、`Space` 显示答案、复习模式下数字键 `1`~`4` 快速打分。
4. **错题与收藏视图 `mistakes()`**：
   - 汇总展示用户已收藏（`state.favorites`）以及复习评价为“忘记/困难”（`card.status === 'learning'`）的卡片，支持子筛选（全部 / 仅收藏 / 仅错题），使用 `.knowledge-grid` 渲染。
5. **设置视图 `settings()`**：
   - 使用 `.setting-actions` 布局，提供“导入文件夹”、“选择 .md 文件”、“导出 Anki TSV”、“导出 JSON 备份”、“恢复 JSON 备份”和“清空本地数据”操作。

---

## 6. 验证步骤

完成 `app.js` 更新后，按以下步骤验证：

1. **语法检查**：
   ```powershell
   node --check F:\work\architecture-review\app.js
   ```
2. **功能与 UI 自检**：
   - 打开 `F:\work\architecture-review\index.html`；
   - 检查侧边栏 3 个数量徽章与底部资料库状态卡片是否正常显示；
   - 检查顶栏搜索框输入与清空按钮、移动端窄屏下侧边栏抽屉与遮罩层收起是否正常；
   - 在“资料浏览”测试导入 `F:\work\fuxi\zl` 文件夹或单个 `.md` 文件，确认重点（珊瑚红加粗下划线）与次重点（亮白加粗）无背景色块；
   - 在“复习卡片”切换筛选条件至无结果状态，确认范围选择器依然保留且可一键重置；
   - 点击任意知识点的“卡片复习”，确认能精准跳转到对应卡片。