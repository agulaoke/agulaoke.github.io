import { useState } from 'react'
import { useStore } from '../store'
import { Cloud, ExternalLink, Check, ChevronDown } from 'lucide-react'

export default function TokenSetup() {
  const { setGitHubToken, loadAll } = useStore()
  const [token, setToken] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!token.trim() || token.trim().length < 20) return
    setLoading(true)
    setGitHubToken(token.trim())
    await loadAll()
    setLoading(false)
    window.location.reload()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#f5f5f5', padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: 32, marginTop: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>☁️</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>设置云端同步</h1>
        <p style={{ fontSize: 14, color: '#a0a0a0', lineHeight: 1.6 }}>
          为了让手机和电脑看到同一份数据<br />
          需要设置一个 GitHub Token
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{
          background: 'rgba(167,139,250,0.06)',
          border: '1px solid rgba(167,139,250,0.15)',
          borderRadius: 12, padding: 16, marginBottom: 16
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 8 }}>
            📋 操作步骤（约2分钟）
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              background: 'none', border: 'none', color: '#a78bfa',
              fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            {showGuide ? '收起' : '展开'}详细教程
            <ChevronDown size={14} style={{ transform: showGuide ? 'rotate(180deg)' : 'none' }} />
          </button>

          {showGuide && (
            <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.8, color: '#a0a0a0' }}>
              <p><strong style={{ color: '#f5f5f5' }}>1.</strong> 打开 GitHub Token 创建页面：<br />
                <a href="https://github.com/settings/tokens/new" target="_blank"
                   style={{ color: '#60a5fa', wordBreak: 'break-all' }}>
                  https://github.com/settings/tokens/new
                </a>
              </p>
              <p><strong style={{ color: '#f5f5f5' }}>2.</strong> 填写：</p>
              <ul style={{ marginLeft: 16, marginBottom: 8 }}>
                <li>Note（备注）：写"工作台同步"</li>
                <li>Expiration（有效期）：选 No expiration（永不过期）</li>
                <li>勾选 <code style={{ background: '#242424', padding: '2px 6px', borderRadius: 4, color: '#fbbf24' }}>repo</code> 权限（第一个选项）</li>
              </ul>
              <p><strong style={{ color: '#f5f5f5' }}>3.</strong> 点页面最底部绿色按钮 "Generate token"</p>
              <p><strong style={{ color: '#f5f5f5' }}>4.</strong> 复制生成的 Token（<strong style={{ color: '#f87171' }}>只显示一次！</strong>）<br />
                格式类似：<code style={{ background: '#242424', padding: '2px 6px', borderRadius: 4 }}>ghp_xxxxxxxxxxxx</code></p>
              <p><strong style={{ color: '#f5f5f5' }}>5.</strong> 粘贴到下方输入框，点"完成设置"</p>
            </div>
          )}
        </div>

        <label style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 6, display: 'block' }}>
          GitHub Token
        </label>
        <input
          className="input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxx"
          style={{ fontSize: 14, fontFamily: 'monospace' }}
          autoFocus
        />
        <p style={{ fontSize: 11, color: '#6b6b6b', marginTop: 6, lineHeight: 1.5 }}>
          🔒 Token 只存在你的浏览器本地，不会上传到任何服务器。
        </p>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleSave}
        disabled={!token.trim() || token.trim().length < 20 || loading}
        style={{ marginTop: 'auto' }}
      >
        {loading ? '正在验证...' : '完成设置'}
      </button>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <a href="https://github.com/settings/tokens/new" target="_blank"
           style={{ color: '#60a5fa', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ExternalLink size={13} /> 打开 GitHub Token 页面
        </a>
      </div>
    </div>
  )
}
