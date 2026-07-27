import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { RefreshCw, TrendingUp, Flame, Clock, ExternalLink } from 'lucide-react'

export default function Hotspots() {
  const { hotspots, refreshHotspots } = useStore()
  const [source, setSource] = useState('all')
  const [loading, setLoading] = useState(false)

  const filtered = hotspots.filter((h) => {
    if (source === 'all') return true
    return h.source === source
  })

  const highHeat = filtered.filter((h) => h.heat >= 80)
  const midHeat = filtered.filter((h) => h.heat >= 60 && h.heat < 80)
  const lowHeat = filtered.filter((h) => h.heat < 60)

  const handleRefresh = async (s) => {
    setLoading(true)
    try {
      await refreshHotspots(s)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">热点雷达</div>
          <div className="page-subtitle">{hotspots.length} 条热点</div>
        </div>
        <button className="btn btn-sm" style={{ background: '#fbbf2420', color: '#fbbf24', border: 'none' }}
          onClick={() => handleRefresh('all')} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> 刷新
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 平台筛选 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'all', label: '全部' },
            { key: 'douyin', label: '🎵 抖音' },
            { key: 'xiaohongshu', label: '📕 小红书' },
          ].map((f) => (
            <button
              key={f.key}
              className={`btn btn-sm ${source === f.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSource(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={64} opacity={0.3} />
            <p>点击刷新获取最新热点<br />自动筛选适合你的内容方向</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => handleRefresh('all')}>
              <RefreshCw size={16} /> 获取热点
            </button>
          </div>
        ) : (
          <>
            {/* 高热热点 */}
            {highHeat.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600, marginBottom: 8 }}>
                  🔥 高热热点（热度 ≥ 80）
                </div>
                {highHeat.map((h, i) => (
                  <HotspotItem key={h.id || i} hotspot={h} index={i} />
                ))}
              </div>
            )}

            {/* 中热热点 */}
            {midHeat.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600, marginBottom: 8 }}>
                  📈 上升热点（热度 60-79）
                </div>
                {midHeat.map((h, i) => (
                  <HotspotItem key={h.id || i} hotspot={h} index={i} />
                ))}
              </div>
            )}

            {/* 低热热点 */}
            {lowHeat.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#a0a0a0', fontWeight: 600, marginBottom: 8 }}>
                  🌱 潜在热点（热度 &lt; 60）
                </div>
                {lowHeat.map((h, i) => (
                  <HotspotItem key={h.id || i} hotspot={h} index={i} />
                ))}
              </div>
            )}
          </>
        )}
        <div className="bottom-spacer" />
      </div>
    </div>
  )
}

function HotspotItem({ hotspot, index }) {
  const heatColor = hotspot.heat >= 80 ? '#fbbf24' : hotspot.heat >= 60 ? '#60a5fa' : '#6b6b6b'
  const matchLabel = hotspot.match_score >= 3 ? '完美匹配' : hotspot.match_score === 2 ? '相关' : '一般'

  return (
    <div className="hotspot-card">
      <div className="hotspot-rank" style={{ color: heatColor }}>{index + 1}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>
          {hotspot.title}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="hotspot-heat">
            <Flame size={12} color={heatColor} /> {hotspot.heat}
          </span>
          <span className="tag tag-purple" style={{ fontSize: 10 }}>
            {hotspot.source === 'douyin' ? '🎵 抖音' : hotspot.source === 'xiaohongshu' ? '📕 小红书' : hotspot.source}
          </span>
          {hotspot.category && (
            <span className="tag tag-blue" style={{ fontSize: 10 }}>{hotspot.category}</span>
          )}
          {hotspot.match_score && (
            <span className="tag tag-green" style={{ fontSize: 10 }}>{matchLabel}</span>
          )}
        </div>
      </div>
    </div>
  )
}
