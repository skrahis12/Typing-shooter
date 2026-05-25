import React, { useMemo, memo } from 'react'

const ArrowProjectile = memo(function ArrowProjectile({ xPct, yPct, vx, vy }) {
  const rotation = useMemo(() => {
    const angleRad = Math.atan2(vy, vx)
    return (angleRad * 180) / Math.PI
  }, [vx, vy])

  const scale = Math.max(0.2, Math.min(1.0, yPct / 100))

  return (
    <div
      className="absolute pointer-events-none"
      style={{ 
        left: `${xPct}%`, 
        top: `${yPct}%`, 
        transform: `translate(-50%,-50%) rotate(${rotation}deg) scale(${scale})`,
        zIndex: 5
      }}
    >
      <div className="relative w-24 h-1.5 flex items-center">
        <div className="absolute left-0 w-4 h-4 bg-red-600 rounded-sm transform -translate-y-1/2 rotate-45 border border-red-800" />
        <div className="w-20 h-1.5 bg-gradient-to-b from-stone-400 via-stone-600 to-stone-800 shadow-sm" />
        <div
          className="absolute right-0 w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-500 shadow-sm"
          style={{ clipPath: 'polygon(0 20%, 100% 50%, 0 80%)', transform: 'translate(50%, 0)' }}
        />
      </div>
    </div>
  )
})

export default ArrowProjectile
