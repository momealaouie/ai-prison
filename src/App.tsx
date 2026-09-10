import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { agents, PrisonScene } from './game/PrisonScene'
import type { Agent } from './types'

function App() {
  const gameRoot = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Agent | null>(agents[0])
  const [fullScreen, setFullScreen] = useState(false)

  useEffect(() => {
    if (!gameRoot.current) return
    const scene = new PrisonScene()
    scene.setEventHandlers({ onAgentSelected: setSelected })
    const game = new Phaser.Game({ type: Phaser.AUTO, width: 1024, height: 560, parent: gameRoot.current, pixelArt: true, scene })
    return () => game.destroy(true)
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
    setFullScreen(Boolean(!document.fullscreenElement))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><span className="brand-mark">✦</span><strong>AI PRISON</strong><span className="subtitle">AGENT ECOSYSTEM</span></div>
        <div className="top-actions"><span className="clock">DAY 01 · 09:42</span><button onClick={toggleFullScreen}>{fullScreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}</button></div>
      </header>
      <section className="game-layout">
        <div className="game-frame"><div ref={gameRoot} className="game-root" /><div className="controls-hint">WASD / PILTANGENTER · KLICKA PÅ EN AGENT</div></div>
        <aside className="side-panel">
          <div className="panel-title">AGENT STATUS <span className="live-dot">● LIVE</span></div>
          {selected && <div className="selected-card" style={{ borderColor: `#${selected.color.toString(16).padStart(6, '0')}` }}><div className="agent-avatar" style={{ background: `#${selected.color.toString(16).padStart(6, '0')}` }}>{selected.name[0]}</div><div><h2>{selected.name}</h2><p>{selected.role}</p></div><span className={`state ${selected.state}`}>{selected.state.toUpperCase()}</span><div className="detail"><span>AVDELNING</span><strong>{selected.department}</strong><span>AKTUELLT UPPDRAG</span><strong>{selected.task}</strong></div><button className="assign-button">GE NYTT UPPDRAG</button></div>}
          <div className="panel-title log-title">HÄNDELSELOGG</div>
          <div className="log"><p><b>09:42</b> Nova delade upp dagens mål.</p><p><b>09:39</b> Pixel började skriva ett nytt manus.</p><p><b>09:31</b> Echo väntar på ditt godkännande.</p></div>
          <button className="create-button">+ SKAPA NY AGENT</button>
        </aside>
      </section>
    </main>
  )
}

export default App
