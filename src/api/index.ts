// src/api/index.ts
import type { Job, JobFilters, JobListItem, JobStepKey, SubContext, TopTab, TopTabKey, User } from '../domain/types'
// 引入静态数据
import {
  mockUser,
  mockAllNames,
  mockAllTypes,
  mockAllStatuses,
  mockGetJobList,
  mockGetJobById,
  mockDeleteJobById,
  mockGetSubContextById
} from './mock'

// 模拟登录状态（简单实现，实际生产环境可能需要更复杂的本地存储逻辑）
let isLoggedIn = true

export function fetchCurrentUser(): Promise<User> {
  // 模拟异步延迟，让UI加载状态更真实
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(isLoggedIn ? mockUser : { id: '', name: '' })
    }, 300)
  })
}

export function fetchCurrentUserForLogin(): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      isLoggedIn = true
      resolve(mockUser)
    }, 300)
  })
}

export function loginOut(): Promise<{ ok: true }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      isLoggedIn = false
      resolve({ ok: true })
    }, 300)
  })
}

export function getAllName(): Promise<string[]> {
  return Promise.resolve(mockAllNames)
}

export function getAllType(): Promise<Array<JobFilters['type']>> {
  return Promise.resolve(mockAllTypes)
}

export function getAllStatus(): Promise<Array<JobFilters['status']>> {
  return Promise.resolve(mockAllStatuses)
}

export function getJobList(): Promise<JobListItem[]> {
  return Promise.resolve(mockGetJobList())
}

export function getJobById(jobId: string): Promise<Job> {
  const job = mockGetJobById(jobId)
  if (!job) {
    return Promise.reject(new Error('Job not found'))
  }
  return Promise.resolve(job)
}

export function deleteJobById(jobId: string): Promise<{ ok: true }> {
  const success = mockDeleteJobById(jobId)
  if (!success) {
    return Promise.reject(new Error('Job not found'))
  }
  return Promise.resolve({ ok: true })
}

export function getSubContextById(jobId: string, stepKey: JobStepKey): Promise<SubContext> {
  return Promise.resolve(mockGetSubContextById(jobId, stepKey))
}

// 不再需要 installApiMocks
export function installApiMocks(): void {
  // No-op
}