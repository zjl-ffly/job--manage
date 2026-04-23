import { Empty, Space, Tag, Typography } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import React from 'react'
import type { JobListItem } from '../domain/types'

function statusTagClass(status: string): string {
  if (status === 'completed') return 'job-status job-status--completed'
  if (status === 'running') return 'job-status job-status--running'
  if (status === 'failed') return 'job-status job-status--failed'
  if (status === 'queued') return 'job-status job-status--queued'
  return 'job-status'
}

function statusLabel(status: string): string {
  if (status === 'completed') return 'Completed'
  if (status === 'running') return 'Running'
  if (status === 'failed') return 'Failed'
  if (status === 'queued') return 'Queued'
  return status
}

function statusIcon(status: string) {
  if (status === 'completed') return <CheckCircleOutlined />
  if (status === 'running') return <SyncOutlined spin />
  if (status === 'failed') return <CloseCircleOutlined />
  return <ClockCircleOutlined />
}

export function JobList(props: { jobs: JobListItem[]; selectedId?: string; onSelect: (jobId: string) => void }) {
  const { jobs, selectedId, onSelect } = props

  if (!jobs.length) return <Empty description="No jobs" />

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={8}>
      {jobs.map((j) => {
        const active = j.id === selectedId
        return (
          <div
            key={j.id}
            className={`job-card ${active ? 'job-card--active' : ''}`}
            onClick={() => onSelect(j.id)}
            role="button"
            tabIndex={0}
            aria-label={`job-${j.id}`}
          >
            <div className="job-card__type">Job Type {j.type.replace('Type ', '')}</div>
            <div className="job-card__name">{j.name}</div>
            <div className="job-card__meta">Job ID: {j.id}</div>
            <div className="job-card__meta">Started: {dayjs(j.createdAt).format('M/D/YYYY, h:mm:ss A')}</div>
            <div className="job-card__bottom">
              <Tag className={statusTagClass(j.status)} bordered icon={statusIcon(j.status)}>
                {statusLabel(j.status)}
              </Tag>
            </div>
            <div className="job-card__runtime">Runtime ID: {j.runtimeId}</div>
          </div>
        )
      })}
    </Space>
  )
}

