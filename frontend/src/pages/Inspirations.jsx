import { useState } from 'react'
import { useStore } from '../store'
import { Plus, Link, ArrowUpCircle, Trash2, Tag, ExternalLink, Search } from 'lucide-react'

export default function Inspirations() {
  const { inspirations, addInspiration, updateInspiration, deleteInspiration, promoteInspiration, extractLink } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const [form, setForm] = useState({ content: '', tags: '', notes: '' })

  const filteredInspirations = inspirations.filter((i) => {
    if (filter === 'raw' && i.status !== 'raw') return false
    if (filter === 'promoted' && i.status !== 'promoted') return false
    return true
  })

  const openNew = () => {
    setForm({ content: '', tags: '', notes: '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.content.trim()) return
    await addInspiration({
      content: form.content,
      source_type: 'manual',
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: form.notes,
    })
    setShowModal(false)
  }

  const handleExtractLink = async () => {
    if (!linkUrl.trim()) return
    setLinkLoading(true)
    try {
      await extractLink(linkUrl)
      setLinkUrl('')
      setShowLinkModal(false)
    } catch (e) {
      alert('链接解析失败，请检查链接是否有效')
    }
    setLinkLoading(false)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">灵感库</div>
          <div className="page-subtitle">{inspirations.length} 条碎片</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" style={{ background: '#60a5fa20', color: '#60a5fa', border: 'none' }}
            onClick={() => setShowLinkModal(true)}>
            <Link size={14} /> 投喂链接
          </button>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            <Plus size={16} /> 记录
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 筛选 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { key: '', label: '全部' },
            { key: 'raw', label: '未处理' },
            { key: 'promoted', label: '已转化' },
          ].map((f) => (
            <button
              key={f.key}
              className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredInspirations.length === 0 ? (
          <div className="empty-state">
            <LightbulbEmptyIcon />
            <p>灵感是爆款的种子<br />看到好句子、好观点，随时丢进来</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openNew}>
              <Plus size={16} /> 记录第一条灵感
            </button>
          </div>
        ) : (
          filteredInspirations.map((item) => (
            <div key={item.id} className="card" style={{ marginBottom: 8, opacity: item.status === 'promoted' ? 0.6 : 1 }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {item.content.length > 200 ? item.content.slice(0, 200) + '...' : item.content}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {item.source_type === 'manual' && (
                  <span className="tag tag-purple">✍️ 手动记录</span>
                )}
                {item.source_type === 'douyin' && (
                  <span className="tag tag-red">🎵 抖音</span>
                )}
                {item.source_type === 'xiaohongshu' && (
                  <span className="tag tag-red" style={{ background: 'rgba(255, 50, 50, 0.12)', color: '#ff5252' }}>📕 小红书</span>
                )}
                {item.source_type === 'web' && (
                  <span className="tag tag-blue">🌐 网页</span>
                )}
                {item.status === 'promoted' && (
                  <span className="tag tag-green">✅ 已转选题</span>
                )}
                {(item.tags || []).slice(0, 3).map((tag, i) => (
                  <span key={i} className="tag tag-green">{tag}</span>
                ))}
              </div>

              {item.source_url && (
                <div style={{ fontSize: 11, color: '#60a5fa', marginBottom: 8, wordBreak: 'break-all' }}>
                  <ExternalLink size={11} style={{ display: 'inline', marginRight: 4 }} />
                  {item.source_url.length > 50 ? item.source_url.slice(0, 50) + '...' : item.source_url}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {item.status === 'raw' && (
                  <button className="btn btn-sm" style={{ background: '#a78bfa20', color: '#a78bfa', border: 'none' }}
                    onClick={() => promoteInspiration(item.id)}>
                    <ArrowUpCircle size={12} /> 升级选题
                  </button>
                )}
                <button className="btn btn-sm btn-ghost" style={{ color: '#f87171' }}
                  onClick={() => { if (confirm('确定删除？')) deleteInspiration(item.id) }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
        <div className="bottom-spacer" />
      </div>

      {/* 手动记录弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>记录灵感</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>内容 *</label>
                <textarea className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="把好句子、好观点、想到的选题角度写在这里..." rows={5} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>标签</label>
                <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="认知, 情感, 女性成长" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>备注</label>
                <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="补充说明..." />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleSave} disabled={!form.content.trim()}>
                保存灵感
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 链接投喂弹窗 */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>投喂链接</div>
            <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 16 }}>
              粘贴小红书、抖音或任意网页链接，自动提取内容存入灵感库
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="input"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                autoFocus
              />
              <button className="btn btn-primary btn-full" onClick={handleExtractLink}
                disabled={!linkUrl.trim() || linkLoading}>
                {linkLoading ? '提取中...' : '提取并保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LightbulbEmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  )
}
