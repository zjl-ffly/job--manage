export type JobStatus = 'completed' | 'running' | 'failed' | 'queued'

export type JobType = 'Type A' | 'Type B' | 'Type C'

export type JobStepKey = 'upload' | 'rename' | 'approval' | 'review'

export type JobStepStatus = 'pending' | 'completed' | 'failed'

export type JobStep = {
  key: JobStepKey
  title: string
  description: string
  status: JobStepStatus
}

export type JobListItem = {
  id: string
  name: string
  type: JobType
  status: JobStatus
  createdAt: string // ISO
  runtimeId: string
}

export type Job = {
  id: string
  name: string
  type: JobType
  status: JobStatus
  createdAt: string // ISO
  runtimeId: string
  steps: JobStep[]
}

export type SubContext = {
  jobId: string
  overview: {
    state: 'Pending' | 'Completed'
    detail: string
    definitionStepId: string
    runtimeStepId: string
    runtimeStatus: 'PENDING' | 'COMPLETED'
    renameState: 'Pending' | 'Completed'
  }
}

export type User = {
  id: string
  name: string
}

export type TopTabKey = 'dashboard' | 'job' | 'records'

export type TopTab = {
  key: TopTabKey
  label: string
}

export type JobFilters = {
  name: string
  type: JobType | 'All'
  status: JobStatus | 'All'
  startDate?: string // ISO date
  endDate?: string // ISO date
}

