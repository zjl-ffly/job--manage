## 目录结构总览

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

#### 方式 A：使用 pnpm

```bash
pnpm install
pnpm dev
```

#### 方式 B：使用 npm

```bash
npm install
npm run dev
```
