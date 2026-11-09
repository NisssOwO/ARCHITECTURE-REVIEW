# 筑忆（Architecture Review）项目交接文档（HANDOFF v3.0）

## 1. 项目概况与架构定位

「筑忆」是一个专为建筑学考研（中国建筑史、外国建筑史、外国近现代建筑史、公共建筑设计原理、建筑理论专题）设计的**高性能纯静态、离线优先学习与记忆卡片系统**。

### 1.1 核心设计哲学与硬约束
- **零构建与无依赖**：纯原生前端体系（Vanilla JS + 单文件 CSS + HTML），无 npm / React / Vue / Vite 等打包流程，双击 `index.html` 或通过静态托管（如 GitHub Pages）直接运行。
- **离线与本地优先**：状态持久化基于浏览器 `IndexedDB`（主数据库 `architecture-review`）+ `localStorage`（配置及最后进度），断网无缝使用。
- **视觉风格与规范**：深色沉浸式夜间界面（深岩灰底色 `#0f1215` / `#13171b`、暖象牙白正文 `#f2ede4`、赤陶重点色 `#d4895c`）。严格遵循“纯字体表现”原则，**严禁背景色块高亮**；按最新用户交互规范，卡片正文不使用红字干扰阅读，重点通过字重粗体（`.hl-bold`）、下划线（`.hl-underline`）以及卡片角标统一体现。
- **全量题库内置化**：不再依赖用户手动选择导入本地 Markdown 文件，系统已将全部 60 篇专业考研核心笔记（共 **1526** 条精选考点）编译内置于 `app.js` 中。

---

## 2. 仓库与文件架构

- **远程仓库**：`https://github.com/NisssOwO/ARCHITECTURE-REVIEW`
- **线上部署**：GitHub Pages（主分支 `main`，根目录部署）
- **本地工作区**：`F:\work\architecture-review\`

```text
F:\work\architecture-review\
├── index.html              // 页面骨架、语义化布局、侧边栏/顶栏/移动端抽屉
├── style.css               // 全量样式体系（含桌面固定视口、移动端响应式、专注模式、字体规范）
├── app.js                  // 单文件前端核心应用引擎（内置题库、状态机、视图渲染、事件调度）
├── all-cards.json          // 全量清洗编译后的 1526 条卡片题库数据源
├── _parse_cleaner.js       // 智能 Markdown 语法切分与题库生成编译脚本（含自动版本递增）
├── _smoke_test.js          // 侧边栏/入口/CSS/版本一致性冒烟测试（node _smoke_test.js）
├── _title_report.js        // 标题质量体检：重复、过短、过长、残句（node _title_report.js）
├── HANDOFF.md              // 本交接文档
└── DSH_OCR_HANDOFF.md      // 早期 OCR 诊断记录
```

---

## 3. 核心功能与模块实现

### 3.1 视图体系（五大核心页面）
1. **仪表盘（Dashboard）**：真实计算全库卡片总数、今日待复习数、掌握率（复习评分为 2/3 的卡片）、连续学习天数、分科目环形/条形进度，以及最近动态记录。
2. **资料全览（Materials）**：科目/章节多维度筛选、即时防抖模糊全文搜索、完整格式化考点内容展开阅读，支持一键单卡跳转至复习。
3. **卡片复习（Cards / cardsV2）**：
   - **双模式切换**：支持「浏览模式」（直接展示答案）与「复习模式」（隐藏答案，点击或空格翻开，提供 4 档间隔评分：当天重来 / 1天 / 3天 / 7天）。
   - **双栏与目录联动**：左侧单卡视口固定高度滚动，右侧完整章节知识点目录（`.card-directory`），切卡时自动平滑居中滚动定位（`scrollDirectoryIntoView`）。
   - **专注模式（Zen/Focus Mode）**：按快捷键 `F` 或点击顶部按钮即可隐藏辅助信息与导航，留出高行高、大字体、居中的纯粹阅读区域。
   - **智能章节衔接**：支持上一章/下一章直接切换；单卡翻页到当前章节末尾时，可根据科目章节序列自动无缝跳转到下一章首题。
4. **错题与收藏（Mistakes）**：分栏独立呈现“已收藏卡片”与“复习标记为遗忘/困难（Status: learning）”的卡片，便于集中攻克。
5. **设置中心（Settings）**：支持导出 Anki 兼容 TSV、JSON 全量数据备份与导入恢复、题库重置与缓存清空。

### 3.2 键盘快捷键体系（无输入焦点时）
- `ArrowLeft` / `A`：上一张卡片
- `ArrowRight` / `D`：下一张卡片
- `Space` / `Enter`：翻开答案（复习模式）
- `1` / `2` / `3` / `4`：复习模式下快捷评分
- `F`：切换专注模式（Focus Mode）
- `Esc`：关闭侧边栏抽屉与所有弹窗

---

## 4. 关键技术突破与重大 Bug 修复记录（v2.7 – v2.10，已实测）

> 说明：v2.6 之前本节曾记录过「已修复」，但当时 `style.css` / `index.html` 实际一行未改，属于误报。以下内容对应**真实落地的代码**，可用第 5.3 节的自检脚本复现。

### 4.1 卡片标题缺失上下文 / 标题错位（`_parse_cleaner.js`）
- **问题表现**：卡片 13/22 只显示 `功能组成`，看不出是办公建筑、学校建筑还是医疗建筑。
- **根因（四层，逐层修掉）**：
  1. 解析器用 `continue` 直接跳过所有 `#` / `##` / `###` 行 → 上级条目丢失，`功能组成` 在办公/学校/医疗三处同名。
  2. 修完上下文后出现**错位**：`currentSection` 在遇到标题行时立刻更新，而 `flush()` 要等下一个题头行才执行，导致卡片被贴上「下一节」的上下文（学校第 2 条被标成「（6）医疗建筑」）。
  3. `==**特征：**==`、`**布局：**` 这类纯标签行被 `isHeaderOnly` 当成新卡片题头，把上一张卡的正文挤成空卡后丢弃。
  4. `==**④艺术：理性、感性相结合…**==` 这类整行高亮的正文要点被误判为题头，产出 `④艺术：…` 这种残句标题。`（2）代表建筑：**红屋（韦布）**` 这类行则产出 9 张同名「代表建筑」。
- **修法**：
  - 引入 h1/h2/h3 层级栈 + `stripHeadingDecor()` / `headingCore()` / `GENERIC_HEADING`；`contextLabel()` 优先 h3，泛化词回退 h2/h1。
  - **上下文快照**：创建卡片时把 `ctx: contextLabel()` 写进 `current`，`flush()` 只读快照；标题行分支改为**先 `flush()` 再更新层级栈**。
  - `buildTitle(raw, ctx)`：仅当标题 ≤18 字且不含 ctx 时拼成 `${ctx} · ${title}`（长标题保持原样，避免二次注水）。
  - 新增规则 0 `labelOnly`：`特征/特点/优缺点/布局/建筑实例/功能组成/设计要点/代表人物…` + 冒号 + 行尾 → 并入上卡正文，不再单独成卡。
  - 规则 1 增强：先剥掉 `==` 与 `**` 再判断首字符，**圈号（①②③④…）开头的行一律归入正文**，即使该行含冒号。
  - 新增 `GENERIC_LABEL` + `firstMeaningfulSegment()`：冒号前是「代表建筑/建筑实例/代表人物/建筑成就/建筑主张/实例」时，改用冒号后第一个具体名称作标题（正文仍保留整行）。
- **实测结果（`node _parse_cleaner.js` + `node _title_report.js`）**：
  - 卡片数 1542 → **1526**；`bad body` 0；`bad title（①②开头）` 0。
  - 重复标题 66 种 / 284 张 → **27 种 / 69 张**；标题 ≤5 字的卡片 656 张 → **5 张**。
  - `公共建筑设计原理/6.md` 由 22 张恢复为 27 张，`5 | 办公建筑 · 功能组成`、`11 | 学校建筑 · 功能组成`、`13 | 医疗建筑 · 功能组成`，且新增了原先被吞掉的 5 张「连续性的空间组合 · 串联式/放射式…」。

### 4.2 桌面端折叠侧边栏后无法再展开（`style.css` + `index.html` + `app.js`）
- **问题表现**：点左上角 `☰` 收起后，屏幕上没有任何可点的入口能把它放出来。
- **根因（四个叠加缺陷）**：
  1. 唯一的折叠按钮当时被塞在 `<nav class="nav-list">` 内部，而 `.sidebar` 是 `position: fixed`，折叠时 `transform: translateX(-100%)` 把按钮一起推到了视口外。
  2. `.mobile-menu`（顶栏 `☰`）默认 `display: none`，只在 `@media (max-width: 680px)` 里 `display: inline-flex` → 桌面端根本没有顶栏入口。
  3. `.app-shell` 是 `display: flex`，但折叠样式写的是 `grid-template-columns: 0 1fr`（对 flex 完全无效），且没有复位 `.main` 的 `margin-left: 248px` → 折叠后左侧永久留 248px 空白。
  4. 断点不一致：`app.js` 判断 `window.innerWidth <= 840`，CSS 媒体查询是 `680px` → 681~840px 区间点开关毫无反应。
- **修法**：
  - `app.js` 顶部新增 `const SIDEBAR_BREAKPOINT = 680;`，与 CSS 断点对齐；`toggleSidebar()` 按断点分流：移动端切抽屉 `.open` + 遮罩，桌面端切 `.collapsed` + `.app-shell.sidebar-collapsed`，两者互斥（切换时清掉对方状态）。
  - `syncSidebarState()` 统一同步 `#mobile-menu` 的 `aria-expanded` / `title` 与品牌行按钮的图标（`«` 收起 / `»` 展开）。
  - `index.html`：折叠按钮移到 `.brand` 行末尾（`class="sidebar-fold-btn"`），顶栏 `#mobile-menu` 保持常驻；`initEvents()` 里它的点击改为 `toggleSidebar()`，并补了 150ms 防抖的 `resize` 监听。
  - `style.css`：删除无效的 grid 规则，改为
    ```css
    .app-shell.sidebar-collapsed .main { width: 100%; margin-left: 0; }
    .app-shell.sidebar-collapsed .sidebar { transform: translateX(-100%); }
    ```
    `.mobile-menu` 默认即 `display: inline-flex`（34×34、圆角 9px、hover 高亮）。
- **自检**：`node _smoke_test.js` 覆盖 1440px / 900px（旧代码失效区间）/ 500px 三档的折叠→展开状态机、aria 同步、入口元素位置、CSS 规则存在性、断点与版本一致性，全部 PASS。

### 4.3 题库热升级与缓存失效（`app.js` + `_parse_cleaner.js`）
- **问题**：改了 `SAMPLE_CARDS` 但用户刷新后仍看到旧卡片——`app.js` 里版本判断写的是 `storedVer !== '2.3'` 而写入的值是 `'2.5'`，逻辑自相矛盾；`index.html` 的 `?v=` 也没人维护。
- **修法**：
  - 新增 `const DATA_VERSION = '2.10';`（当前值），`state.cards` 初始化与 `hydrate()` 两处统一用它判断与写入。
  - `_parse_cleaner.js` 在注入 `SAMPLE_CARDS` 后**自动递增** `DATA_VERSION`（2.7 → 2.8 → 2.9 → 2.10 即由此产生），并同步改写 `index.html` 的 `app.js?v=` / `style.css?v=`。
  - **IndexedDB 覆盖陷阱**：`state.cards` 重建时会把 `localStorage.arch-version` 立刻写成新版本，而 `IndexedDB` 里可能还是旧卡片；若 `hydrate()` 只比对版本号，就会命中旧数据，表现正是「代码改了、标题还是旧的」。因此新增 `let cardsRebuiltFromBuiltin` 标志，`hydrate()` 的条件改为 `!cardsRebuiltFromBuiltin && storedVer === DATA_VERSION && …`，本次重建过就强制用内置题库覆盖 IndexedDB。
  - 因此**以后重编译题库不再需要手动改版本号**，刷新页面（必要时 Ctrl+F5）即可看到新标题。

---

## 5. 维护与更新工作流

### 5.1 修改原始题库 / 新增 Markdown 资料
若后续需要更新考点或新增科目笔记（文件存放在 `F:\work\fuxi\zl` 或其他目录）：
1. 将新的 Markdown 文件规范命名并放入相应目录。
2. 在项目根目录运行解析编译脚本：
   ```powershell
   cd F:\work\architecture-review
   node _parse_cleaner.js
   ```
   *该脚本会自动扫描全部笔记、智能清洗、更新 `all-cards.json`，并将编译后的全量 JSON 数组替换注入到 `app.js` 的 `const SAMPLE_CARDS = [...]`。*
3. **无需手动改版本号**：脚本会自动递增 `app.js` 的 `DATA_VERSION`（如 `2.10` → `2.11`）并同步改写 `index.html` 里的 `app.js?v=` / `style.css?v=`，浏览器刷新即拿到新题库。
4. 建议随后跑一次标题体检，确认没有引入新的重复/残句标题：
   ```powershell
   node _title_report.js
   ```

### 5.2 语法校验与提交部署
提交前务必进行语法检查：
```powershell
# 1. 语法检查
node --check F:\work\architecture-review\app.js
node --check F:\work\architecture-review\_parse_cleaner.js

# 2. 冒烟测试（侧边栏状态机 / 入口元素 / CSS 规则 / 断点与版本一致性）
node _smoke_test.js

# 3. 提交并推送到 GitHub
git add .
git commit -m "feat/fix: 更新说明"
git push origin main
```
推送至 GitHub 后，GitHub Pages 会在 1~2 分钟内自动完成线上更新。

### 5.3 手工验收清单（浏览器里 30 秒确认）
1. 打开 `index.html`（`file://` 或 Pages 均可），**Ctrl+F5 硬刷新**。
2. 进入「复习卡片」，翻到标题为 `功能组成` 的那几张卡 → 应分别显示 `办公建筑 · 功能组成` / `学校建筑 · 功能组成` / `医疗建筑 · 功能组成`。
3. 桌面端点顶栏左上角 `☰` → 侧边栏收起、正文区占满整宽（左侧无 248px 空白）；再点一次 → 侧边栏滑回，品牌行的 `«`/`»` 图标随之切换。
4. 把窗口拖到 700~900px 宽，重复第 3 步 → 仍然有效（旧版本这段区间是死区）。

---

## 6. 后续演进建议与待办备忘
1. **题库导出增强**：当前 Anki 导出为基础 TSV，后续可扩展支持导出带 APKG 格式的卡片包。
2. **知识点图谱**：未来可在 Materials 或 Dashboard 页面基于科目与章节层级，接入轻量级 Canvas 知识点导图。
3. **跨设备进度同步**：当前基于本地 IndexedDB，若需要多端实时同步进度，可考虑接入 WebDAV（如坚果云）或轻量级云端同步端点。
