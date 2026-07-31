import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useStore } from './store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Topics from './pages/Topics'
import Inspirations from './pages/Inspirations'
import Hotspots from './pages/Hotspots'
import ScriptWorkbench from './pages/ScriptWorkbench'
import DataCenter from './pages/DataCenter'
import TokenSetup from './components/TokenSetup'

export default function App() {
  const { loadAll, tokenReady, setGitHubToken, showToast } = useStore()
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function init() {
      // 先检查localStorage
      const saved = localStorage.getItem('gh_token')
      if (saved && saved.length > 10) {
        // 已有token，直接初始化
        setGitHubToken(saved)
      }
      // 等store的tokenReady更新后再loadAll
      await new Promise(r => setTimeout(r, 100))
      await loadAll()
      setChecking(false)
      setReady(true)
    }
    init()
  }, [])

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f', color: '#a78bfa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>阿骨唠嗑 · 创作工作台</div>
          <div style={{ fontSize: 13, color: '#6b6b6b', marginTop: 4 }}>{checking ? '正在加载...' : '初始化中...'}</div>
        </div>
      </div>
    )
  }

  if (!tokenReady) {
    return <TokenSetup />
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/inspirations" element={<Inspirations />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/scripts" element={<ScriptWorkbench />} />
          <Route path="/data" element={<DataCenter />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
