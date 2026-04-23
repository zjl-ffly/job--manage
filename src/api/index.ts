import type { Job, JobFilters, JobListItem, JobStepKey, SubContext, TopTab, TopTabKey, User } from '../domain/types'
import { requestJson } from './request'

export function fetchCurrentUser(): Promise<User> {
  return requestJson<User>('/api/user')
}

export function fetchCurrentUserForLogin(): Promise<User> {
  return requestJson<User>('/api/user?login=1')
}

export function loginOut(): Promise<{ ok: true }> {
  return requestJson<{ ok: true }>('/api/logout', { method: 'POST' })
}

export function getAllName(): Promise<string[]> {
  return requestJson<string[]>('/api/filters/names')
}

export function getAllType(): Promise<Array<JobFilters['type']>> {
  return requestJson<Array<JobFilters['type']>>('/api/filters/types')
}

export function getAllStatus(): Promise<Array<JobFilters['status']>> {
  return requestJson<Array<JobFilters['status']>>('/api/filters/statuses')
}

export function getJobList(): Promise<JobListItem[]> {
  return requestJson<JobListItem[]>('/api/jobs')
}

export function getJobById(jobId: string): Promise<Job> {
  return requestJson<Job>(`/api/jobs/${encodeURIComponent(jobId)}`)
}

export function deleteJobById(jobId: string): Promise<{ ok: true }> {
  return requestJson<{ ok: true }>(`/api/jobs/${encodeURIComponent(jobId)}`, { method: 'DELETE' })
}

export function getSubContextById(jobId: string, stepKey: JobStepKey): Promise<SubContext> {
  return requestJson<SubContext>(`/api/subcontext/${encodeURIComponent(jobId)}?step=${encodeURIComponent(stepKey)}`)
}

export { installApiMocks } from './request'

