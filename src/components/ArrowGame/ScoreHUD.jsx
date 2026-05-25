import React from 'react'

export default function ScoreHUD({ score, lives, running }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <div className="text-xs text-white/60">Score</div>
        <div className="text-lg font-semibold">{score}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <div className="text-xs text-white/60">Lives</div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={
                'w-3 h-3 rounded-full ' + (i < lives ? 'bg-red-500/80' : 'bg-white/10')
              }
            />
          ))}
        </div>
      </div>
      {!running && (
        <div className="hidden sm:block text-sm text-white/70">Tap Play</div>
      )}
    </div>
  )
}

