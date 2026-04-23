# Job Management（教学向超详细版）

> 一个用于演示“Job 列表 + 详情步骤 + 右侧上下文面板 + 过滤条件持久化到 URL”的前端小项目。  
> 技术栈：**Vite + React 18 + TypeScript + Ant Design + Zustand + Dayjs**，并内置 **DEV 环境的 API Mock（fetch 拦截）**，用于脱离后端也能完整跑通 UI/数据流。

---

## 你将学到什么

- **如何从 0 构建一个现代 React 工程**：Vite、TS、React JSX 新运行时、模块解析、构建/预览流程。
- **如何组织“领域模型（domain）→ API 层 → 状态层（store）→ UI 组件层”的分层**。
- **如何在无后端时做可控的 Mock**：用 fetch monkey-patch，把“接口契约”固定下来。
- **如何把筛选条件写进 URL**：刷新不丢、可分享链接、可回退前进。
- **为什么选择 Ant Design / Zustand / Dayjs**，以及替代方案与取舍。

---

## 目录结构总览（先看一遍，后面逐层展开）

```text
job-management/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  src/
    main.tsx                 # 应用入口：挂载 React、注入样式、DEV 安装 API Mock
    App.tsx                  # 主要页面：三栏布局、筛选、Job 详情、步骤切换、登录态
    styles.css               # 全局样式与布局（CSS 变量 + 三栏/动画）
    domain/
      types.ts               # 领域模型：Job/Step/Filters/User/SubContext 等类型
      mock.ts                # （备用）领域层 mock 数据（当前主要 mock 在 api/mock.ts）
    api/
      index.ts               # API 函数：fetchCurrentUser/getJobList/...
      request.ts             # requestJson + ApiError + timeout + installApiMocks
      mock.ts                # mock 数据与 mock 行为：模拟登录、Jobs、SubContext 等
    store/
      appStore.ts            # Zustand vanilla store：全局 user + actions
      index.ts               # 统一导出
    hooks/
      useQueryState.ts       # URL query <-> React state 的双向绑定
    components/
      FiltersBar.tsx         # 顶部筛选条 + 新建 Job
      JobList.tsx            # 左侧 Job 列表
      JobSteps.tsx           # 中间 Job 详情 + 步骤列表
      UploadPanel.tsx        # 右侧上下文（当前展示 Overview）
    types/
      upload.ts              # UploadedFile 类型
```

---

## 快速开始（能跑起来最重要）

### 运行环境要求

- **Node.js**：建议 18+（React/Vite 常用组合；Node 20 也可以）
- 包管理器：推荐 **pnpm**（原因见下文“锁文件与包管理器选择”）

### 安装依赖

> 这个仓库同时存在 `pnpm-lock.yaml` 和 `package-lock.json`。  
> 从锁文件内容来看，`pnpm-lock.yaml` 里包含 `vitest`/Testing Library 等，而 `package.json` 里暂未列出测试脚本与依赖；因此更像是“主要用 pnpm 维护依赖”，同时又残留了 npm 的 lock。

#### 方式 A：使用 pnpm（推荐）

```bash
pnpm install
pnpm dev
```

#### 方式 B：使用 npm（可用，但不推荐混用）

```bash
npm install
npm run dev
```

> **不要混用**：同一个仓库同时用 pnpm 和 npm 安装，会导致依赖解析/版本漂移、node_modules 结构差异、CI 与本地不一致。  
> 教学建议：团队选定一个包管理器后，只保留对应 lock 文件。

### 常用命令（对应 `package.json`）

- **开发模式**：`pnpm dev`（等价 `vite`）
- **生产构建**：`pnpm build`（等价 `tsc -b && vite build`）
- **本地预览生产包**：`pnpm preview`（等价 `vite preview`）

---

## 构建与运行到底发生了什么（从命令到浏览器）

这一节用“链路视角”解释：你敲下命令后，工程里每一层做了什么。

### 1）`pnpm dev`：Vite 开发服务器

对应脚本：`"dev": "vite"`。

- Vite 会启动一个开发服务器，默认提供：
  - **ESM 原生模块加载**（开发时无需打包，启动快）
  - **HMR 热更新**（改代码秒刷新）
  - **依赖预构建**（把三方依赖用 esbuild/rollup 处理成更适合浏览器加载的格式）
- `vite.config.ts` 里把 host 固定成 `127.0.0.1`：
  - **为什么**：避免局域网暴露（更安全、更可控），也减少某些公司网络环境下的访问干扰

### 2）`index.html`：入口 HTML

Vite 把 `index.html` 当成“第一等公民”，并把模块入口写成：

```html
<script type="module" src="/src/main.tsx"></script>
```

- **为什么这样做**：Vite 能在 dev 时直接解析这个入口模块（TSX 会被插件处理），build 时再统一产物化。

### 3）`src/main.tsx`：挂载 React + 安装 mock + 全局样式

这个文件做了 4 件关键事：

1. 引入 Ant Design 的 reset：`import 'antd/dist/reset.css'`
2. 引入全局样式：`import './styles.css'`
3. DEV 环境下安装 API Mock：`if (import.meta.env.DEV) installApiMocks()`
4. `ReactDOM.createRoot(...).render(<App />)`

**为什么把 mock 安装放在入口**：

- 入口位置最早执行，能保证后续任何 `fetch('/api/...')` 都会被拦截到。
- 只在 DEV 安装：build/preview 不会“偷偷改写 fetch”，避免生产风险。

### 4）`pnpm build`：为什么先跑 `tsc -b` 再跑 `vite build`

对应脚本：`"build": "tsc -b && vite build"`。

- **`tsc -b`（TypeScript build mode）在这里的作用**：做一次“更严格、更接近 CI 的类型检查”。
  - 虽然 Vite 在开发时也会做一定的 TS 处理，但它更偏“快速开发体验”，并不等同于完整的 `tsc` 类型检查。
  - 把 `tsc` 放在构建链条里，可以更早发现类型层面的错误（例如某个字段被改名但 UI 没同步）。
- **为什么放在 `vite build` 之前**：
  - 类型不通过就直接失败，避免生成一份“类型上已经不正确”的产物。
  - 在真实工程里，这通常也是 CI 的默认策略。

### 5）`pnpm preview`：本地验证“生产包”行为

对应脚本：`"preview": "vite preview"`。

- `dev` 与 `preview` 的差别：
  - `dev`：开发服务器 + HMR +（本项目）DEV mock 拦截
  - `preview`：用一个静态服务器跑 **`vite build` 的产物**，更接近线上
- 教学提醒：
  - 本项目 mock 只在 DEV 安装，所以 `preview` 下访问 `/api/...` 会走真实网络请求；没有后端时会失败

---

## 依赖选择（为什么选这些包，而不是别的）

> 这里的目标不是背 API，而是理解：**你要解决的问题是什么**，这些包各自解决哪一块，以及替代方案的成本。

### Vite（`vite` + `@vitejs/plugin-react`）

- **解决的问题**：开发启动慢、热更新慢、构建链条重。
- **选择原因**：
  - dev 走原生 ESM，速度非常快
  - React 插件提供 JSX/TSX 转换、Fast Refresh 等
- **替代方案**：
  - Webpack：生态成熟但配置成本更高，启动更慢
  - Next.js：更偏全栈框架（路由/SSR），本项目是单页演示，不需要那么重

### React 18（`react` / `react-dom`）

- **解决的问题**：组件化 UI、声明式渲染、生态与工程体系。
- **选择原因**：生态最完整、与 Ant Design 配合成熟。

### TypeScript（`typescript`）

- **解决的问题**：领域模型复杂时，靠类型约束降低“UI 与数据契约不一致”的错误概率。
- **本项目的关键点**：`src/domain/types.ts` 把 Job/Step/Filters 等定义成“可复用的契约”，让 API 层与 UI 层共享同一个真相来源。

### Ant Design（`antd` + `@ant-design/icons`）

- **解决的问题**：快速搭建一致的 UI 组件、表单/选择器/布局等基础能力。
- **选择原因**：
  - 组件齐全：`Layout/Menu/Card/Select/DatePicker/Tabs/Modal/Tag/...`
  - 默认交互与可用性较好，适合教学演示“搭 UI + 业务状态”
- **替代方案**：
  - MUI：更偏 Material Design 体系
  - Tailwind + Headless UI：更灵活，但需要更多样式与组件组合工作量

### Zustand（`zustand`）

- **解决的问题**：跨组件共享状态（本项目主要是 user 登录态）。
- **为什么不用 Redux**：
  - 本项目状态规模小，Redux 的样板代码会“喧宾夺主”，不利于教学聚焦
  - Zustand 更轻量，API 更直接
- **这里的一个教学点**：项目使用的是 `zustand/vanilla` 的 `createStore`，再用 `useStore` 订阅：
  - 好处：store 本体与 React 解耦（未来可用于非 React 场景、或更容易测试/复用）

### Dayjs（`dayjs`）

- **解决的问题**：日期格式化、范围判断（筛选 start/end）。
- **选择原因**：体积小、API 简洁；替代 `moment` 的常见选择。

---

## TypeScript / tsconfig 关键配置解读（为什么这么配）

`tsconfig.json` 中比较关键的点：

- **`target: "ES2022"`**：输出面向现代浏览器（Vite 默认也偏现代）；开发体验更好。
- **`module: "ESNext"` + `moduleResolution: "Bundler"`**：与 Vite 的 bundler 行为一致，减少“TS 能过、打包报错”的分裂。
- **`jsx: "react-jsx"`**：React 17+ 的新 JSX 运行时，不需要手动 `import React` 才能写 JSX（虽然项目里仍有部分文件显式 import React）。
- **`noEmit: true`**：TypeScript 只做类型检查，不负责产物输出；产物交给 Vite。
- **`types: ["vitest/globals"]`**：为测试提供全局类型（尽管仓库里暂未看到 `vitest.config.*` 与测试用例文件）。

> 教学提示：如果未来要补测试脚本，需要把 `vitest` 与 `@testing-library/*` 明确写回 `package.json`，并补上 `test` 脚本；否则依赖只存在于 lock，别人拉下来可能“看不到测试入口”。

---

## “分层”设计：domain / api / store / components 是怎么协作的

这一节是整份 README 的核心：让读者理解项目不是“堆组件”，而是有清晰边界。

### 1）domain 层：定义业务语言（类型就是契约）

文件：`src/domain/types.ts`

- `Job` / `JobListItem`：列表展示与详情展示的最小模型
- `JobStepKey` / `JobStepStatus` / `JobStep`：步骤/状态
- `JobFilters`：筛选条件（name/type/status/startDate/endDate）
- `User`：登录态最小信息
- `SubContext`：右侧面板的“上下文信息”（概览字段）

**为什么先建 domain**：

- UI/接口/mock 的字段都围绕它展开，减少“同一个概念在不同文件叫不同名字”的混乱。
- TypeScript 能把“字段缺失/类型不对”在编译期暴露出来。

### 2）api 层：把“接口”封装成函数（UI 不直接写 fetch）

文件：`src/api/index.ts`

- `fetchCurrentUser()` → `GET /api/user`
- `fetchCurrentUserForLogin()` → `GET /api/user?login=1`
- `loginOut()` → `POST /api/logout`
- `getAllName/getAllType/getAllStatus` → 筛选项
- `getJobList/getJobById/deleteJobById` → Job 列表/详情/删除
- `getSubContextById(jobId, stepKey)` → 右侧上下文（与步骤联动）

**为什么 UI 不直接 fetch**：

- UI 只关心“我要用户/列表/详情”，不关心 URL、method、encode、错误格式。
- 将来接真实后端时，只需要改 api 层，而不是全项目搜 fetch。

### 3）request 层：统一错误、超时、mock 安装

文件：`src/api/request.ts`

#### `requestJson<T>()` 设计点

- **超时**：默认 15s，用 `AbortController` 实现
- **abort 合并**：`mergeAbortSignals` 把调用方 signal 与 timeout signal 合并
- **解析响应**：
  - 204 → 返回 `null`
  - JSON → `res.json()`
  - 其他 → `res.text()`
- **统一错误**：`ApiError` 包含 `url/method/status/body`，UI 可用 `e.message` 直接提示

**为什么要把这些做成统一层**：

- 避免每个接口都写一遍 try/catch/timeout/parse。
- 统一错误结构后，UI 的错误提示更一致。

#### `installApiMocks()`：DEV fetch 拦截

- 只在 DEV 被 `src/main.tsx` 调用
- monkey-patch `globalThis.fetch`
- 通过 `matchMock(url, init)` 判断是否命中 mock 路由

**为什么用 fetch 拦截而不是引入 MSW**：

- 教学目的：让读者看清“mock 的本质是：在网络边界把请求替换成响应”
- 成本更低：零额外依赖、代码完全可读
- 代价：功能较简化（不如 MSW 强大），但对于这个 demo 足够

### 4）store 层：全局状态最小化（只放 user）

文件：`src/store/appStore.ts`

- 只存了 `user` 与 `actions.setUser`
- 其他 UI 状态（当前 tab、filters、jobList、selectedJob…）都放在 `App.tsx` 本地 state

**为什么全局状态要“克制”**：

- 全局状态越多，耦合越高，调试与回溯越难。
- 这个项目里，真正跨组件且“全局语义明确”的只有 user 登录态。

### 5）components 层：把 UI 分块，但逻辑仍由 App 统筹

> 注意：这里的 UI 组件设计是“**展示与交互**”，而不是“数据源”。数据获取、筛选、联动、并发控制都由 `App.tsx` 统一编排。

- `FiltersBar`：只负责渲染筛选控件与触发回调；筛选值由 `App.tsx` 持有并写入 URL
- `JobList`：只负责渲染列表与选中态；点击后把 `jobId` 回传
- `JobSteps`：渲染 Job 的 step 列表与删除入口；“选中 step”由 `App.tsx` 控制
- `UploadPanel`：根据 `subContext`/`uploaded` 计算展示节点与概览信息

**为什么让 `App.tsx` 做“编排层”**：

- demo 的重点是让读者看清“数据怎么流”。编排集中在一个地方更容易顺着读。
- 后续复杂化时，再把编排下沉到自定义 hook（例如 `useJobs()`、`useJobDetail(jobId)`），UI 组件就会更薄。

---

## App 的数据流与交互流（从打开页面到点击每一步）

文件：`src/App.tsx`

你可以把 `App.tsx` 理解成一个“状态机 + UI 编排器”。下面按用户动作拆解。

### 1）应用启动：先拿 user，再决定是否加载业务数据

启动时 `App.tsx` 会：

- 调用 `fetchCurrentUser()`
- 成功后写入全局 store：`actions.setUser(u)`
- 如果 `u.id` 为空：认为未登录，展示登录卡片
- 如果已登录：并行加载初始化数据（筛选项 + job 列表）

关键点：`loadAuthedData()` 用 `Promise.all` 同时请求：

- `getAllName/getAllType/getAllStatus/getJobList`
- **为什么并行**：减少首屏等待时间（这是最容易讲清的“性能优化”之一）

### 2）登录/退出登录：完全由 mock 接口驱动

这一块是整个 demo 最容易被忽略、但最关键的“应用门禁（gate）”逻辑：**先判断有没有登录，再决定是否加载业务数据与渲染主界面**。

#### 登录态的唯一判定：`user.id` 是否为空

- `App.tsx` 从全局 store 读 `user`
- UI 判断是：`if (!user?.id) ...`（展示登录卡片），否则展示三栏主界面
- **为什么用 `id` 做判定**：
  - 在真实系统中，用户对象常见必填字段就是 `id`
  - 相比 `isLoggedIn: boolean`，直接用 `id` 可以少一份状态，避免“布尔值与 user 不一致”的双写问题

#### “启动时自动登录检测”的流程（页面打开就发生）

1. `App.tsx` 的 `useEffect` 在组件首次渲染后触发
2. 调用 `fetchCurrentUser()`（`GET /api/user`）
3. 成功后：`actions.setUser(u)` 写入 store
4. 如果 `u.id` 为空：清空列表与选中态，停在登录页
5. 如果 `u.id` 有值：继续 `loadAuthedData()` 拉取 filters/jobList 等业务数据

> 这就是典型的前端“Auth Gate”：**用户态是第一优先级的前置条件**。

#### 点击“登录”按钮发生什么

登录按钮在 `App.tsx` 的未登录视图里：

1. 用户点击“登录”
2. 调用 `fetchCurrentUserForLogin()`（`GET /api/user?login=1`）
3. mock 会把登录态置为 true，并返回一个带 `id` 的 `User`
4. `actions.setUser(u)` 写入 store
5. 立即调用 `loadAuthedData()` 拉取 filters/jobList（让界面切到已登录主界面）

#### 点击“退出登录”发生什么

右上角退出按钮会：

1. 调用 `loginOut()`（`POST /api/logout`）
2. mock 把登录态置为 false
3. 前端 `window.location.reload()` 强制刷新
4. 刷新后走“启动时自动登录检测”，因为 `/api/user` 返回空 `id`，所以停在登录页

**为什么退出要 reload（而不是手动清 state）**：

- demo 场景下，reload 是最直观的“回到干净初始态”的方式
- 也能顺带演示“入口 `main.tsx` 会重新执行、mock 会重新安装、`App` 会重新跑启动链路”
- 真实生产一般会做更细致的清理（清缓存、重置 store、重置 query 等），这里用 reload 是一种“教学上的简化”

#### mock 端如何实现“登录持久化”

mock 文件：`src/api/mock.ts`

- mock 用模块内变量 `loggedIn` 表示当前登录态
- 同时把它写入 `localStorage` 的 `jm_logged_in`：
  - 登录：写 `'1'`
  - 退出：写 `'0'`
- 下次刷新时，`mockGetCurrentUser()` 会先读 `localStorage` 来恢复 `loggedIn`

**为什么 mock 要做持久化**：

- 如果不持久化，刷新就会“自动回到登录态/或自动登出”，会让读者误解真实系统行为
- 有了持久化，你可以演示：刷新页面 → 仍然保持登录/退出结果（更贴近真实体验）

#### login 相关接口在 mock 中的契约

在 mock 中：

- `GET /api/user`：返回当前登录态
- `GET /api/user?login=1`：模拟登录成功
- `POST /api/logout`：模拟退出

### 3）筛选条件：写进 URL，而不是只放在 React state

文件：`src/hooks/useQueryState.ts`

#### `useQueryState` 的 API 设计

调用形态：

- `const [activeTab, setActiveTab] = useQueryState('tab', { ... })`
- `const [qType, setQType] = useQueryState('type', { ... })`

它要求你提供三件事：

- **`defaultValue`**：当 URL 没这个参数时用什么
- **`parse(raw)`**：把 URL 字符串解析成你的业务类型（含兜底）
- **`serialize(value)`**：把业务值序列化回 URL（返回 `null` 表示删除该 query）

#### 为什么这种 hook 是一个“工程化小台阶”

如果你只用 `useState`：

- 刷新会丢筛选
- 链接不可分享
- 浏览器回退/前进和 UI 不一致

而 `useQueryState` 通过 `pushState/replaceState + popstate` 做到了：

- UI → URL：选择器变化立即更新 query
- URL → UI：回退/前进时，state 自动跟着变

额外细节：部分 query 使用了 `replace: true`（例如 name/type/status/start/end）

- **为什么**：用户连续调整筛选时，不希望浏览历史堆满一串“细碎状态”（可用性更好）

### 4）列表/详情联动：`selectedJobId` 是“主键”，其余派生

核心状态（均在 `App.tsx`）：

- `jobList: JobListItem[]`
- `selectedJobId?: string`
- `selectedJob?: Job`
- `selectedStepKey: JobStepKey`
- `selectedSubContext?: SubContext`
- `uploadsByJobId: Record<string, UploadedFile | undefined>`

当 `selectedJobId` 变化时，触发 effect：

1. `getJobById(selectedJobId)` 拉取详情
2. 默认选中第一步（`job.steps[0]`）
3. `getSubContextById(job.id, stepKey)` 拉取右侧上下文

这里用 `AbortController` 避免竞态：

- **场景**：快速点击不同 Job，先发出的请求可能后返回
- **做法**：cleanup 里 abort，上一次请求结果不会覆盖当前选中态
- **为什么要这么做**：这是前端最常见的异步竞态问题之一，demo 给了一个清晰可学习的解法

### 5）过滤逻辑：纯函数 + memo

`filteredJobs` 由 `jobList` 派生：

- 按 type/status/name 过滤
- 按日期范围过滤（`inRangeISO` 用 dayjs 以“天”为边界）
- 最后按 `createdAt` 降序排序

### 6）步骤切换：右侧上下文跟着 `stepKey` 走

当用户点击某一步：

- `setSelectedStepKey(key)`
- `getSubContextById(selectedJobId, key)` 并更新 `selectedSubContext`

> 教学提示：右侧组件目前叫 `UploadPanel`，但它展示的是“当前 step 的上下文概览”。未来可以重命名为 `StepContextPanel` 让命名更贴近含义。

---

## Mock 是如何工作的（把“接口契约”固化下来）

文件：`src/api/request.ts` + `src/api/mock.ts`

### 路由匹配：`matchMock(url, init?)`

它做了两件事：

1. 把请求转换成 `method + pathname + query`
2. 用一系列 if 判断来命中 mock 路由

例如：

- `GET /api/jobs` → `mockGetJobList()`
- `GET /api/jobs/:id` → `mockGetJobById(id)`
- `DELETE /api/jobs/:id` → `mockDeleteJobById(id)`
- `GET /api/subcontext/:jobId?step=...` → `mockGetSubContextById(jobId, stepKey)`

### 数据来源：`mock.ts` 中的 `mockJobs`

`mockJobs` 是一个可变数组（会被删除接口修改）：

- **优点**：模拟了“删除后列表减少”的真实感
- **代价**：这是“内存态 mock”，刷新页面会回到初始数据（对 demo 来说可接受）

### 为什么 mock 也要“像后端”

你会注意到：

- mock 返回的是带 status 的 Response
- 错误时返回 `{ message: '...' }`，并由 `requestJson` 统一提取 message

这让 UI 只需要：

- `message.error(e.message)` 或兜底提示

而不需要每个地方都写“如果是 404 怎么办、body.message 存在怎么办……”

---

## UI 组件逐个拆解（读代码时怎么读）

### `src/components/FiltersBar.tsx`

职责：

- 渲染 3 个 Select（name/type/status）+ 2 个 DatePicker（start/end）+ 新建按钮
- 通过 `onChange(patch)` 把变更“补丁”回传给 `App.tsx`

为什么用 patch：

- 避免每次都传完整 filters
- UI 控件变更天然是“局部更新”

“新建 Job”为什么在前端生成：

- demo 目标是练数据流，而不是后端创建流程
- 通过 `onNewJob(job)` 立刻插入列表并选中，给用户即时反馈

### `src/components/JobList.tsx`

职责：

- 列表渲染 + 选中态样式
- 状态 tag（completed/running/failed/queued）用不同颜色与 icon

教学点：

- `selectedId` 作为纯 props 控制选中态，组件本身不持有选中状态

### `src/components/JobSteps.tsx`

职责：

- 展示 job 基础信息、完成步数
- 展示 steps 列表，点击切换 step
- 删除按钮调用 `onDeleteJob()`

注意：

- `onUpload/uploaded/onRenameMock` 目前未真正使用（用 `void ...` 规避未使用告警的倾向）
- 教学建议：未来补齐 upload/rename 的真实交互时，再把这些 props 落地成按钮或上传控件

### `src/components/UploadPanel.tsx`

职责：

- 展示当前 step 的 Overview（state/detail/step id/runtime status/rename state）
- 在没有 `subContext` 时，基于 `job.steps` 与 `uploaded` 做兜底推导

为什么需要“兜底推导”：

- mock/接口可能暂时不返回某些字段
- UI 仍能展示有意义的信息，减少空白/undefined 体验

---

## 常见问题（Troubleshooting）

### 1）启动后页面空白 / 报错找不到依赖

- **原因**：包管理器混用导致依赖树不一致（`pnpm-lock.yaml` 与 `package-lock.json` 同时存在）。
- **解决**：
  - 选择一种包管理器重新安装（推荐 pnpm）
  - 删除 `node_modules` 后重新 `pnpm install`

### 2）接口请求失败（404/网络错误）

- **确认是否在 DEV**：只有 DEV 才会调用 `installApiMocks()` 拦截 fetch
- **确认请求路径**：本项目 API 以 `/api/...` 开头
- **理解差异**：
  - DEV：mock 拦截返回数据
  - build/preview：不会拦截（需要真实后端或自行加 mock）

### 3）筛选条件不生效/刷新丢失

- 本项目筛选是写到 URL query（`useQueryState`）
- 如果你手动改了 hook 的 `serialize/parse`，可能导致解析失败回到默认值

---

## 如何在这个项目上继续扩展（练习题）

下面是一些非常适合“学习型 PR”的扩展方向，每个都对应真实工程常见需求：

- **补齐真实的上传交互**：
  - 在 `JobSteps` 的 `upload` 步骤里增加 Upload 按钮（Antd Upload）
  - 上传后调用 `onUpload(file)`，并在右侧显示上传文件信息
- **把右侧面板泛化为多步骤**：
  - 将 `UploadPanel` 重命名为 `StepContextPanel`
  - 根据 `selectedStepKey` 切不同的 tabs/内容
- **把编排逻辑抽成 hooks**：
  - `useAuthedBootstrap()`
  - `useJobDetail(selectedJobId)`
- **引入测试并写 2 个关键用例**：
  - `useQueryState`：serialize/parse + popstate 同步
  - `requestJson`：timeout/错误 message 提取

---

## 许可证与声明

- 这是一个用于学习/演示的前端项目结构示例；若用于生产，请补齐：真实后端对接、权限控制、测试、错误监控、CI 等。
