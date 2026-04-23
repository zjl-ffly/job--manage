import type { Job, JobFilters, TopTab, User } from './types'

export const mockUser: User = {
  id: 'u_1',
  name: 'User'
}

export const topTabs: TopTab[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'job', label: 'Job' },
  { key: 'records', label: 'Records' }
]

export const defaultFilters: JobFilters = {
  name: '',
  type: 'All',
  status: 'All',
  startDate: undefined,
  endDate: undefined
}

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

export const mockJobs: Job[] = [
  mkJob({
    id: 'job_a',
    name: 'Job Name for Sample A',
    type: 'Type A',
    status: 'completed',
    createdAt: '2026-04-20T10:15:00.000Z',
    runtimeId: 'abcde-12345-00001'
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
        status: 'completed'
      },
      {
        key: 'rename',
        title: 'Rename File',
        description: 'Rename the file as needed.',
        status: 'pending'
      },
      {
        key: 'approval',
        title: 'Send Approval Notification',
        description: 'An approval notification will be sent out.',
        status: 'pending'
      },
      {
        key: 'review',
        title: 'Wait For Review',
        description: 'Waiting for review.',
        status: 'pending'
      }
    ]
  }),
  mkJob({
    id: 'job_c',
    name: 'Nightly Ingest - Customer C',
    type: 'Type C',
    status: 'failed',
    createdAt: '2026-04-22T12:45:00.000Z',
    runtimeId: 'abcde-12345-00003'
  }),
  mkJob({
    id: 'job_d',
    name: 'Quick Upload - Type A',
    type: 'Type A',
    status: 'queued',
    createdAt: '2026-04-23T01:05:00.000Z',
    runtimeId: 'abcde-12345-00004'
  })
]

