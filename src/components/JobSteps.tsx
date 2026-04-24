import { Button, Divider, Empty, Input, Modal, Space, Tag, Typography, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import React from 'react'
import type { Job, JobStepKey } from '../domain/types'

function statusLabel(status: string): string {
  if (status === 'completed') return 'Completed'
  if (status === 'running') return 'Running'
  if (status === 'failed') return 'Failed'
  if (status === 'queued') return 'Queued'
  return status
}

function jobStatusClass(status: string): string {
  if (status === 'completed') return 'job-status job-status--completed'
  if (status === 'running') return 'job-status job-status--running'
  if (status === 'failed') return 'job-status job-status--failed'
  if (status === 'queued') return 'job-status job-status--queued'
  return 'job-status'
}

export function JobSteps(props: {
  job?: Job
  selectedStepKey?: JobStepKey
  onSelectStep: (key: JobStepKey) => void
  onDeleteJob: () => void
  onUploadFile: (file: File) => Promise<void>
  onRenameConfirm: (name: string) => Promise<void>
}) {
  const { job, selectedStepKey, onSelectStep, onDeleteJob, onUploadFile, onRenameConfirm } = props

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState('')

  React.useEffect(() => {
    if (renameOpen && job) {
      setRenameValue(job.renamedName ?? '')
    }
  }, [renameOpen, job])

  if (!job) return <Empty description="Select a job" />

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await onUploadFile(file)
    } catch {
      /* errors surfaced in App onUploadFile */
    }
  }

  const done = job.steps.filter((s) => s.status === 'completed').length
  const total = job.steps.length
  const start = new Date(job.createdAt)
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 68) // mock end time

  return (
    <div className="jobpane">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        aria-hidden
        onChange={handleFileChange}
      />

      <Modal
        title="重命名文件"
        open={renameOpen}
        okText="确定"
        cancelText="取消"
        destroyOnClose
        onCancel={() => setRenameOpen(false)}
        onOk={async () => {
          const v = renameValue.trim()
          if (!v) {
            message.error('请输入文件名')
            return Promise.reject(new Error('empty'))
          }
          try {
            await onRenameConfirm(v)
            setRenameOpen(false)
          } catch (err: unknown) {
            message.error(err instanceof Error ? err.message : '重命名失败')
            return Promise.reject(err)
          }
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          <Typography.Text type="secondary">新文件名（含扩展名）</Typography.Text>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="例如：report_final.pdf"
            autoFocus
          />
        </Space>
      </Modal>

      <div className="jobpane__top">
        <div className="jobpane__type">Job Type {job.type.replace('Type ', '')}</div>
        <div className="jobpane__nameRow">
          <div className="jobpane__name">{job.name}</div>
          <Button
            type="text"
            size="small"
            aria-label="delete-job"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteJob()
            }}
          />
        </div>
        <div className="jobpane__dates">
          {start.toLocaleString('en-US')} → {end.toLocaleString('en-US')}
        </div>
        <div className="jobpane__row">
          <div className="jobpane__steps">
            {done}/{total} steps completed
          </div>
          <Tag className={jobStatusClass(job.status)} bordered>
            {statusLabel(job.status)}
          </Tag>
        </div>
      </div>

      <Divider style={{ borderTopWidth: '2px', backgroundColor: '#ddd' }} />

      <div className="jobpane__stepsList">
        {job.steps.map((s, idx) => {
          const active = (selectedStepKey ?? job.steps[0]?.key) === s.key
          return (
            <div
              key={s.key}
              className={`jobstep ${active ? 'jobstep--active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`step-${s.key}`}
              onClick={() => onSelectStep(s.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectStep(s.key)
                }
              }}
            >
              <div className="jobstep__head">
                <div className="jobstep__title">
                  {idx + 1} {s.title}
                </div>
                <Tag className={jobStatusClass(job.status)} bordered>
                  {statusLabel(job.status).toLowerCase()}
                </Tag>
              </div>
              <Typography.Text type="secondary">{s.description}</Typography.Text>
              <div className="jobstep__actions">
                <span
                  className="jobstep__pill"
                  aria-label={`step-action-${s.key}`}
                  onClick={
                    s.key === 'upload' || s.key === 'rename'
                      ? (e) => {
                          e.stopPropagation()
                          if (s.key === 'upload') {
                            fileInputRef.current?.click()
                          } else {
                            setRenameOpen(true)
                          }
                        }
                      : undefined
                  }
                >
                  {s.key === 'upload' ? 'upload' : s.key === 'rename' ? 'Rename' : s.key === 'approval' ? 'Send' : 'Signal'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
