import { useState } from 'react'
import { useStore } from '../store'
import { Plus, Edit3, Trash2, Search, Filter, Play, CheckCircle2, Clock, XCircle } from 'lucide-react'

const STATUS_MAP = {
  pending: { label: '待做', color: '#fbbf24', icon: Clock },
  in_progress: { label: '进行中', color: '#60a5fa', icon: Play },
  done: { label: '已完成', color: '#34d399', icon: CheckCircle2 },
  abandoned: { label: '已废弃', color: '#f87171', icon: XCircle },
}

const DIFFICULTY_MAP = {
  easy: { label: '简单', color: '#34d399' },
  medium: { label: '中等', color: '#fbbf24' },
  hard: { label: '困难', color: '#f87171' },
}

export default function Topics() {
  const { topics, addTopic, updateTopic, deleteTopic } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    title: '', source_domain: '', target_audience: '女性', difficulty: 'medium', tags: '', notes: ''
  })

  const filteredTopics = topics.filter((t) => {
    if (filter && t.status !== filter) return false
    if (search && !t.title.includes(search) && !t.notes?.includes(search)) return false
    return true
  })

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', source_domain: '', target_audience: '女性', difficulty: 'medium', tags: '', notes: '' })
    setShowModal(true)
  }

  const openEdit = (topic) => {
    setEditing(topic.id)
    setForm({
      title: topic.title,
      source_domain: topic.source_domain || '',
      target_audience: topic.target_audience || '女性',
      difficulty: topic.difficulty || 'medium',
      tags: (topic.tags || []).join(', '),
      notes: topic.notes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const data = {
      title: form.title,
      source_domain: form.source_domain,
      target_audience: form.target_audience,
      difficulty: form.difficulty,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: form.notes,
    }
    if (editing) {
      await updateTopic(editing, data)
    } else {
      await addTopic({ ...data, status: 'pending' })
    }
    setShowModal(false)
  }

  const handleStatus = async (id, status) => {
    await updateTopic(id, { status })
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">选题库</div>
          <div className="page-subtitle">{topics.length} 个选题</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
            <Plus size={16} /> 新建
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 搜索和筛选 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#6b6b6b' }} />
            <input
              className="input"
              placeholder="搜索选题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
          </div>
          <select
            className="input"
            style={{ width: 100, padding: '12px 8px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">全部</option>
            <option value="pending">待做</option>
            <option value="in_progress">进行中</option>
            <option value="done">已完成</option>
            <option value="abandoned">已废弃</option>
          </select>
        </div>

        {/* 选题列表 */}
        {filteredTopics.length === 0 ? (
          <div className="empty-state">
            <LightbulbIcon />
            <p>还没有选题<br />点击右上角开始创建</p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const status = STATUS_MAP[topic.status] || STATUS_MAP.pending
            const diff = DIFFICULTY_MAP[topic.difficulty] || DIFFICULTY_MAP.medium
            const StatusIcon = status.icon
            return (
              <div key={topic.id} className="card" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
                      {topic.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="tag tag-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <StatusIcon size={12} /> {status.label}
                      </span>
                      <span className="tag" style={{ background: `${diff.color}20`, color: diff.color }}>
                        {diff.label}
                      </span>
                      {topic.source_domain && (
                        <span className="tag tag-blue">{topic.source_domain}</span>
                      )}
                      {(topic.tags || []).slice(0, 2).map((tag, i) => (
                        <span key={i} className="tag tag-green">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {topic.notes && (
                  <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8, lineHeight: 1.5 }}>
                    {topic.notes.length > 80 ? topic.notes.slice(0, 80) + '...' : topic.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {topic.status === 'pending' && (
                    <button className="btn btn-sm" style={{ background: '#60a5fa20', color: '#60a5fa', border: 'none' }}
                      onClick={() => handleStatus(topic.id, 'in_progress')}>
                      <Play size={12} /> 开始
                    </button>
                  )}
                  {topic.status === 'in_progress' && (
                    <button className="btn btn-sm" style={{ background: '#34d39920', color: '#34d399', border: 'none' }}
                      onClick={() => handleStatus(topic.id, 'done')}>
                      <CheckCircle2 size={12} /> 完成
                    </button>
                  )}
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(topic)}>
                    <Edit3 size={12} />
                  </button>
                  <button className="btn btn-sm btn-ghost" style={{ color: '#f87171' }}
                    onClick={() => { if (confirm('确定删除？')) deleteTopic(topic.id) }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })
        )}
        <div className="bottom-spacer" />
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editing ? '编辑选题' : '新建选题'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>选题标题 *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="一句话描述选题..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>源领域/隐喻</label>
                  <input className="input" value={form.source_domain} onChange={(e) => setForm({ ...form, source_domain: e.target.value })} placeholder="如：衣柜整理、化妆..." />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>目标受众</label>
                  <input className="input" value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} placeholder="女性" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>难度</label>
                  <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>标签（逗号分隔）</label>
                  <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="女性成长, 情感, 认知" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>备注</label>
                <textarea className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="选题思路、关键角度..." rows={3} />
              </div>

              <button className="btn btn-primary btn-full" onClick={handleSave} disabled={!form.title.trim()}>
                {editing ? '保存修改' : '创建选题'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LightbulbIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" /><path d="M10 22h4" />
    </svg>
  )
}
