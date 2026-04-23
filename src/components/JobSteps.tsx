import { Button, Divider, Empty, Space, Tag, Typography } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import React from 'react'
import type { Job, JobStepKey } from '../domain/types'
import type { UploadedFile } from '../types/upload'

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
  uploaded?: UploadedFile
  onUpload: (file: File) => void
  onRenameMock: () => void
  selectedStepKey?: JobStepKey
  onSelectStep: (key: JobStepKey) => void
  onDeleteJob: () => void
}) {
  const { job, uploaded, onUpload, onRenameMock, selectedStepKey, onSelectStep, onDeleteJob } = props

  if (!job) return <Empty description="Select a job" />

  void onUpload
  void uploaded
  void onRenameMock

  const done = job.steps.filter((s) => s.status === 'completed').length
  const total = job.steps.length
  const start = new Date(job.createdAt)
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 68) // mock end time

  return (
    <div className="jobpane">
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

      <Divider className="jobpane__divider" />

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
            >
              <div className="jobstep__head">
                <div className="jobstep__title">
                  {idx + 1} {s.title}
                </div>
                <Tag
                  className={`job-status ${
                    s.status === 'completed'
                      ? 'job-status--completed'
                      : s.status === 'failed'
                        ? 'job-status--failed'
                        : ''
                  }`}
                  bordered
                >
                  {s.status}
                </Tag>
              </div>
              <Typography.Text type="secondary">{s.description}</Typography.Text>
              <div className="jobstep__actions">
                <span className="jobstep__pill" aria-label={`step-action-${s.key}`}>
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

