import { Button, DatePicker, Select } from 'antd'
import { RightCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Job } from '../domain/types'
import type { JobFilters } from '../domain/types'

export function FiltersBar(props: {
  filters: JobFilters
  onChange: (patch: Partial<JobFilters>) => void
  onNewJob: (job: Job) => void
  nameOptions: Array<{ value: string; label: string }>
  typeOptions: Array<{ value: JobFilters['type']; label: string }>
  statusOptions: Array<{ value: JobFilters['status']; label: string }>
}) {
  const { filters, onChange, onNewJob, nameOptions, typeOptions, statusOptions } = props

  function createNewJob() {
    const nowIso = new Date().toISOString()
    const id = `job_${Date.now()}`
    const job: Job = {
      id,
      name: `New Job ${dayjs(nowIso).format('M/D HH:mm')}`,
      type: 'Type A',
      status: 'queued',
      createdAt: nowIso,
      runtimeId: `runtime_${Math.random().toString(16).slice(2, 10)}`,
      steps: [
        {
          key: 'upload',
          title: 'Upload',
          description: "Upload files to the first step's input directory of this run.",
          status: 'running'
        },
        { key: 'rename', title: 'Rename File', description: 'Rename the file as needed.', status: 'running' },
        {
          key: 'approval',
          title: 'Send Approval Notification',
          description: 'An approval notification will be sent out.',
          status: 'running'
        },
        { key: 'review', title: 'Wait For Review', description: 'Waiting for review.', status: 'running' }
      ]
    }
    onNewJob(job)
  }

  return (
    <div className="filters" role="region" aria-label="filters">
      <div className="filters__bar">
        <div className="filters__item">
          <div className="filters__field">
            <div className="filters__label">Name</div>
            <Select
              aria-label="Name"
              value={filters.name || 'All'}
              style={{ width: '100%' }}
              options={nameOptions}
              variant="borderless"
              className="filters__control"
              onChange={(v) => onChange({ name: v === 'All' ? '' : v })}
            />
          </div>
        </div>

        <div className="filters__item">
          <div className="filters__field">
            <div className="filters__label">Type</div>
            <Select
              aria-label="Type"
              value={filters.type}
              style={{ width: '100%' }}
              options={typeOptions}
              variant="borderless"
              className="filters__control"
              onChange={(v) => onChange({ type: v })}
            />
          </div>
        </div>

        <div className="filters__item">
          <div className="filters__field">
            <div className="filters__label">Status</div>
            <Select
              aria-label="Status"
              value={filters.status}
              style={{ width: '100%' }}
              options={statusOptions}
              variant="borderless"
              className="filters__control"
              onChange={(v) => onChange({ status: v })}
            />
          </div>
        </div>

        <div className="filters__item">
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Start Date"
            value={filters.startDate ? dayjs(filters.startDate) : null}
            variant="borderless"
            className="filters__control"
            onChange={(v) => onChange({ startDate: v?.toISOString() })}
          />
        </div>

        <div className="filters__item">
          <DatePicker
            style={{ width: '100%' }}
            placeholder="End Date"
            value={filters.endDate ? dayjs(filters.endDate) : null}
            variant="borderless"
            className="filters__control"
            onChange={(v) => onChange({ endDate: v?.toISOString() })}
          />
        </div>

        <div className="filters__actions">
          <Button type="primary" icon={<RightCircleOutlined />} onClick={createNewJob} aria-label="new-job-btn"
            styles={{
              root: { backgroundColor: '#000D80', borderRadius: '0', fontWeight: '600' }
            }}
          >
            New Job
          </Button>
        </div>
      </div>
    </div>
  )
}

