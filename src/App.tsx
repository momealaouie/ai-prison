import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Phaser from 'phaser'
import { PrisonScene } from './game/PrisonScene'
import { START_DELAY_MS, WORK_DURATION_MS } from './taskEngine'
import { useAgentWorld } from './useAgentWorld'

const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

const MORALE: Record<string, number> = { working: 100, done: 100, idle: 75, blocked: 40 }

/** Spelklockan startar 09:00 och gar en minut per verklig sekund. */
function gameClock(elapsedMs: number) {
  const total = 9 * 60 + Math.floor(elapsedMs / 1000)
  const day = 1 + Math.floor(total / 1440)
  const minutes = total % 1440
  return { day, time: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}` }
}

function App() {
  const gameRoot = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PrisonScene | null>(null)
  const startedAt = useRef(Date.now())
  const { agents, log, selected, selectedId, setSelectedId, assignTask } = useAgentWorld()
  const [now, setNow] = useState(() => Date.now())
  const [fullScreen, setFullScreen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!gameRoot.current) return
    const scene = new PrisonScene()
    scene.setEventHandlers({ onAgentSelected: agent => setSelectedId(agent.id) })
    sceneRef.current = scene
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameRoot.current,
      pixelArt: true,
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      scene,
    })
    return () => {
      sceneRef.current = null
      game.destroy(true)
    }
  }, [setSelectedId])

  useEffect(() => { sceneRef.current?.syncAgents(agents) }, [agents])
  useEffect(() => { sceneRef.current?.setSelectedAgent(selectedId) }, [selectedId])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    const onFullScreenChange = () => setFullScreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullScreenChange)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('fullscreenchange', onFullScreenChange)
    }
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen()
    else void document.exitFullscreen()
  }

  const submitTask = (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !draft.trim()) return
    assignTask(selected.id, draft)
    setDraft('')
    setFormOpen(false)
  }

  const { day, time } = gameClock(now - startedAt.current)
  const task = selected?.currentTask
  const progress =
    selected?.state === 'done' ? 1
      : selected?.state === 'working' && task
        ? Math.min(1, Math.max(0, (now - task.createdAt - START_DELAY_MS) / WORK_DURATION_MS))
        : 0
  const stars = selected?.state === 'done' ? 5 : selected?.state === 'working' ? 2 + Math.round(progress * 2) : 1
  const morale = selected ? MORALE[selected.state] : 0
  const completed = log.filter(entry => entry.kind === 'completed').length

  return (
    <div className="game-shell">
      <div ref={gameRoot} className="game-canvas" />
      <div className="vignette" />

      <div className="hud hud-topleft">
        <div className="brand-plate"><span className="brand-mark">✦</span>AI PRISON</div>
        <button className="pixel-button" onClick={toggleFullScreen}>{fullScreen ? 'STÄNG' : 'FULLSKÄRM'}</button>
      </div>

      <div className="hud hud-rail">
        <div className="clock-panel">
          <span className="clock-lamp" />
          <span className="clock-time">{time}</span>
          <span className="clock-day">DAG {String(day).padStart(2, '0')}</span>
        </div>
        {selected && (
          <div className="activity-card">
            <div className="activity-row">
              <div className="activity-thumb" style={{ background: hex(selected.color) }}>{selected.name[0]}</div>
              <div className="activity-body">
                <span className="activity-agent">{selected.name} · {selected.department}</span>
                <span className="activity-task">{selected.task}</span>
              </div>
            </div>
            <div className="stars">{[0, 1, 2, 3, 4].map(i => <span key={i} className={i < stars ? 'star on' : 'star'}>★</span>)}</div>
          </div>
        )}

        {selected && (
        <aside className="agent-panel">
          <div className="panel-head" style={{ borderColor: hex(selected.color) }}>
            <span>{selected.role.toUpperCase()}</span>
            <span className={`state ${selected.state}`}>{selected.state.toUpperCase()}</span>
          </div>
          {task?.result && <p className="panel-result">{task.result}</p>}
          {formOpen ? (
            <form className="assign-form" onSubmit={submitTask}>
              <label htmlFor="task-input">NYTT UPPDRAG TILL {selected.name.toUpperCase()}</label>
              <textarea
                id="task-input"
                autoFocus
                rows={3}
                value={draft}
                placeholder="T.ex. Ta fram tre idéer till nästa video"
                onChange={event => setDraft(event.target.value)}
              />
              <div className="assign-actions">
                <button type="submit" className="pixel-button primary" disabled={!draft.trim()}>SKICKA</button>
                <button type="button" className="pixel-button" onClick={() => { setFormOpen(false); setDraft('') }}>AVBRYT</button>
              </div>
            </form>
          ) : (
            <button className="pixel-button primary wide" onClick={() => setFormOpen(true)}>GE NYTT UPPDRAG</button>
          )}
        </aside>
        )}
      </div>

      <div className="hud hud-bottomleft">
        <div className="stat"><span className="stat-icon heart">♥</span><div className="bar"><i style={{ width: `${morale}%`, background: '#e2574c' }} /></div><span className="stat-value">{morale}</span></div>
        <div className="stat"><span className="stat-icon bolt">▲</span><div className="bar"><i style={{ width: `${Math.round(progress * 100)}%`, background: '#f0b429' }} /></div><span className="stat-value">{Math.round(progress * 100)}</span></div>
        <div className="stat"><span className="stat-icon coin">◆</span><span className="stat-value wide-value">{completed} KLARA</span></div>
      </div>

      <div className="hud hud-bottomcenter">WASD / PILTANGENTER · KLICKA PÅ EN AGENT</div>

      <div className="hud hud-bottomright event-log">
        {log.slice(0, 5).map(entry => (
          <p key={entry.id} className={`log-${entry.kind}`}><b>{entry.time}</b> {entry.text}</p>
        ))}
      </div>
    </div>
  )
}

export default App
