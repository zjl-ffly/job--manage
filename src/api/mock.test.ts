import { beforeEach, describe, expect, it } from 'vitest'
import {
  mockGetJobById,
  mockGetJobList,
  mockJobs,
  mockRenameJobFile,
  mockUploadJobFile,
  resetMockJobsForTests
} from './mock'

beforeEach(() => {
  resetMockJobsForTests()
})

describe('mockGetJobById', () => {
  it('每次调用返回新的对象引用，避免 React 引用相等跳过渲染', () => {
    const first = mockGetJobById('job_a')
    const second = mockGetJobById('job_a')
    expect(first).toBeDefined()
    expect(second).toBeDefined()
    expect(first).not.toBe(second)
    expect(first!.steps).not.toBe(second!.steps)
    expect(first!.id).toBe(second!.id)
  })
})

describe('mockUploadJobFile', () => {
  it('只完成 upload 步骤并写入 uploadedFile，不修改 Job 名称', () => {
    const beforeName = mockJobs.find((j) => j.id === 'job_b')!.name
    const result = mockUploadJobFile('job_b', {
      name: 'report.pdf',
      size: 2048,
      mimeType: 'application/pdf'
    })
    expect(result?.uploadedFile?.originalName).toBe('report.pdf')
    expect(result?.uploadedFile?.currentName).toBe('report.pdf')
    expect(result?.uploadedFile?.size).toBe(2048)
    expect(result?.steps.find((s) => s.key === 'upload')?.status).toBe('completed')
    expect(mockJobs.find((j) => j.id === 'job_b')?.name).toBe(beforeName)
  })
})

describe('mockRenameJobFile', () => {
  it('trim 后更新 name、renamedName，并将 rename 步骤标为 completed', () => {
    const result = mockRenameJobFile('job_c', '  Renamed Job C  ')
    expect(result?.name).toBe('Renamed Job C')
    expect(result?.renamedName).toBe('Renamed Job C')
    expect(result?.steps.find((s) => s.key === 'rename')?.status).toBe('completed')
    const row = mockGetJobList().find((j) => j.id === 'job_c')
    expect(row?.name).toBe('Renamed Job C')
  })

  it('空白名称返回 undefined，不修改 store', () => {
    const before = cloneNameMap()
    expect(mockRenameJobFile('job_a', '   ')).toBeUndefined()
    expect(cloneNameMap()).toEqual(before)
  })
})

function cloneNameMap(): Record<string, string> {
  return Object.fromEntries(mockJobs.map((j) => [j.id, j.name]))
}
