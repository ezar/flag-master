import { Component, type ReactNode } from 'react'

interface Props  { children: ReactNode }
interface State  { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[FlagMaster] Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight:      '100dvh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '32px 24px',
          textAlign:      'center',
          background:     'var(--paper)',
          color:          'var(--ink)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧭</div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontWeight:900, fontSize:28, marginBottom:12 }}>
            Algo naufragó · Something crashed
          </h1>
          <p style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', fontSize:14, color:'var(--ink-soft)', marginBottom:28, maxWidth:360 }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background:'var(--chrome-bg)', color:'var(--gold)', border:'none', padding:'13px 28px', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', cursor:'pointer' }}
          >
            Recargar · Reload →
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
