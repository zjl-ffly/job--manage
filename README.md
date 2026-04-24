# Job Management

基于 **React + Vite + TypeScript + Ant Design** 的 Job 管理前端示例：三栏布局（列表 / 步骤 / 上下文）、URL 同步筛选、登录态与内存 Mock API。

---

## 本地开发

```bash
npm install
npm run dev
```

## 常用脚本

| 命令                 | 说明                               |
| -------------------- | ---------------------------------- |
| `npm run dev`        | 启动开发服务器（默认 `127.0.0.1`） |
| `npm run build`      | `tsc -b` 类型检查 + Vite 生产构建  |
| `npm run preview`    | 预览构建产物                       |
| `npm test`           | 运行 Vitest 单测（一次性）         |
| `npm run test:watch` | Vitest 监听模式                    |

---

## 静态部署访问

```text
https://job-manage-9c8j.vercel.app/?name=Job+Name+for+Sample+A
```

可通过 URL Query 同步筛选条件（如 `name`、`type`、`status`、`tab` 等，见 `App.tsx` 中 `useQueryState`）。

---

## 功能概要

- **登录**：未登录时仅展示登录卡片；登录后加载 Job 列表与筛选选项。
- **筛选与新建**：顶部 `FiltersBar` 支持名称/类型/状态/日期范围；可新建 Job（写入 mock 列表）。
- **三栏布局**：左侧 Job 卡片列表；中间当前 Job 的步骤与时间线；右侧按当前步骤展示 `UploadPanel`（Overview 等）。
- **上传（Upload）**：中间步骤行点击 **upload** 触发文件选择，调用 `uploadJobFile`（mock），仅更新 `uploadedFile` 与 **upload** 步骤状态，**不依赖重命名**。
- **重命名（Rename）**：点击 **Rename** 打开弹窗输入新名称，调用 `renameJobFile`（mock），更新 **`Job.name`**（左侧与中间标题）、`renamedName` 与 **rename** 步骤；**不依赖上传**。
- **刷新**：上传或重命名成功后，应用会再次请求 `getJobList`、`getJobById` 与当前步骤的 `getSubContextById`，保证列表与详情一致。`getJobById` 的 mock 返回**浅拷贝**，避免 React 因引用相同跳过更新。

---

## 单元测试

- 框架：**Vitest**（`vite.config.ts` 中 `test` 配置）。
- 用例：`src/api/mock.test.ts`
- **mockGetJobById 测试**
  验证每次调用返回新的对象引用，避免 React 引用相等导致跳过渲染
- **mockUploadJobFile 测试**
  验证上传文件只完成 upload 步骤并写入 uploadedFile
  确保不修改 Job 名称
  **mockRenameJobFile 测试**
  验证 trim 后更新 name、renamedName，并将 rename 步骤标为 completed
  验证空白名称返回 undefined，不修改 store

- 执行：`npm test`。

---

## Mock API（`src/api/index.ts`）

当前数据与行为均在 **`src/api/mock.ts`** 内存中维护，典型导出函数如下：

| 函数                                                         | 说明                                         |
| ------------------------------------------------------------ | -------------------------------------------- |
| `fetchCurrentUser` / `fetchCurrentUserForLogin` / `loginOut` | 登录态模拟                                   |
| `getAllName` / `getAllType` / `getAllStatus`                 | 筛选项                                       |
| `getJobList` / `getJobById`                                  | Job 列表与详情                               |
| `deleteJobById`                                              | 删除 Job                                     |
| `getSubContextById`                                          | 按步骤 key 拉取右侧上下文（Overview 文案等） |
| `uploadJobFile(jobId, file)`                                 | Mock 上传                                    |
| `renameJobFile(jobId, newName)`                              | Mock 重命名（同步 Job 展示名称）             |

`src/api/request.ts` 提供基于 `fetch` 的 `requestJson` 与可选 `installApiMocks`；**当前页面数据流主要走 `api/index.ts` 的 Promise mock**，与 `request.ts` 路由可并存扩展。

---

## 领域模型要点（`src/domain/types.ts`）

- **`Job`**：`steps`（含 `upload` / `rename` 等）、可选 **`uploadedFile`**（上传结果）、可选 **`renamedName`**（重命名步骤侧展示）、以及列表/标题使用的 **`name`**。
- **`JobListItem`**：列表行摘要字段。
- **`SubContext`**：右侧 Overview 等展示用结构。

---

## 目录结构总览

```text
job-management/
  index.html
  vite.config.ts           # Vite + Vitest 配置
  tsconfig.json
  package.json
  src/
    main.tsx               # 应用入口：挂载 React、全局样式
    App.tsx                # 三栏布局、筛选、登录、上传/重命名后刷新
    styles.css             # 全局样式与布局
    domain/
      types.ts             # Job / Step / Filters / User / SubContext 等
      mock.ts              # （备用）领域层 mock
    api/
      index.ts             # 对外 API（含 uploadJobFile、renameJobFile）
      request.ts           # requestJson、ApiError、可选 fetch mock
      mock.ts              # 内存 Jobs、SubContext、上传/重命名 mock
      mock.test.ts         # Vitest：mock 行为单测
    store/
      appStore.ts          # Zustand：user + actions
      index.ts
    hooks/
      useQueryState.ts     # URL query ↔ React state
    components/
      FiltersBar.tsx
      JobList.tsx
      JobSteps.tsx         # 步骤 + upload 文件选择 + rename Modal
      UploadPanel.tsx      # 右侧步骤上下文（Overview）
    types/
      upload.ts            # UploadedFile（历史/兼容类型，主流程以 Job.uploadedFile 为准）
```

---

## 技术栈

- React 18、Vite 5、TypeScript 5
- Ant Design 6、Zustand、dayjs
- Vitest 3（单测）
