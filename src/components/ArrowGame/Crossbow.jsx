import React, { useEffect, useMemo, useState, memo } from 'react'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const Crossbow = memo(function Crossbow({ aimRef }) {
  const [angle, setAngle] = useState(Math.PI / 2) 

  useEffect(() => {
    let raf = 0
    const loop = () => {
      setAngle(aimRef.current ?? (Math.PI / 2))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [aimRef])

  const degrees = useMemo(() => 90 - (angle * 180) / Math.PI, [angle])

  return (
    <div 
      className="absolute pointer-events-none transition-transform duration-100 ease-out" 
      style={{ 
        left: '50%', 
        bottom: '0%', 
        transform: `translateX(-50%) rotate(${clamp(degrees, -85, 85)}deg)`,
        transformOrigin: 'center bottom', 
        width: '120px', 
        height: '200px',
        zIndex: 10
      }}
    >
      <div className="relative w-full h-full">
        <div 
          className="absolute left-1/2 bottom-0 w-8 h-full -translate-x-1/2 rounded-t-lg shadow-2xl"
          style={{
            background: 'linear-gradient(to right, #2a1f1a, #5c4033 50%, #2a1f1a)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            borderRight: '1px solid rgba(0,0,0,0.8)'
          }}
        >
          <div className="absolute left-1/2 top-0 bottom-10 w-1.5 -translate-x-1/2 bg-black/60 rounded-full" />
        </div>

        <div 
          className="absolute left-1/2 top-[25%] w-[180px] h-[30px] -translate-x-1/2 rounded-[50%]"
          style={{
            background: 'linear-gradient(to bottom, #1a1a1a, #333 50%, #1a1a1a)',
            boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
            borderTop: '2px solid rgba(255,255,255,0.2)'
          }}
        />

        <div className="absolute left-[-20px] top-[22%] w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 shadow-inner" />
        <div className="absolute right-[-20px] top-[22%] w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 shadow-inner" />

        <div 
          className="absolute left-[-5px] top-[28%] w-[65px] h-0.5 bg-white/40 origin-left"
          style={{ transform: 'rotate(50deg)' }}
        />
        <div 
          className="absolute right-[-5px] top-[28%] w-[65px] h-0.5 bg-white/40 origin-right"
          style={{ transform: 'rotate(-50deg)' }}
        />

        <div className="absolute left-1/2 -top-8 w-12 h-10 -translate-x-1/2 border-4 border-zinc-700 rounded-t-xl" />

        <div className="absolute left-1/2 top-[60%] w-10 h-16 -translate-x-1/2 bg-zinc-900 rounded shadow-[0_5px_15px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-green-900/50 border-2 border-zinc-700 flex items-center justify-center">
            <div className="w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80]" />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Crossbow
