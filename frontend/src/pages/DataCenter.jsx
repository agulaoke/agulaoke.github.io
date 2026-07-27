import { useState } from 'react'
import { useStore } from '../store'
import { Plus, Edit3, Trash2, TrendingUp, Eye, Heart, MessageCircle, Share2, Bookmark, UserPlus } from 'lucide-react'

export default function DataCenter() {
  const { videos, addVideo, updateVideo, deleteVideo } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    title: '', publish_date: new Date().toISOString().split('T')[0],
    views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
    completion_rate: 0, follower_gain: 0, notes: '',
  })

  // 计算总计
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0)
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0)
  const avgCompletion = videos.length > 0
    ? (videos.reduce((s, v) => s + (v.completion_rate || 0), 0) / videos.length).toFixed(1)
    : 0
  const totalFollowerGain = videos.reduce((s, v) => s + (v.follower_gain || 0), 0)

  // 赞播比
  const likeRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : '0'

  const openNew = () => {
    setEditing(null)
    setForm({
      title: '', publish_date: new Date().toISOString().split('T')[0],
      views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
      completion_rate: 0, follower_gain: 0, notes: '',
    })
    setShowModal(true)
  }

  const openEdit = (video) => {
    setEditing(video.id)
    setForm({
      title: video.title || '',
      publish_date: video.publish_date || '',
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      shares: video.shares || 0,
      saves: video.saves || 0,
      completion_rate: video.completion_rate || 0,
      follower_gain: video.follower_gain || 0,
      notes: video.notes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (editing) {
      await updateVideo(editing, form)
    } else {
      await addVideo(form)
    }
    setShowModal(false)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">数据中心</div>
          <div className="page-subtitle">{videos.length} 条视频记录</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={16} /> 录入
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 总计面板 */}
        {videos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 10, fontWeight: 500 }}>📊 累计数据</div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#a78bfa' }}>{totalViews.toLocaleString()}</div>
                <div className="stat-label">总播放量</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#f87171' }}>{totalLikes.toLocaleString()}</div>
                <div className="stat-label">总点赞</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#fbbf24' }}>{avgCompletion}%</div>
                <div className="stat-label">平均完播率</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#34d399' }}>{likeRate}%</div>
                <div className="stat-label">赞播比</div>
              </div>
            </div>
          </div>
        )}

        {/* 视频列表 */}
        {videos.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={64} opacity={0.3} />
            <p>每次发布后录入数据<br />持续追踪，找到你的爆款公式</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openNew}>
              <Plus size={16} /> 录入第一条
            </button>
          </div>
        ) : (
          videos.map((video) => {
            const vLikeRate = video.views > 0 ? ((video.likes / video.views) * 100).toFixed(2) : 0
            return (
              <div key={video.id} className="card" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
                      {video.title || '未命名视频'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b6b6b', marginTop: 2 }}>
                      {video.publish_date}
                    </div>
                  </div>
                </div>

                {/* 数据指标 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <DataChip icon={Eye} label="播放" value={video.views} color="#a78bfa" />
                  <DataChip icon={Heart} label="点赞" value={video.likes} color="#f87171" />
                  <DataChip icon={MessageCircle} label="评论" value={video.comments} color="#60a5fa" />
                  <DataChip icon={Bookmark} label="收藏" value={video.saves} color="#fbbf24" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <DataChip icon={Share2} label="分享" value={video.shares} color="#34d399" />
                  <DataChip icon={TrendingUp} label="完播率" value={`${video.completion_rate}%`} color="#c4b5fd" />
                  <DataChip icon={UserPlus} label="涨粉" value={video.follower_gain} color="#fbbf24" />
                </div>

                {/* 赞播比 */}
                <div style={{ fontSize: 11, color: '#6b6b6b', marginBottom: 8 }}>
                  赞播比: {vLikeRate}%
                  {parseFloat(vLikeRate) >= 5 && <span className="tag tag-green" style={{ marginLeft: 6 }}>优秀</span>}
                  {parseFloat(vLikeRate) < 3 && <span className="tag tag-yellow" style={{ marginLeft: 6 }}>需优化</span>}
                </div>

                {video.notes && (
                  <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 8, lineHeight: 1.5 }}>
                    {video.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(video)}>
                    <Edit3 size={12} />
                  </button>
                  <button className="btn btn-sm btn-ghost" style={{ color: '#f87171' }}
                    onClick={() => { if (confirm('确定删除？')) deleteVideo(video.id) }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })
        )}
        <div className="bottom-spacer" />
      </div>

      {/* 录入弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
            <div className="modal-handle" />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editing ? '编辑数据' : '录入视频数据'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>视频标题</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="视频标题..." />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>发布日期</label>
                <input className="input" type="date" value={form.publish_date}
                  onChange={(e) => setForm({ ...form, publish_date: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <NumberField label="播放量" value={form.views} onChange={(v) => setForm({ ...form, views: v })} />
                <NumberField label="点赞" value={form.likes} onChange={(v) => setForm({ ...form, likes: v })} />
                <NumberField label="评论" value={form.comments} onChange={(v) => setForm({ ...form, comments: v })} />
                <NumberField label="分享" value={form.shares} onChange={(v) => setForm({ ...form, shares: v })} />
                <NumberField label="收藏" value={form.saves} onChange={(v) => setForm({ ...form, saves: v })} />
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>完播率 (%)</label>
                  <input className="input" type="number" step="0.1" value={form.completion_rate}
                    onChange={(e) => setForm({ ...form, completion_rate: parseFloat(e.target.value) || 0 })} />
                </div>
                <NumberField label="涨粉" value={form.follower_gain} onChange={(v) => setForm({ ...form, follower_gain: v })} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>备注</label>
                <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="这条视频的复盘..." />
              </div>

              <button className="btn btn-primary btn-full" onClick={handleSave}>
                {editing ? '保存修改' : '录入数据'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 4, display: 'block' }}>{label}</label>
      <input className="input" type="number" value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)} />
    </div>
  )
}

function DataChip({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 4px', background: `${color}10`, borderRadius: 8
    }}>
      <Icon size={14} color={color} />
      <div style={{ fontSize: 14, fontWeight: 700, color, marginTop: 2 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 10, color: '#6b6b6b' }}>{label}</div>
    </div>
  )
}
