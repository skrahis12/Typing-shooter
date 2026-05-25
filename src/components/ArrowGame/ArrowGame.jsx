import React, { useEffect, useRef, useState } from 'react'
import BalloonTarget from './BalloonTarget.jsx'
import ArrowProjectile from './ArrowProjectile.jsx'
import Crossbow from './Crossbow.jsx'
import ScoreHUD from './ScoreHUD.jsx'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const WORD_LIST = [
  'cat', 'dog', 'run', 'fly', 'sky', 'sun', 'red', 'car', 'box', 'pen', 'hat', 'bat', 'cow', 'cup', 'map', 'key', 'ice', 'web', 'fox', 'gem',
  'tree', 'wood', 'fire', 'wind', 'snow', 'rain', 'bird', 'fish', 'bear', 'wolf', 'lion', 'book', 'desk', 'door', 'moon', 'star', 'road', 'rock', 'time', 'game',
  'apple', 'house', 'water', 'earth', 'stone', 'plant', 'mouse', 'snake', 'tiger', 'horse', 'light', 'night', 'cloud', 'heart', 'dream', 'world', 'power', 'magic', 'sword', 'arrow',
  'forest', 'hunter', 'target', 'breeze', 'nature', 'shadow', 'silent', 'steady', 'dragon', 'knight', 'castle', 'bridge', 'river', 'valley', 'spirit', 'energy', 'silver', 'golden', 'purple', 'yellow',
  'archery', 'stealth', 'phantom', 'mystery', 'warrior', 'journey', 'victory', 'courage', 'passion', 'diamond', 'emerald', 'sapphire', 'crystal', 'volcano', 'thunder', 'weather', 'morning', 'evening', 'silence', 'whisper',
  'mountain', 'darkness', 'starlight', 'sunlight', 'moonlight', 'midnight', 'illusion', 'champion', 'guardian', 'treasure', 'fortress', 'universe', 'galaxy', 'stardust', 'infinity', 'eternity', 'solitude', 'strength', 'wisdom', 'knowledge',
  'adventure', 'beautiful', 'brilliant', 'challenge', 'character', 'dangerous', 'discovery', 'education', 'excellent', 'fantastic', 'frequency', 'highlight', 'important', 'knowledge', 'landscape', 'magnitude', 'necessary', 'objective', 'practical', 'stranger',
  'accomplish', 'background', 'calculator', 'dictionary', 'experience', 'foundation', 'generation', 'hypothesis', 'impossible', 'journalism', 'leadership', 'management', 'navigation', 'observation', 'philosophy', 'quarantine', 'reflection', 'statistics', 'technology', 'understand', 'vocabulary', 'wilderness', 'xylophone', 'zoological', 'extraordinary', 'unbelievable', 'spectacular', 'magnificent', 'breathtaking', 'unforgettable'
]

const DIFFICULTIES = {
  easy: { name: 'Easy', spawnInterval: 3000, speedMultiplier: 0.8, minWordLen: 3, maxWordLen: 4, winScore: 500, color: 'text-green-400', bg: 'bg-green-600 hover:bg-green-500 shadow-green-500/50' },
  medium: { name: 'Medium', spawnInterval: 2000, speedMultiplier: 1.2, minWordLen: 4, maxWordLen: 7, winScore: 1000, color: 'text-yellow-400', bg: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/50' },
  hard: { name: 'Hard', spawnInterval: 1200, speedMultiplier: 2.0, minWordLen: 6, maxWordLen: 10, winScore: 1500, color: 'text-orange-500', bg: 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/50' },
  legend: { name: 'Legend', spawnInterval: 700, speedMultiplier: 3.5, minWordLen: 8, maxWordLen: 20, winScore: 2000, color: 'text-red-500 animate-pulse', bg: 'bg-red-700 hover:bg-red-600 shadow-red-600/50 border border-red-400 animate-pulse' },
}

export default function ArrowGame() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'won', 'gameover'
  const [difficulty, setDifficulty] = useState('medium')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)

  const difficultyRef = useRef('medium')
  difficultyRef.current = difficulty

  // Targets state: array of balloons
  const [targets, setTargets] = useState([])
  const [arrows, setArrows] = useState([]) 
  const [blasts, setBlasts] = useState([]) // {id, xPct, yPct, time}

  const [lockedTargetId, setLockedTargetId] = useState(null)
  const lockedTargetIdRef = useRef(lockedTargetId)
  lockedTargetIdRef.current = lockedTargetId

  const crossbowAimRef = useRef(Math.PI / 2) // default pointing up
  
  const targetsRef = useRef(targets)
  targetsRef.current = targets

  const arrowsRef = useRef(arrows)
  arrowsRef.current = arrows

  // Spawn timer
  const lastSpawnRef = useRef(0)

  const spawnTarget = () => {
    const conf = DIFFICULTIES[difficultyRef.current]
    const validWords = WORD_LIST.filter(w => w.length >= conf.minWordLen && w.length <= conf.maxWordLen)
    const wordPool = validWords.length > 0 ? validWords : WORD_LIST
    const word = wordPool[Math.floor(Math.random() * wordPool.length)]

    const startX = 15 + Math.random() * 70
    const startY = 110 // Starts below the screen and floats up
    const vx = (Math.random() - 0.5) * 5
    const vy = -(10 + Math.random() * 10) * conf.speedMultiplier // Negative is up

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      xPct: startX,
      yPct: startY,
      vx,
      vy,
      word,
      typedLength: 0,
      destroyed: false
    }
  }

  // game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    let rafId = 0
    let last = performance.now()
    lastSpawnRef.current = last

    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now

      const currentTargets = targetsRef.current
      const currentArrows = arrowsRef.current
      const conf = DIFFICULTIES[difficultyRef.current]

      // Spawn new targets based on difficulty
      let spawnedTarget = null
      if (now - lastSpawnRef.current > conf.spawnInterval) {
        spawnedTarget = spawnTarget()
        lastSpawnRef.current = now
      }

      let activeTargets = []
      for (let t of currentTargets) {
        if (t.destroyed) continue

        let nx = t.xPct + t.vx * dt
        let ny = t.yPct + t.vy * dt

        let vx = t.vx
        if (nx <= 5 || nx >= 95) {
          vx *= -1
          nx = clamp(nx, 5, 95)
        }

        if (ny < -15) {
          setLives((l) => {
            const nl = l - 1
            if (nl <= 0) setGameState('gameover')
            return nl
          })
          if (lockedTargetIdRef.current === t.id) setLockedTargetId(null)
          continue 
        }

        activeTargets.push({ ...t, xPct: nx, yPct: ny, vx })
      }

      if (spawnedTarget) activeTargets.push(spawnedTarget)

      let newlyDestroyedIds = new Set()
      let newBlasts = []
      let scoreGained = 0
      let activeArrows = []

      // Move arrows and detect hits
      for (const a of currentArrows) {
        const target = activeTargets.find(t => t.id === a.targetId)
        
        let currentVx = a.vx
        let currentVy = a.vy

        // Homing logic
        if (target) {
          const dxAim = target.xPct - a.xPct
          const dyAim = target.yPct - a.yPct
          const angle = Math.atan2(dyAim, dxAim)
          const speed = 280 
          currentVx = Math.cos(angle) * speed
          currentVy = Math.sin(angle) * speed
        }

        const nx = a.xPct + currentVx * dt
        const ny = a.yPct + currentVy * dt

        const alive = nx >= -10 && nx <= 110 && ny >= -10 && ny <= 110
        if (!alive) continue

        let hit = false
        if (target && !a.hasHit) {
          const dx = nx - target.xPct
          const dy = ny - target.yPct
          const dist = Math.sqrt(dx * dx + dy * dy)
          const hitRadius = 3.0 
          const stepDist = Math.sqrt(currentVx*currentVx + currentVy*currentVy) * dt
          
          if (dist <= hitRadius || dist <= stepDist) {
            hit = true
            newBlasts.push({ id: a.id, xPct: target.xPct, yPct: target.yPct, time: Date.now() })
            scoreGained += 10
            newlyDestroyedIds.add(target.id)
          }
        }

        if (!hit) {
          activeArrows.push({ ...a, xPct: nx, yPct: ny, vx: currentVx, vy: currentVy, hasHit: false })
        }
      }

      activeTargets = activeTargets.map(t => newlyDestroyedIds.has(t.id) ? { ...t, destroyed: true } : t)

      setTargets(activeTargets)
      setArrows(activeArrows)

      if (newBlasts.length > 0) {
        setBlasts((b) => [...b, ...newBlasts])
        setScore((s) => {
          const ns = s + scoreGained
          if (ns >= conf.winScore) {
            setGameState('won')
          }
          return ns
        })
      }

      // cleanup old blasts
      setBlasts((prev) => {
        if (prev.length === 0) return prev
        const filtered = prev.filter(b => now - b.time < 600)
        if (filtered.length !== prev.length) return filtered
        return prev
      })

      const locked = activeTargets.find(t => t.id === lockedTargetIdRef.current)
      if (locked) {
        const cx = 50
        const cy = 100
        const dx = locked.xPct - cx
        const dy = cy - locked.yPct
        crossbowAimRef.current = clamp(Math.atan2(dy, dx), 0.1, Math.PI - 0.1)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [gameState])



  // Keydown listener for typing
  useEffect(() => {
    if (gameState !== 'playing') return

    const handleKeyDown = (e) => {
      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) return
      
      const key = e.key.toLowerCase()
      if (!/[a-z]/.test(key)) return // only allow letters

      const currentTargets = targetsRef.current
      let targetToFire = null

      let locked = currentTargets.find(t => t.id === lockedTargetId)

      if (locked) {
        if (locked.typedLength < locked.word.length && locked.word[locked.typedLength].toLowerCase() === key) {
          if (locked.typedLength + 1 === locked.word.length) {
            targetToFire = locked
          }
        }
      } else {
        const available = currentTargets.filter(t => t.typedLength === 0 && t.word[0].toLowerCase() === key && !t.destroyed)
        if (available.length > 0) {
          available.sort((a, b) => a.yPct - b.yPct)
          const chosen = available[0]
          if (1 === chosen.word.length) {
            targetToFire = chosen
          }
        }
      }

      if (targetToFire) {
        fireArrow(targetToFire)
        setLockedTargetId(null)
      }

      // Actually update the state
      setTargets((prev) => {
        let newTargets = prev.map(t => ({...t}))
        let pLocked = newTargets.find(t => t.id === lockedTargetId)

        if (pLocked) {
          if (pLocked.typedLength < pLocked.word.length && pLocked.word[pLocked.typedLength].toLowerCase() === key) {
            pLocked.typedLength += 1
          }
        } else {
          const available = newTargets.filter(t => t.typedLength === 0 && t.word[0].toLowerCase() === key && !t.destroyed)
          if (available.length > 0) {
            available.sort((a, b) => a.yPct - b.yPct)
            const chosen = available[0]
            chosen.typedLength = 1
            if (chosen.typedLength !== chosen.word.length) {
              setLockedTargetId(chosen.id)
            }
          }
        }
        return newTargets
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, lockedTargetId])

  const fireArrow = (target) => {
    const cx = 50
    const cy = 100
    const dx = target.xPct - cx
    const dy = cy - target.yPct
    const angle = Math.atan2(dy, dx)
    crossbowAimRef.current = clamp(angle, 0.1, Math.PI - 0.1)

    const speed = 180 // Very fast arrow for typing game
    const vx = Math.cos(crossbowAimRef.current) * speed
    const vy = -Math.sin(crossbowAimRef.current) * speed 

    setArrows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        xPct: 50,
        yPct: 100,
        vx,
        vy,
        targetId: target.id,
        hasHit: false
      }
    ])
  }

  const startGame = (diffKey) => {
    setDifficulty(diffKey)
    difficultyRef.current = diffKey
    setScore(0)
    setLives(5)
    setTargets([]) 
    setArrows([])
    setBlasts([])
    setLockedTargetId(null)
    setGameState('playing')
    // We don't spawn a target immediately to give the user 1 second to prepare
    lastSpawnRef.current = performance.now()
  }

  const returnToMenu = () => {
    setGameState('menu')
    setTargets([])
    setArrows([])
    setBlasts([])
    setLockedTargetId(null)
  }

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      
      {/* HUD - absolutely positioned over the game */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <ScoreHUD score={score} lives={lives} running={gameState === 'playing'} />
        </div>
        <div className="flex flex-col items-end pointer-events-auto">
          {gameState === 'playing' && (
            <>
              <button
                onClick={returnToMenu}
                className="rounded-xl bg-slate-800/80 backdrop-blur text-white px-6 py-3 text-sm font-bold hover:bg-slate-700 active:scale-[0.99] shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10 transition-all focus:outline-none mb-2"
              >
                Quit Level
              </button>
              <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg px-4 py-2 text-right">
                <div className={`text-sm font-bold uppercase tracking-widest ${DIFFICULTIES[difficulty].color}`}>
                  {DIFFICULTIES[difficulty].name}
                </div>
                <div className="text-white/80 text-xs font-semibold tracking-wide mt-1">
                  GOAL: {DIFFICULTIES[difficulty].winScore} PTS
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="absolute inset-0 select-none overflow-hidden cursor-default"
        role="application"
        aria-label="Realistic Typing Crossbow game stage"
      >
        {/* Realistic CSS Background */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 40%, #064e3b 100%)',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_1px,transparent_1px),radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]" />
        </div>
        <div className="absolute inset-0 bg-black/10" />

        {/* Game Entities Layer */}
        <div className="absolute left-0 top-0 w-full h-full">
          {/* Targets */}
          {targets.map(t => (
            !t.destroyed && <BalloonTarget 
              key={t.id} 
              xPct={t.xPct} 
              yPct={t.yPct} 
              word={t.word}
              typedLength={t.typedLength}
              isLocked={lockedTargetId === t.id}
            />
          ))}

          {/* Blasts */}
          {blasts.map(b => (
            <div
              key={b.id}
              className="absolute pointer-events-none"
              style={{ left: `${b.xPct}%`, top: `${b.yPct}%`, transform: 'translate(-50%,-50%)' }}
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="absolute w-full h-full bg-red-500 rounded-full opacity-80" 
                    style={{ animation: 'customBlast 400ms cubic-bezier(0, 0, 0.2, 1) forwards' }}
                  />
                  <div 
                    className="absolute w-8 h-8 bg-yellow-300 rounded-full" 
                    style={{ animation: 'customBlast 200ms cubic-bezier(0, 0, 0.2, 1) forwards' }}
                  />
                </div>
              </div>
            </div>
          ))}
          <style>{`
            @keyframes customBlast {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(2.0); opacity: 0; }
            }
          `}</style>

          {/* Arrows */}
          {arrows.map((a) => (
            <ArrowProjectile key={a.id} xPct={a.xPct} yPct={a.yPct} vx={a.vx} vy={a.vy} />
          ))}

          {/* Crossbow */}
          <Crossbow aimRef={crossbowAimRef} />
        </div>

        {/* Main Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="text-white text-7xl font-black tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] mb-2 text-center">
              TYPING SHOOTER
            </div>
            <div className="text-gray-300 text-xl mb-12 text-center max-w-lg">
              Type the words on the balloons to automatically lock on and fire. Select your difficulty below.
            </div>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-xl px-4">
              {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                <button
                  key={key}
                  onClick={() => startGame(key)}
                  className={`py-6 px-4 rounded-xl text-white font-black text-2xl uppercase tracking-widest transition-all hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg ${diff.bg}`}
                >
                  {diff.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-lg">
            <div className="text-white text-8xl font-black tracking-widest drop-shadow-[0_0_35px_rgba(255,0,0,0.8)] mb-6 text-center animate-bounce">
              GAME OVER
            </div>
            <div className="text-white/80 text-2xl mb-8 font-semibold tracking-widest">
              Final Score: <span className="font-black text-white ml-2 text-4xl">{score}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => startGame(difficulty)}
                className="py-4 px-10 rounded-xl bg-red-600 text-white font-black text-xl uppercase tracking-widest hover:bg-red-500 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
              >
                Try Again
              </button>
              <button
                onClick={returnToMenu}
                className="py-4 px-10 rounded-xl bg-slate-800 text-white font-bold text-xl uppercase tracking-widest hover:bg-slate-700 transition-transform hover:scale-105 active:scale-95 border border-white/20"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}

        {/* Victory Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-green-950/90 backdrop-blur-lg">
            <div className="text-white text-8xl font-black tracking-widest drop-shadow-[0_0_35px_rgba(34,197,94,0.8)] mb-6 text-center animate-[pulse_1.5s_ease-in-out_infinite]">
              LEVEL COMPLETE
            </div>
            <div className="text-white text-2xl mb-2 font-semibold tracking-widest">
              Difficulty: <span className={`font-black ml-2 ${DIFFICULTIES[difficulty].color}`}>{DIFFICULTIES[difficulty].name}</span>
            </div>
            <div className="text-white/80 text-xl mb-12 font-medium">
              Score Reached: <span className="font-bold text-white">{score}</span> / {DIFFICULTIES[difficulty].winScore}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => startGame(difficulty)}
                className="py-4 px-10 rounded-xl bg-green-600 text-white font-black text-xl uppercase tracking-widest hover:bg-green-500 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(22,163,74,0.5)]"
              >
                Play Again
              </button>
              <button
                onClick={returnToMenu}
                className="py-4 px-10 rounded-xl bg-slate-800 text-white font-bold text-xl uppercase tracking-widest hover:bg-slate-700 transition-transform hover:scale-105 active:scale-95 border border-white/20"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
