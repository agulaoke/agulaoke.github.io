import { useState } from 'react'
import { useStore } from '../store'
import { Plus, Edit3, Trash2, Clock, Play, CheckCircle2, FileText, AlertCircle } from 'lucide-react'

const TEMPLATE_SECTIONS = [
  { key: 'hook', label: '黄金3秒钩子', hint: '反常识/冲突/悬念/共鸣，15字以内', max: 20, color: '#fbbf24' },
  { key: 'pain_point', label: '痛点场景', hint: '具体画面感，让观众觉得"说的就是我"', max: 80, color: '#f87171' },
  { key: 'concept_bridge', label: '概念嫁接', hint: '源领域 → 人生解法，制造顿悟', max: 120, color: '#a78bfa' },
  { key: 'case_study', label: '案例/金句', hint: '名人引用、数据佐证、故事片段', max: 100, color: '#60a5fa' },
  { key: 'closing', label: '收尾 + 行动号召', hint: '一句话总结 + 引导评论/关注', max: 40, color: '#34d399' },
]

export default function ScriptWorkbench() {
  const { scripts, addScript, updateScript, deleteScript } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')

  const [form, setForm] = useState({
    title: '', hook: '', pain_point: '', concept_bridge: '',
    case_study: '', closing: '', full_text: '', target_duration: 60,
  })

  const filteredScripts = scripts.filter((s) => {
    if (filter && s.status !== filter) return false
    return true
  })

  const totalChars = (form.hook + form.pain_point + form.concept_bridge + form.case_study + form.closing).length
  const estimatedDuration = Math.ceil(totalChars / 4.5) // 约4.5字/秒
  const isOverLimit = totalChars > 300

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', hook: '', pain_point: '', concept_bridge: '', case_study: '', closing: '', full_text: '', target_duration: 60 })
    setShowModal(true)
  }

  const openEdit = (script) => {
    setEditing(script.id)
    setForm({
      title: script.title || '',
      hook: script.hook || '',
      pain_point: script.pain_point || '',
      concept_bridge: script.concept_bridge || '',
      case_study: script.case_study || '',
      closing: script.closing || '',
      full_text: script.full_text || '',
      target_duration: script.target_duration || 60,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const fullText = [form.hook, form.pain_point, form.concept_bridge, form.case_study, form.closing]
      .filter(Boolean).join('\n\n')

    const data = {
      ...form,
      full_text: form.full_text || fullText,
    }
    if (editing) {
      await updateScript(editing, data)
    } else {
      await addScript({ ...data, topic_id: '', status: 'draft' })
    }
    setShowModal(false)
  }

  const handleStatus = async (id, status) => {
    await updateScript(id, { status })
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">脚本工作台</div>
          <div className="page-subtitle">{scripts.length} 个脚本 · 黄金60秒模板</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> 写脚本
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 筛选 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { key: '', label: '全部' },
            { key: 'draft', label: '草稿' },
            { key: 'ready', label: '可拍摄' },
            { key: 'done', label: '已发布' },
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

        {filteredScripts.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} opacity={0.3} />
            <p>按"黄金60秒模板"写脚本<br />每个部分对应视频的一个阶段</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openNew}>
              <Plus size={16} /> 写第一个脚本
            </button>
          </div>
        ) : (
          filteredScripts.map((script) => (
            <div key={script.id} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {script.title || '未命名脚本'}
                  </div>
                  <div style={{ fontSize: 11, color: '#a0a0a0', marginTop: 2 }}>
                    {script.target_duration}秒 · {script.status === 'draft' ? '草稿' : script.status === 'ready' ? '可拍摄' : '已发布'}
                  </div>
                </div>
                <span className={`tag ${script.status === 'draft' ? 'tag-yellow' : script.status === 'ready' ? 'tag-green' : 'tag-purple'}`}>
                  {script.status === 'draft' ? '草稿' : script.status === 'ready' ? '可拍摄' : '已发布'}
                </span>
              </div>

              {/* 脚本预览 */}
              <div style={{ fontSize: 12, color: '#a0a0a0', lineHeight: 1.6, marginBottom: 8 }}>
                {script.hook && (
                  <div style={{ marginBottom: 2 }}>
                    <span style={{ color: '#fbbf24' }}>🎯 </span>
                    {script.hook.slice(0, 40)}{script.hook.length > 40 ? '...' : ''}
                  </div>
                )}
                {script.concept_bridge && (
                  <div style={{ marginBottom: 2 }}>
                    <span style={{ color: '#a78bfa' }}>💡 </span>
                    {script.concept_bridge.slice(0, 40)}{script.concept_bridge.length > 40 ? '...' : ''}
                  </div>
                )}
                {script.closing && (
                  <div>
                    <span style={{ color: '#34d399' }}>✨ </span>
                    {script.closing.slice(0, 40)}{script.closing.length > 40 ? '...' : ''}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {script.status === 'draft' && (
                  <button className="btn btn-sm" style={{ background: '#34d39920', color: '#34d399', border: 'none' }}
                    onClick={() => handleStatus(script.id, 'ready')}>
                    <CheckCircle2 size={12} /> 就绪
                  </button>
                )}
                <button className="btn btn-sm btn-ghost" onClick={() => openEdit(script)}>
                  <Edit3 size={12} />
                </button>
                <button className="btn btn-sm btn-ghost" style={{ color: '#f87171' }}
                  onClick={() => { if (confirm('确定删除？')) deleteScript(script.id) }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
        <div className="bottom-spacer" />
      </div>

      {/* 脚本编辑弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
            <div className="modal-handle" />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {editing ? '编辑脚本' : '新建脚本'}
            </div>
            <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 16 }}>
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
              目标时长: {form.target_duration}秒 · 预估: {estimatedDuration}秒 · 总字数: {totalChars}
              <span className={`char-count ${totalChars > 280 ? 'warn' : ''} ${totalChars > 320 ? 'over' : ''}`} style={{ marginLeft: 8 }}>
                {totalChars > 320 ? '⚠️ 超长！' : totalChars > 280 ? '偏长' : '合适'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>脚本标题</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="如：卸妆比化妆更重要" />
              </div>

              {TEMPLATE_SECTIONS.map((section) => (
                <div key={section.key}>
                  <label style={{
                    fontSize: 12, color: section.color, fontWeight: 600, marginBottom: 4, display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span>{section.label}</span>
                    <span className="char-count" style={{ fontWeight: 400 }}>
                      {form[section.key].length}/{section.max}
                    </span>
                  </label>
                  <textarea
                    className="input"
                    value={form[section.key]}
                    onChange={(e) => setForm({ ...form, [section.key]: e.target.value })}
                    placeholder={section.hint}
                    rows={section.key === 'concept_bridge' ? 3 : 2}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>完整文案（可选）</label>
                <textarea className="input" value={form.full_text}
                  onChange={(e) => setForm({ ...form, full_text: e.target.value })}
                  placeholder="或在这里直接写完整文案..." rows={4} />
              </div>

              {isOverLimit && (
                <div style={{
                  padding: '10px 14px', background: 'rgba(248,113,113,0.1)',
                  borderRadius: 10, fontSize: 12, color: '#f87171',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <AlertCircle size={16} />
                  文案超过300字，建议压缩到60秒以内
                </div>
              )}

              <button className="btn btn-primary btn-full" onClick={handleSave}
                disabled={!form.hook.trim() && !form.concept_bridge.trim()}>
                {editing ? '保存修改' : '创建脚本'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
