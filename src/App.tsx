import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Phaser from 'phaser'
import { PrisonScene } from './game/PrisonScene'
import { useAgentWorld } from './useAgentWorld'

const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

function App() {
  const gameRoot = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PrisonScene | null>(null)
  const { agents, log, selected, selectedId, setSelectedId, assignTask } = useAgentWorld()
  const [fullScreen, setFullScreen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!gameRoot.current) return
    const scene = new PrisonScene()
    scene.setEventHandlers({ onAgentSelected: agent => setSelectedId(agent.id) })
    sceneRef.current = scene
    const game = new Phaser.Game({ type: Phaser.AUTO, width: 1024, height: 560, parent: gameRoot.current, pixelArt: true, scene })
    return () => {
      sceneRef.current = null
      game.destroy(true)
    }
  }, [setSelectedId])

  useEffect(() => { sceneRef.current?.syncAgents(agents) }, [agents])
  useEffect(() => { sceneRef.current?.setSelectedAgent(selectedId) }, [selectedId])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
    setFullScreen(Boolean(!document.fullscreenElement))
  }

  const submitTask = (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !draft.trim()) return
    assignTask(selected.id, draft)
    setDraft('')
    setFormOpen(false)
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
          {selected && (
            <div className="selected-card" style={{ borderColor: hex(selected.color) }}>
              <div className="agent-avatar" style={{ background: hex(selected.color) }}>{selected.name[0]}</div>
              <div><h2>{selected.name}</h2><p>{selected.role}</p></div>
              <span className={`state ${selected.state}`}>{selected.state.toUpperCase()}</span>
              <div className="detail">
                <span>AVDELNING</span><strong>{selected.department}</strong>
                <span>AKTUELLT UPPDRAG</span><strong>{selected.task}</strong>
                {selected.currentTask?.result && (<><span>RESULTAT</span><strong className="result">{selected.currentTask.result}</strong></>)}
              </div>
              {formOpen ? (
                <form className="assign-form" onSubmit={submitTask}>
                  <label htmlFor="task-input">NYTT UPPDRAG TILL {selected.name.toUpperCase()}</label>
                  <textarea
                    id="task-input"
                    autoFocus
                    rows={3}
                    value={draft}
                    placeholder="T.ex. Ta fram tre idéer till nästa YouTube-video"
                    onChange={event => setDraft(event.target.value)}
                  />
                  <div className="assign-actions">
                    <button type="submit" className="assign-button" disabled={!draft.trim()}>SKICKA</button>
                    <button type="button" className="cancel-button" onClick={() => { setFormOpen(false); setDraft('') }}>AVBRYT</button>
                  </div>
                </form>
              ) : (
                <button className="assign-button" onClick={() => setFormOpen(true)}>GE NYTT UPPDRAG</button>
              )}
            </div>
          )}
          <div className="panel-title log-title">HÄNDELSELOGG</div>
          <div className="log">{log.map(entry => <p key={entry.id} className={`log-${entry.kind}`}><b>{entry.time}</b> {entry.text}</p>)}</div>
          <button className="create-button">+ SKAPA NY AGENT</button>
        </aside>
      </section>
    </main>
  )
}

export default App
