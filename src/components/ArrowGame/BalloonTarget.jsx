import React, { useMemo, memo } from 'react'

const BalloonTarget = memo(function BalloonTarget({ xPct, yPct, word, typedLength, isLocked }) {
  const style = useMemo(
    () => ({
      left: `${xPct}%`,
      top: `${yPct}%`,
      transform: 'translate(-50%,-50%)',
      width: '10%',
      minWidth: '40px',
      maxWidth: '80px',
      zIndex: isLocked ? 20 : 10
    }),
    [xPct, yPct, isLocked]
  )

  const typedPart = word.substring(0, typedLength)
  const untypedPart = word.substring(typedLength)

  return (
    <div className="absolute pointer-events-none flex flex-col items-center" style={style}>
      
      {/* Word Display */}
      <div className={`mb-1 px-2 py-0.5 rounded text-sm font-bold tracking-widest whitespace-nowrap shadow-lg transition-transform ${isLocked ? 'bg-white/90 scale-125' : 'bg-black/70 scale-100'}`}>
        <span className={`${isLocked ? 'text-green-600' : 'text-green-400'}`}>{typedPart}</span>
        <span className={`${isLocked ? 'text-gray-800' : 'text-white'}`}>{untypedPart}</span>
      </div>

      <div className="relative w-full aspect-[3/4] flex flex-col items-center">
        {/* Realistic CSS Balloon */}
        <div 
          className={`w-full h-[85%] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] relative transition-transform ${isLocked ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`}
          style={{
            background: isLocked ? 'radial-gradient(circle at 30% 30%, #ff8888, #ff0000 60%, #aa0000 100%)' : 'radial-gradient(circle at 30% 30%, #ff6b6b, #cc0000 60%, #880000 100%)',
            boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.3)'
          }}
        >
          {/* Highlight */}
          <div className="absolute top-[15%] left-[20%] w-[25%] h-[35%] rounded-[50%] bg-white/40 transform -rotate-12" />
        </div>
        {/* Balloon knot */}
        <div 
          className="w-[15%] h-[10%] -mt-[2%] z-10"
          style={{
            background: 'linear-gradient(to bottom, #cc0000, #880000)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            borderRadius: '2px'
          }}
        />
        {/* String */}
        <div className="w-[1px] h-[40%] bg-white/50" />
      </div>
    </div>
  )
})

export default BalloonTarget
