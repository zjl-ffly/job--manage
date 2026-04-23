import { Empty, Space, Tabs, Tag, Typography } from 'antd'
import React from 'react'
import type { Job } from '../domain/types'
import type { SubContext } from '../domain/types'
import type { UploadedFile } from '../types/upload'

export function UploadPanel(props: {
  job?: Job
  subContext?: SubContext
  uploaded?: UploadedFile
}) {
  const { job, subContext, uploaded } = props
  const uploadStep = job?.steps.find((s) => s.key === 'upload')
  const renameStep = job?.steps.find((s) => s.key === 'rename')

  if (!job) return <Empty description="Select a job" />

  const stateLabel = subContext?.overview.state ?? (uploadStep?.status === 'completed' ? 'Completed' : 'Pending')
  const renameLabel = subContext?.overview.renameState ?? (renameStep?.status === 'completed' ? 'Completed' : 'Pending')
  const detailNode =
    subContext?.overview.detail ??
    (uploaded ? (
      <span>
        uploaded: <Typography.Text code>{uploaded.currentName}</Typography.Text>
      </span>
    ) : (
      'No file uploaded'
    ))
  const runtimeStatus = subContext?.overview.runtimeStatus ?? (uploaded ? 'COMPLETED' : 'PENDING')
  const definitionStepId = subContext?.overview.definitionStepId ?? 'mocked-d-step-id'
  const runtimeStepId = subContext?.overview.runtimeStepId ?? 'mocked-r-step-id'

  const completed = stateLabel === 'Completed'

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={10}>
      <Typography.Text type="secondary">
        Upload files to the first step&apos;s input directory of this run.
      </Typography.Text>

      <Tabs
        className="upload-tabs"
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <div className="upload-overview">
                <div className="upload-stepCard">
                  <div className="upload-stepCard__head">
                    <div className="upload-stepCard__title">Step status</div>
                    <Tag className={`upload-stepCard__status ${completed ? 'is-completed' : ''}`} bordered>
                      {completed ? 'Completed' : 'Pending'}
                    </Tag>
                  </div>

                  <div className="upload-stepCard__grid">
                    <div className="upload-stepCard__labels">
                      <div className="upload-rowLabel">State</div>
                      <div className="upload-rowLabel">Detail</div>
                      <div className="upload-rowLabel">Definition step id</div>
                      <div className="upload-rowLabel">Runtime step id</div>
                      <div className="upload-rowLabel">Runtime status</div>
                      <div className="upload-rowLabel">Rename step</div>
                    </div>
                    <div className="upload-stepCard__values">
                      <div className="upload-rowValue">{stateLabel}</div>
                      <div className="upload-rowValue">{detailNode}</div>
                      <div className="upload-rowValue">
                        <Typography.Text strong>{definitionStepId}</Typography.Text>
                      </div>
                      <div className="upload-rowValue">
                        <Typography.Text strong>{runtimeStepId}</Typography.Text>
                      </div>
                      <div className="upload-rowValue">
                        <Typography.Text strong>{runtimeStatus}</Typography.Text>
                      </div>
                      <div className="upload-rowValue">{renameLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />
    </Space>
  )
}

