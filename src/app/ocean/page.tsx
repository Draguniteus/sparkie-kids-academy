'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { oceanCreatures, getPollinationsImageUrl, type OceanCreature } from './data'

// Dynamic import to avoid SSR issues with Three.js
const OceanScene = dynamic(
  () => import('./OceanScene').then((m) => m.OceanScene),
  { ssr: false, loading: () => <LoadingScreen /> }
)

function LoadingScreen() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(180deg, #0d3b66 0%, #0a1628 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    }}>
      <div style={{ fontSize: '60px', animation: 'float 2s ease-in-out infinite' }}>🌊</div>
      <p style={{ color: '#90e0ef', fontFamily: 'Quicksand, sans-serif', fontSize: '18px', margin: 0 }}>
        Loading Ocean World...
      </p>
    </div>
  )
}

// Web Audio ambient ocean sound
function useOceanAudio() {
  useEffect(() => {
    let audioCtx: AudioContext | null = null
    let running = false

    const startAudio = async () => {
      if (running || audioCtx) return
      try {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const masterGain = audioCtx.createGain()
        masterGain.gain.setValueAtTime(0.08, audioCtx.currentTime)
        masterGain.connect(audioCtx.destination)

        // Low frequency rumble (ocean ambience)
        const osc1 = audioCtx.createOscillator()
        const gain1 = audioCtx.createGain()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(55, audioCtx.currentTime)
        gain1.gain.setValueAtTime(0.4, audioCtx.currentTime)
        osc1.connect(gain1)
        gain1.connect(masterGain)
        osc1.start()

        // Gentle wave pattern using LFO
        const lfo = audioCtx.createOscillator()
        const lfoGain = audioCtx.createGain()
        lfo.type = 'sine'
        lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime)
        lfoGain.gain.setValueAtTime(0.3, audioCtx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(gain1.gain)
        lfo.start()

        // High shimmer
        const osc2 = audioCtx.createOscillator()
        const gain2 = audioCtx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(440, audioCtx.currentTime)
        gain2.gain.setValueAtTime(0.02, audioCtx.currentTime)
        osc2.connect(gain2)
        gain2.connect(masterGain)
        osc2.start()

        running = true
      } catch {
        // Audio not available
      }
    }

    const handleInteraction = () => { startAudio(); document.removeEventListener('click', handleInteraction) }
    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleInteraction)
      if (audioCtx) {
        audioCtx.close()
      }
    }
  }, [])
}

function InfoPanel({
  creature,
  onClose,
  discoveredCount,
}: {
  creature: OceanCreature
  onClose: () => void
  discoveredCount: number
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'linear-gradient(180deg, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(0,180,216,0.3)',
        borderRadius: '28px 28px 0 0',
        padding: '24px 24px 36px',
        transform: 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        maxHeight: '72vh',
        overflowY: 'auto',
      }}
    >
      {/* Drag handle */}
      <div style={{
        width: '40px',
        height: '4px',
        background: '#334155',
        borderRadius: '2px',
        margin: '0 auto 20px',
      }} />

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: '#94a3b8',
          fontSize: '22px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Letter badge */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 700,
          color: '#0a1628',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(255,217,61,0.4)',
        }}>
          {creature.letter}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            margin: '0 0 4px',
            fontSize: '22px',
            fontWeight: 700,
            color: '#ffd93d',
            fontFamily: 'Quicksand, sans-serif',
          }}>
            {creature.animal}
          </h2>
          <p style={{
            margin: '0 0 16px',
            fontSize: '13px',
            color: '#64748b',
            fontFamily: 'Quicksand, sans-serif',
          }}>
            {discoveredCount} of 26 discovered
          </p>
        </div>
      </div>

      {/* Creature image */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '16px',
        background: '#0d3b66',
      }}>
        <Image
          src={getPollinationsImageUrl(creature, 600, 400)}
          alt={creature.animal}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 50%, rgba(10,22,40,0.6) 100%)',
        }} />
      </div>

      {/* Fun fact */}
      <div style={{
        background: 'rgba(0,180,216,0.1)',
        border: '1px solid rgba(0,180,216,0.2)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <p style={{
          margin: 0,
          fontSize: '15px',
          color: '#e0f7fa',
          lineHeight: 1.6,
          fontFamily: 'Quicksand, sans-serif',
        }}>
          💡 {creature.fact}
        </p>
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
        {[1, 2, 3].map((i) => (
          <span key={i} style={{ fontSize: '28px' }}>⭐</span>
        ))}
      </div>
    </div>
  )
}

export default function OceanPage() {
  const [selectedCreature, setSelectedCreature] = useState<OceanCreature | null>(null)
  const [discovered, setDiscovered] = useState<Set<string>>(new Set())
  const [showHint, setShowHint] = useState(true)

  useOceanAudio()

  // Hide hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleSelect = useCallback((creature: OceanCreature | null) => {
    if (!creature) return
    setSelectedCreature(creature)
    setDiscovered((prev) => new Set([...prev, creature.letter]))
    setShowHint(false)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedCreature(null)
  }, [])

  const progress = (discovered.size / 26) * 100

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a1628' }}>
      {/* Back button */}
      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          background: 'rgba(10,22,40,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,180,216,0.3)',
          borderRadius: '14px',
          padding: '10px 16px',
          color: '#00b4d8',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'Quicksand, sans-serif',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        ← Home
      </Link>

      {/* Title */}
      <div style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 700,
          color: 'white',
          fontFamily: 'Quicksand, sans-serif',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          🌊 Ocean World
        </h1>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'clamp(160px, 40vw, 240px)',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '11px',
          color: '#64748b',
          fontFamily: 'Quicksand, sans-serif',
        }}>
          <span>Progress</span>
          <span style={{ color: '#00b4d8', fontWeight: 700 }}>{discovered.size}/26</span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00b4d8, #ffd93d)',
            borderRadius: '999px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Tap hint */}
      {showHint && !selectedCreature && (
        <div style={{
          position: 'fixed',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(10,22,40,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,180,216,0.3)',
          borderRadius: '16px',
          padding: '12px 20px',
          color: '#90e0ef',
          fontSize: '14px',
          fontFamily: 'Quicksand, sans-serif',
          textAlign: 'center',
          animation: 'float 2s ease-in-out infinite',
          pointerEvents: 'none',
        }}>
          👆 Tap any letter to discover the creature!
        </div>
      )}

      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={<LoadingScreen />}>
          <OceanScene
            selectedCreature={selectedCreature}
            onSelectCreature={handleSelect}
          />
        </Suspense>
      </div>

      {/* Info Panel */}
      {selectedCreature && (
        <InfoPanel
          creature={selectedCreature}
          onClose={handleClose}
          discoveredCount={discovered.size}
        />
      )}
    </div>
  )
}
