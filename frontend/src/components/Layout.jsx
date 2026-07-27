import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import {
  LayoutDashboard, Lightbulb, TrendingUp, FileText,
  BarChart3, MessageCircle
} from 'lucide-react'

const tabs = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/topics', label: '选题', icon: FileText },
  { path: '/inspirations', label: '灵感', icon: Lightbulb },
  { path: '/hotspots', label: '热点', icon: TrendingUp },
  { path: '/scripts', label: '脚本', icon: MessageCircle },
  { path: '/data', label: '数据', icon: BarChart3 },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useStore()

  return (
    <div className="app-container">
      {toast && <div className="toast">{toast}</div>}
      <div style={{ paddingBottom: 70 }}>
        {children}
      </div>
      <nav className="bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <Icon size={22} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
