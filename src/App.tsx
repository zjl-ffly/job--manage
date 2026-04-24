import { Button, Card, ConfigProvider, Flex, Layout, Menu, Modal, Space, Typography, message } from 'antd'
import { CompressOutlined, ExpandOutlined, LogoutOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import React from 'react'
import type { Job, JobFilters, JobListItem, JobStepKey, JobStatus, JobType, SubContext, TopTab, TopTabKey } from './domain/types'
import {
  deleteJobById,
  fetchCurrentUser,
  fetchCurrentUserForLogin,
  getAllName,
  getAllStatus,
  getAllType,
  getJobById,
  getJobList,
  getSubContextById,
  loginOut,
  renameJobFile,
  uploadJobFile
} from './api'
import { useAppStore } from './store'
import { FiltersBar } from './components/FiltersBar'
import { JobList } from './components/JobList'
import { JobSteps } from './components/JobSteps'
import { UploadPanel } from './components/UploadPanel'
import { useQueryState } from './hooks/useQueryState'

const { Header, Content } = Layout

function isTopTabKey(v: string | null): v is TopTabKey {
  return v === 'dashboard' || v === 'job' || v === 'records'
}

function isJobType(v: string | null): v is JobType | 'All' {
  return v === 'All' || v === 'Type A' || v === 'Type B' || v === 'Type C'
}

function isJobStatus(v: string | null): v is JobStatus | 'All' {
  return v === 'All' || v === 'queued' || v === 'running' || v === 'completed' || v === 'failed'
}

function inRangeISO(iso: string, start?: string, end?: string): boolean {
  const d = dayjs(iso)
  if (start && d.isBefore(dayjs(start).startOf('day'))) return false
  if (end && d.isAfter(dayjs(end).endOf('day'))) return false
  return true
}

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

export default function App() {
  const user = useAppStore((s) => s.user)
  const actions = useAppStore((s) => s.actions)
  const [tabs, setTabs] = React.useState<TopTab[]>([])
  const [jobList, setJobList] = React.useState<JobListItem[]>([])
  const [selectedJobId, setSelectedJobId] = React.useState<string | undefined>(undefined)
  const [selectedJob, setSelectedJob] = React.useState<Job | undefined>(undefined)
  const [selectedSubContext, setSelectedSubContext] = React.useState<SubContext | undefined>(undefined)
  const [jobListCollapsed, setJobListCollapsed] = React.useState(false)
  const [selectedStepKey, setSelectedStepKey] = React.useState<JobStepKey>('upload')
  const [contextExpanded, setContextExpanded] = React.useState(false)
  const [filterOptions, setFilterOptions] = React.useState<{
    names: string[]
    types: Array<JobFilters['type']>
    statuses: Array<JobFilters['status']>
  }>({ names: ['All'], types: ['All' as JobFilters['type']], statuses: ['All' as JobFilters['status']] })

  const [activeTab, setActiveTab] = useQueryState<TopTabKey>('tab', {
    defaultValue: 'records',
    parse: (raw) => (isTopTabKey(raw) ? raw : 'records'),
    serialize: (v) => v
  })
  const [qName, setQName] = useQueryState<string>('name', {
    defaultValue: '',
    parse: (raw) => raw ?? '',
    serialize: (v) => (v.trim() ? v : null),
    replace: true
  })
  const [qType, setQType] = useQueryState<JobType | 'All'>('type', {
    defaultValue: 'All',
    parse: (raw) => (isJobType(raw) ? raw : 'All'),
    serialize: (v) => (v === 'All' ? null : v),
    replace: true
  })
  const [qStatus, setQStatus] = useQueryState<JobStatus | 'All'>('status', {
    defaultValue: 'All',
    parse: (raw) => (isJobStatus(raw) ? raw : 'All'),
    serialize: (v) => (v === 'All' ? null : v),
    replace: true
  })
  const [qStart, setQStart] = useQueryState<string | undefined>('start', {
    defaultValue: undefined,
    parse: (raw) => raw ?? undefined,
    serialize: (v) => (v ? v : null),
    replace: true
  })
  const [qEnd, setQEnd] = useQueryState<string | undefined>('end', {
    defaultValue: undefined,
    parse: (raw) => raw ?? undefined,
    serialize: (v) => (v ? v : null),
    replace: true
  })

  const filters: JobFilters = React.useMemo(
    () => ({ name: qName, type: qType, status: qStatus, startDate: qStart, endDate: qEnd }),
    [qEnd, qName, qStart, qStatus, qType]
  )

  const loadAuthedData = React.useCallback(async () => {
    const [names, types, statuses, list] = await Promise.all([getAllName(), getAllType(), getAllStatus(), getJobList()])
    setFilterOptions({ names, types, statuses })
    setJobList(list)
    setSelectedJobId((prev) => prev ?? list[0]?.id)
  }, [])

  React.useEffect(() => {
    setTabs([
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'job', label: 'Job' },
      { key: 'records', label: 'Records' }
    ])

    const controller = new AbortController()
    void (async () => {
      try {
        const u = await fetchCurrentUser()
        if (controller.signal.aborted) return
        actions.setUser(u)
        if (!u.id) {
          setJobList([])
          setSelectedJobId(undefined)
          setSelectedJob(undefined)
          setSelectedSubContext(undefined)
          return
        }
        await loadAuthedData()
      } catch (e: any) {
        if (controller.signal.aborted) return
        message.error(e?.message ? `加载用户信息失败：${e.message}` : '加载用户信息失败')
      }
    })()
    return () => controller.abort()
  }, [actions, loadAuthedData])

  const filteredJobs = React.useMemo(() => {
    return jobList
      .filter((j) => {
        if (filters.type !== 'All' && j.type !== filters.type) return false
        if (filters.status !== 'All' && j.status !== filters.status) return false
        if (filters.name && j.name !== filters.name) return false
        if (!inRangeISO(j.createdAt, filters.startDate, filters.endDate)) return false
        return true
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [filters.endDate, filters.name, filters.startDate, filters.status, filters.type, jobList])

  const selectedStepKeyRef = React.useRef<JobStepKey>(selectedStepKey)
  selectedStepKeyRef.current = selectedStepKey

  const refreshJobData = React.useCallback(async () => {
    const id = selectedJobId
    if (!id) return
    try {
      const stepKey = selectedStepKeyRef.current
      const [list, job] = await Promise.all([getJobList(), getJobById(id)])
      setJobList(list)
      setSelectedJob(job)
      const sub = await getSubContextById(id, stepKey)
      setSelectedSubContext(sub)
    } catch (e: any) {
      message.error(e?.message ? `刷新 Job 失败：${e.message}` : '刷新 Job 失败')
    }
  }, [selectedJobId])

  React.useEffect(() => {
    const controller = new AbortController()
    if (!selectedJobId) {
      setSelectedJob(undefined)
      setSelectedSubContext(undefined)
      return
    }
    void (async () => {
      try {
        const job = await getJobById(selectedJobId)
        if (controller.signal.aborted) return
        setSelectedJob(job)
        const firstKey = job.steps[0]?.key ?? 'upload'
        setSelectedStepKey(firstKey)
        const sub = await getSubContextById(job.id, firstKey)
        if (controller.signal.aborted) return
        setSelectedSubContext(sub)
      } catch (e: any) {
        if (controller.signal.aborted) return
        message.error(e?.message ? `加载 Job 详情失败：${e.message}` : '加载 Job 详情失败')
      }
    })()
    return () => {
      controller.abort()
    }
  }, [selectedJobId])

  React.useEffect(() => {
    // 当右侧展开时，左侧收起/展开动画会改变横向空间；这里不做额外卸载，保持稳定。
    // 仅在选择 job 时保持默认不展开，避免误解为“固定布局”。
    setContextExpanded(false)
  }, [selectedJobId])

  function onFiltersChange(patch: Partial<JobFilters>) {
    if (patch.name != null) setQName(patch.name)
    if (patch.type != null) setQType(patch.type)
    if (patch.status != null) setQStatus(patch.status)
    if ('startDate' in patch) setQStart(patch.startDate)
    if ('endDate' in patch) setQEnd(patch.endDate)
  }

  function onNewJob(job: Job) {
    setJobList((prev) => [
      { id: job.id, name: job.name, type: job.type, status: job.status, createdAt: job.createdAt, runtimeId: job.runtimeId },
      ...prev
    ])
    setSelectedJobId(job.id)
    setSelectedJob(job)
  }

  async function onSelectStep(key: JobStepKey) {
    setSelectedStepKey(key)
    if (!selectedJobId) return
    try {
      const sub = await getSubContextById(selectedJobId, key)
      setSelectedSubContext(sub)
    } catch (e: any) {
      message.error(e?.message ? `加载步骤内容失败：${e.message}` : '加载步骤内容失败')
    }
  }

  function onDeleteSelectedJob() {
    if (!selectedJobId) return
    Modal.confirm({
      title: 'Delete job?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteJobById(selectedJobId)
          const list = await getJobList()
          setJobList(list)
          const nextId = list[0]?.id
          setSelectedJobId(nextId)
          if (!nextId) {
            setSelectedJob(undefined)
            setSelectedSubContext(undefined)
          }
        } catch (e: any) {
          message.error(e?.message ? `删除失败：${e.message}` : '删除失败')
        }
      }
    })
  }

  async function onLogout() {
    try {
      await loginOut()
      window.location.reload()
    } catch (e: any) {
      message.error(e?.message ? `退出登录失败：${e.message}` : '退出登录失败')
    }
  }

  async function onLogin() {
    try {
      const u = await fetchCurrentUserForLogin()
      actions.setUser(u)
      if (!u.id) return
      await loadAuthedData()
    } catch (e: any) {
      message.error(e?.message ? `登录失败：${e.message}` : '登录失败')
    }
  }

  const nameOptions = React.useMemo(() => {
    const list = (filterOptions.names?.length ? filterOptions.names : ['All']).slice()
    const normalized = Array.from(new Set(list))
    if (!normalized.includes('All')) normalized.unshift('All')
    return normalized.map((n) => ({ value: n, label: n }))
  }, [filterOptions.names])

  const typeOptions = React.useMemo(() => {
    const list: Array<JobFilters['type']> = (
      filterOptions.types?.length ? filterOptions.types : ['All' as JobFilters['type']]
    ).slice()
    const seen = new Set<string>()
    const normalized: Array<JobFilters['type']> = []
    for (const t of list) {
      if (seen.has(t)) continue
      seen.add(t)
      normalized.push(t)
    }
    if (!normalized.includes('All')) normalized.unshift('All')
    return normalized.map((t) => ({ value: t, label: t }))
  }, [filterOptions.types])

  const statusOptions = React.useMemo(() => {
    const list: Array<JobFilters['status']> = (
      filterOptions.statuses?.length ? filterOptions.statuses : ['All' as JobFilters['status']]
    ).slice()
    const seen = new Set<string>()
    const normalized: Array<JobFilters['status']> = []
    for (const s of list) {
      if (seen.has(s)) continue
      seen.add(s)
      normalized.push(s)
    }
    if (!normalized.includes('All')) normalized.unshift('All')
    return normalized.map((s) => ({ value: s, label: s }))
  }, [filterOptions.statuses])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        components: {
          Menu: {
            horizontalItemSelectedColor: 'black',
            horizontalItemSelectedBg: 'white',
            itemColor: '#fff',
          },
          Tabs: {
            itemSelectedColor: '#000d80',
          }
        }
      }}
    >
      <Layout className="app-shell">
        <Header className="topbar">
          <div className="topbar__logo">Logo</div>
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            style={{ flex: 1, minWidth: 240, background: 'transparent' }}
            styles={{
              root: { height: '100%', fontWeight: '600' },
              itemContent: { display: 'flex', height: '100%', alignItems: 'center' }
            }}
            items={tabs.map((t) => ({ key: t.key, label: t.label }))}
            onClick={(e) => setActiveTab(e.key as TopTabKey)}
          />
          <div className="topbar__right">
            {user?.id ? (
              <Space size={10}>
                <Typography.Text style={{ color: '#fff' }}>{user.name}</Typography.Text>
                <Button type="text" aria-label="logout" icon={<LogoutOutlined style={{ color: '#fff' }} />} onClick={onLogout} />
              </Space>
            ) : null}
          </div>
        </Header>

        <Content className="content">
          {!user?.id ? (
            <div className="login-required">
              <Card className="login-card" bordered={false}>
                <div className="login-card__title">请登录</div>
                <div className="login-card__sub">退出登录后需要重新登录，才可以查看 Job 列表与详情。</div>
                <Button type="primary" className="login-card__btn" onClick={onLogin} aria-label="login-btn">
                  登录
                </Button>
              </Card>
            </div>
          ) : (
            <>
              <div className="content__fixed">
                <FiltersBar
                  filters={filters}
                  onChange={onFiltersChange}
                  onNewJob={onNewJob}
                  nameOptions={nameOptions}
                  typeOptions={typeOptions}
                  statusOptions={statusOptions}
                />
              </div>

              <div className="content__main">
                <div
                  className={`three-col ${jobListCollapsed ? 'three-col--joblist-collapsed' : ''} ${contextExpanded ? 'three-col--context-expanded' : ''
                    }`}
                  role="region"
                  aria-label="main-grid"
                >
                  <div className={`panel ${jobListCollapsed ? 'panel--collapsed' : ''}`}>
                    <div className="panel__title">
                      <div className="panel__titleRow">
                        <Typography.Text style={{ fontSize: '24px', fontWeight: '700' }} className="panel__titleText">
                          Job List
                        </Typography.Text>
                        <Button
                          size="small"
                          className="joblist-toggle"
                          icon={jobListCollapsed ? <RightOutlined /> : <LeftOutlined />}
                          onClick={() => setJobListCollapsed((v) => !v)}
                        >
                        </Button>
                      </div>
                    </div>
                    <div style={{ padding: '0' }}>
                      <div className="joblist__fixed">
                        <JobList jobs={filteredJobs} selectedId={selectedJobId} onSelect={setSelectedJobId} />
                      </div>
                    </div>
                  </div>

                  <div className={`main-area ${contextExpanded ? 'main-area--expanded' : ''}`}>
                    <div className="panel panel--job">
                      <div className="panel__body">
                        <JobSteps
                          job={selectedJob}
                          selectedStepKey={selectedStepKey}
                          onSelectStep={onSelectStep}
                          onDeleteJob={onDeleteSelectedJob}
                          onUploadFile={async (file) => {
                            if (!selectedJobId) return
                            try {
                              await uploadJobFile(selectedJobId, file)
                              await refreshJobData()
                              message.success('上传成功')
                            } catch (e: any) {
                              message.error(e?.message ? `上传失败：${e.message}` : '上传失败')
                              throw e
                            }
                          }}
                          onRenameConfirm={async (name) => {
                            if (!selectedJobId) throw new Error('未选择 Job')
                            await renameJobFile(selectedJobId, name)
                            await refreshJobData()
                            message.success('已重命名')
                          }}
                        />
                      </div>
                    </div>

                    <div className="panel panel--context">
                      <div className="panel__titleRow">
                        <Typography.Text style={{ fontSize: '24px', fontWeight: '700' }} className="panel__titleText">
                          {selectedJob?.steps.find((s) => s.key === selectedStepKey)?.title ?? 'Upload'}
                        </Typography.Text>
                        <Button
                          type="text"
                          size="small"
                          aria-label={contextExpanded ? 'collapse-context' : 'expand-context'}
                          icon={contextExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                          onClick={() => setContextExpanded((v) => !v)}
                        />
                      </div>
                      <div style={{ padding: '0', border: '0' }} className="panel__body">
                        <UploadPanel job={selectedJob} subContext={selectedSubContext} activeStepKey={selectedStepKey} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

