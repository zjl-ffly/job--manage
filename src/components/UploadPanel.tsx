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

  const stateLabel = subContext?.overview.state ?? (uploadStep?.status === 'completed' ? 'Completed' : 'Running')
  const renameLabel = subContext?.overview.renameState ?? (renameStep?.status === 'completed' ? 'Completed' : 'Running')
  const detailNode =
    subContext?.overview.detail ??
    (uploaded ? (
      <span>
        uploaded: <Typography.Text code>{uploaded.currentName}</Typography.Text>
      </span>
    ) : (
      'No file uploaded'
    ))
  const runtimeStatus = subContext?.overview.runtimeStatus ?? (uploaded ? 'Uploaded Files' : 'Waiting')
  const definitionStepId = subContext?.overview.definitionStepId ?? 'mocked-d-step-id'
  const runtimeStepId = subContext?.overview.runtimeStepId ?? 'mocked-r-step-id'

  const completed = stateLabel === 'Completed'

  return (
    <Space vertical style={{ width: '100%' }} size={10}>
      <Typography.Text type="secondary">
        Upload files to the first step&apos;s input directory of this run.
      </Typography.Text>

      <Tabs
        className="upload-tabs"
        styles={{
          item: { width: '90px', justifyContent: 'center', fontWeight: '600' },
          indicator: { backgroundColor: '#000d80' }
        }}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <div className="upload-overview">
                <div className="upload-stepCard">
                  <div className="upload-stepCard__head">
                    <div className="upload-stepCard__title">Step status</div>
                  </div>
                  <div className="upload-stepCard__grid">
                    <div className="upload-stepCard__labels">
                      <div className="upload-rowLabel">State</div>
                      <div className="upload-rowLabel">Detail</div>
                      <div className="upload-rowLabel">Definition step id</div>
                      <div className="upload-rowLabel">Runtime step id</div>
                      <div className="upload-rowLabel">Runtime name</div>
                      <div className="upload-rowLabel">Runtime status</div>
                    </div>
                    <div className="upload-stepCard__values">
                      <div style={{ fontWeight: 'normal' }} className="upload-rowValue">
                        <Tag className={`${completed ? 'job-status--completed' : 'job-status--running'}`}>
                          {completed ? 'Completed' : 'Running'}
                        </Tag>
                      </div>
                      <Typography.Text className='upload-rowValue'>{detailNode}</Typography.Text>
                      <Typography.Text className="upload-rowValue">{definitionStepId}</Typography.Text>
                      <Typography.Text className="upload-rowValue">{runtimeStepId}</Typography.Text>
                      <Typography.Text className="upload-rowValue">{runtimeStatus}</Typography.Text>
                      <Typography.Text className="upload-rowValue">{renameLabel}</Typography.Text></div>
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

