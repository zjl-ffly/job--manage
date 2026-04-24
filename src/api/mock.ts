import type { Job, JobFilters, JobListItem, JobStepKey, JobStepStatus, SubContext, TopTab, User } from '../domain/types'

/**
 * GET /api/user
 * 用于：顶部用户信息展示、以及初始化时的兜底接口。
 */
export const mockUser: User = {
  id: 'u_1',
  name: 'User'
}

let loggedIn = true

export function mockGetCurrentUser(): User {
  try {
    const persisted = globalThis.localStorage?.getItem('jm_logged_in')
    if (persisted === '0') loggedIn = false
    if (persisted === '1') loggedIn = true
  } catch {
    // ignore
  }
  if (!loggedIn) return { id: '', name: '' }
  return mockUser
}

export function mockLogin(): User {
  loggedIn = true
  try {
    globalThis.localStorage?.setItem('jm_logged_in', '1')
  } catch {
    // ignore
  }
  return mockUser
}

export function mockLoginOut(): { ok: true } {
  loggedIn = false
  try {
    globalThis.localStorage?.setItem('jm_logged_in', '0')
  } catch {
    // ignore
  }
  return { ok: true }
}

/**
 * GET /api/bootstrap
 * 用于：应用启动初始化（tabs、filters、jobs、selectedJobId 等）。
 *
 * 这里拆成多个字段常量，方便未来按真实后端接口拆分。
 */
export const mockTopTabs: TopTab[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'job', label: 'Job' },
  { key: 'records', label: 'Records' }
]

/**
 * GET /api/bootstrap.filters
 */
export const mockDefaultFilters: JobFilters = {
  name: '',
  type: 'All',
  status: 'All',
  startDate: undefined,
  endDate: undefined
}

export const mockAllNames: string[] = ['All', 'Job Name for Sample A', 'Job Name for Sample B', 'Nightly Ingest - Customer C', 'Quick Upload - Type A']

export const mockAllTypes: Array<JobFilters['type']> = ['All', 'Type A', 'Type B', 'Type C']

export const mockAllStatuses: Array<JobFilters['status']> = ['All', 'queued', 'running', 'completed', 'failed']

function mkJob(partial: Partial<Job> & Pick<Job, 'id' | 'name' | 'type' | 'status' | 'createdAt' | 'runtimeId'>): Job {
  return {
    ...partial,
    steps: partial.steps ?? [
      {
        key: 'upload',
        title: 'Upload',
        description: "Upload files to the first step's input directory of this run.",
        status: 'completed'
      },
      {
        key: 'rename',
        title: 'Rename File',
        description: 'Rename the file as needed.',
        status: 'completed'
      },
      {
        key: 'approval',
        title: 'Send Approval Notification',
        description: 'An approval notification will be sent out.',
        status: 'completed'
      },
      {
        key: 'review',
        title: 'Wait For Review',
        description: 'Waiting for review.',
        status: 'completed'
      }
    ]
  }
}

// 从 localStorage 加载初始数据，如果不存在则使用默认值
function loadJobsFromStorage(): Job[] {
  try {
    const stored = globalThis.localStorage?.getItem('jm_jobs')
    if (stored) {
      return JSON.parse(stored) as Job[]
    }
  } catch {
    // ignore
  }
  return getDefaultJobs()
}

function saveJobsToStorage(jobs: Job[]): void {
  try {
    globalThis.localStorage?.setItem('jm_jobs', JSON.stringify(jobs))
  } catch {
    // ignore
  }
}

function getDefaultJobs(): Job[] {
  return [
    mkJob({
      id: 'job_a',
      name: 'Job Name for Sample A',
      type: 'Type A',
      status: 'completed',
      createdAt: '2026-04-20T10:15:00.000Z',
      runtimeId: 'abcde-12345-00001',
      steps: [
        {
          key: 'upload',
          title: 'Upload',
          description: "Upload files to the first step's input directory of this run.",
          status: 'completed'
        },
        {
          key: 'rename',
          title: 'Rename File',
          description: 'Rename the file as needed.',
          status: 'completed'
        },
        {
          key: 'approval',
          title: 'Send Approval Notification',
          description: 'An approval notification will be sent out.',
          status: 'completed'
        },
        {
          key: 'review',
          title: 'Wait For Review',
          description: 'Waiting for review.',
          status: 'completed'
        }
      ]
    }),
    mkJob({
      id: 'job_b',
      name: 'Job Name for Sample B',
      type: 'Type B',
      status: 'running',
      createdAt: '2026-04-21T05:22:00.000Z',
      runtimeId: 'abcde-12345-00002',
      steps: [
        {
          key: 'upload',
          title: 'Upload',
          description: "Upload files to the first step's input directory of this run.",
          status: 'running'
        },
        {
          key: 'rename',
          title: 'Rename File',
          description: 'Rename the file as needed.',
          status: 'running'
        },
        {
          key: 'approval',
          title: 'Send Approval Notification',
          description: 'An approval notification will be sent out.',
          status: 'running'
        },
        {
          key: 'review',
          title: 'Wait For Review',
          description: 'Waiting for review.',
          status: 'running'
        }
      ]
    }),
    mkJob({
      id: 'job_c',
      name: 'Job Name for Sample C',
      type: 'Type C',
      status: 'failed',
      createdAt: '2026-04-19T09:30:00.000Z',
      runtimeId: 'abcde-12345-00003',
      steps: [
        {
          key: 'upload',
          title: 'Upload',
          description: "Upload files to the first step's input directory of this run.",
          status: 'failed'
        },
        {
          key: 'rename',
          title: 'Rename File',
          description: 'Rename the file as needed.',
          status: 'failed'
        },
        {
          key: 'approval',
          title: 'Send Approval Notification',
          description: 'An approval notification will be sent out.',
          status: 'failed'
        },
        {
          key: 'review',
          title: 'Wait For Review',
          description: 'Waiting for review.',
          status: 'failed'
        }
      ]
    }),
    mkJob({
      id: 'job_d',
      name: 'Job Name for Sample D',
      type: 'Type A',
      status: 'queued',
      createdAt: '2026-04-23T14:45:00.000Z',
      runtimeId: 'abcde-12345-00004',
      steps: [
        {
          key: 'upload',
          title: 'Upload',
          description: "Upload files to the first step's input directory of this run.",
          status: 'completed'
        },
        {
          key: 'rename',
          title: 'Rename File',
          description: 'Rename the file as needed.',
          status: 'completed'
        },
        {
          key: 'approval',
          title: 'Send Approval Notification',
          description: 'An approval notification will be sent out.',
          status: 'completed'
        },
        {
          key: 'review',
          title: 'Wait For Review',
          description: 'Waiting for review.',
          status: 'completed'
        }
      ]
    }),
  ]
}

/**
 * GET /api/bootstrap.jobs
 */
export let mockJobs: Job[] = loadJobsFromStorage()

// 首次加载时保存到 localStorage
if (!globalThis.localStorage?.getItem('jm_jobs')) {
  saveJobsToStorage(mockJobs)
}

export function mockGetJobList(): JobListItem[] {
  return mockJobs.map((j) => ({
    id: j.id,
    name: j.name,
    type: j.type,
    status: j.status,
    createdAt: j.createdAt,
    runtimeId: j.runtimeId
  }))
}

/** 返回拷贝，避免 React setState 因引用相同跳过更新 */
export function mockGetJobById(jobId: string): Job | undefined {
  const j = mockJobs.find((x) => x.id === jobId)
  if (!j) return undefined
  return {
    ...j,
    steps: j.steps.map((s) => ({ ...s })),
    uploadedFile: j.uploadedFile ? { ...j.uploadedFile } : undefined
  }
}

export function mockDeleteJobById(jobId: string): boolean {
  const before = mockJobs.length
  mockJobs = mockJobs.filter((j) => j.id !== jobId)
  saveJobsToStorage(mockJobs)
  return mockJobs.length !== before
}

function mapStepStatus(steps: Job['steps'], patch: Partial<Record<JobStepKey, JobStepStatus>>): Job['steps'] {
  return steps.map((s) => (patch[s.key] != null ? { ...s, status: patch[s.key]! } : s))
}

/** Mock：仅完成上传步骤并记录文件信息，不影响 rename */
export function mockUploadJobFile(jobId: string, meta: { name: string; size: number; mimeType?: string }): Job | undefined {
  const job = mockJobs.find((j) => j.id === jobId)
  if (!job) return undefined
  const now = new Date().toISOString()
  job.uploadedFile = {
    originalName: meta.name,
    currentName: meta.name,
    size: meta.size,
    uploadedAt: now,
    mimeType: meta.mimeType
  }
  job.steps = mapStepStatus(job.steps, { upload: 'completed' })
  saveJobsToStorage(mockJobs)
  return mockGetJobById(jobId)
}

/** Mock：完成 rename 步骤；同步更新 Job 名称（左侧列表、中间标题展示的是 name） */
export function mockRenameJobFile(jobId: string, newName: string): Job | undefined {
  const trimmed = newName.trim()
  if (!trimmed) return undefined
  const job = mockJobs.find((j) => j.id === jobId)
  if (!job) return undefined
  job.name = trimmed
  job.renamedName = trimmed
  job.steps = mapStepStatus(job.steps, { rename: 'completed' })
  saveJobsToStorage(mockJobs)
  return mockGetJobById(jobId)
}

export function mockGetSubContextById(jobId: string, stepKey: JobStepKey): SubContext {
  const job = mockGetJobById(jobId)
  const upload = job?.steps.find((s) => s.key === 'upload')
  const rename = job?.steps.find((s) => s.key === 'rename')
  const uploadCompleted = upload?.status === 'completed'
  const renameCompleted = rename?.status === 'completed'
  const renameFailed = rename?.status === 'failed'

  const isRename = stepKey === 'rename'
  const completed = isRename ? renameCompleted : uploadCompleted
  const state = completed ? 'Completed' : 'Pending'
  const uploadLabel = job?.uploadedFile?.currentName
  const renameLabelText = job?.renamedName
  const detail = isRename
    ? completed
      ? renameLabelText
        ? `Renamed: ${renameLabelText}`
        : 'Renamed file'
      : renameFailed
        ? 'Rename failed'
        : 'Waiting for rename'
    : completed
      ? uploadLabel
        ? `Uploaded: ${uploadLabel}`
        : 'Uploaded files'
      : 'No file uploaded'

  return {
    jobId,
    overview: {
      state,
      detail,
      definitionStepId: isRename ? 'mocked-rename-step-id' : 'mocked-upload-step-id',
      runtimeStepId: isRename ? 'mocked-r-rename-step-id' : 'mocked-r-upload-step-id',
      runtimeStatus: completed ? 'COMPLETED' : 'PENDING',
      renameState: renameCompleted ? 'Completed' : 'Pending'
    }
  }
}

function cloneJobsForTestSeed(jobs: Job[]): Job[] {
  return JSON.parse(JSON.stringify(jobs)) as Job[]
}

/** 模块加载时的快照，供单测 `resetMockJobsForTests` 恢复 */
const MOCK_JOBS_BASELINE: Job[] = cloneJobsForTestSeed(getDefaultJobs())

/** 将内存中的 mockJobs 恢复为初始数据（仅单测使用） */
export function resetMockJobsForTests(): void {
  const fresh = cloneJobsForTestSeed(MOCK_JOBS_BASELINE)
  mockJobs.splice(0, mockJobs.length, ...fresh)
  // 测试环境下不保存到 localStorage
}
