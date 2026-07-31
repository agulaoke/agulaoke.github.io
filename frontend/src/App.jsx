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

export default function App() {
  const { loadAll } = useStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadAll()
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f', color: '#a78bfa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>阿骨唠嗑 · 创作工作台</div>
          <div style={{ fontSize: 13, color: '#6b6b6b', marginTop: 4 }}>正在加载...</div>
        </div>
      </div>
    )
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
