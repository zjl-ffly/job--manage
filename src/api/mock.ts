import type { Job, JobFilters, JobListItem, JobStepKey, SubContext, TopTab, User } from '../domain/types'

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

/**
 * GET /api/bootstrap.jobs
 */
export let mockJobs: Job[] = [
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

export function mockGetJobById(jobId: string): Job | undefined {
  return mockJobs.find((j) => j.id === jobId)
}

export function mockDeleteJobById(jobId: string): boolean {
  const before = mockJobs.length
  mockJobs = mockJobs.filter((j) => j.id !== jobId)
  return mockJobs.length !== before
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
  const detail = isRename
    ? completed
      ? 'Renamed file'
      : renameFailed
        ? 'Rename failed'
        : 'Waiting for rename'
    : completed
      ? 'Uploaded files'
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

