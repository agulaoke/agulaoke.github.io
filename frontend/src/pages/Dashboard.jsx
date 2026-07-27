import { useStore } from '../store'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Lightbulb, TrendingUp, Video, Users, Eye, Heart, Play } from 'lucide-react'

export default function Dashboard() {
  const { dashboard, loadAll, refreshHotspots } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadAll()
    refreshHotspots('all')
  }, [])

  if (!dashboard) return null

  const d = dashboard

  const quickActions = [
    { label: '记灵感', icon: Lightbulb, color: '#a78bfa', path: '/inspirations' },
    { label: '加选题', icon: FileText, color: '#34d399', path: '/topics' },
    { label: '看热点', icon: TrendingUp, color: '#fbbf24', path: '/hotspots' },
    { label: '写脚本', icon: Video, color: '#60a5fa', path: '/scripts' },
  ]

  return (
    <div>
      {/* 头部 */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">阿骨唠嗑</div>
          <div className="page-subtitle">内容创作工作台 · {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 20,
          background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700
        }}>
          阿
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 本周数据 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 10, fontWeight: 500 }}>📊 本周数据</div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#a78bfa' }}>{d.performance.total_views_this_week.toLocaleString()}</div>
              <div className="stat-label">本周播放量</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#34d399' }}>{d.performance.total_likes_this_week.toLocaleString()}</div>
              <div className="stat-label">本周点赞</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#fbbf24' }}>{d.performance.avg_completion_rate}%</div>
              <div className="stat-label">平均完播率</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#60a5fa' }}>{d.performance.total_follower_gain}</div>
              <div className="stat-label">新增粉丝</div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 10, fontWeight: 500 }}>⚡ 快速操作</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  className="card"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '16px 8px', cursor: 'pointer', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: 12
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${action.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={action.color} />
                  </div>
                  <span style={{ fontSize: 11, color: '#a0a0a0', fontWeight: 500 }}>{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 内容概览 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 10, fontWeight: 500 }}>📋 内容概览</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <OverviewCard
              label="待做选题"
              value={d.topics.pending}
              color="#a78bfa"
              onClick={() => navigate('/topics')}
            />
            <OverviewCard
              label="灵感碎片"
              value={d.inspirations.raw}
              color="#34d399"
              onClick={() => navigate('/inspirations')}
            />
            <OverviewCard
              label="活跃热点"
              value={d.hotspots.active}
              color="#fbbf24"
              onClick={() => navigate('/hotspots')}
            />
            <OverviewCard
              label="脚本草稿"
              value={d.scripts.draft}
              color="#60a5fa"
              onClick={() => navigate('/scripts')}
            />
            <OverviewCard
              label="已发布"
              value={d.videos.total}
              color="#f87171"
              onClick={() => navigate('/data')}
            />
            <OverviewCard
              label="总选题"
              value={d.topics.total}
              color="#c4b5fd"
              onClick={() => navigate('/topics')}
            />
          </div>
        </div>

        {/* 底部提示 */}
        <div className="card" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <div style={{ fontSize: 13, color: '#c4b5fd', lineHeight: 1.8 }}>
            💡 <strong>今日提醒：</strong>每条视频控制60秒以内，用女性日常经验做源领域，标题带 #girlstalk
          </div>
        </div>

        <div className="bottom-spacer" />
      </div>
    </div>
  )
}

function OverviewCard({ label, value, color, onClick }) {
  return (
    <button
      className="card"
      style={{
        padding: '12px', cursor: 'pointer', textAlign: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b6b6b', marginTop: 2 }}>{label}</div>
    </button>
  )
}
