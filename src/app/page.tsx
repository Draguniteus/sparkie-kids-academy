'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const worlds = [
  {
    href: '/ocean',
    title: 'Ocean World',
    emoji: '🌊',
    description: 'Dive into the deep! Meet sea creatures from A to Z.',
    color: '#00b4d8',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #0d3b66 50%, #1a7fa8 100%)',
    cardGradient: 'linear-gradient(135deg, #00b4d8, #0077b6)',
    preview: 'https://gen.pollinations.ai/image/A%20for%20seahorse%20underwater%20coral%20reef%20childrens%20illustration%20bright%20colors?width=400&height=300&nologo=true',
    badge: 'LIVE',
    badgeColor: '#22c55e',
  },
  {
    href: '/dino',
    title: 'Dino Discovery',
    emoji: '🦖',
    description: 'Travel back in time! Discover dinosaurs from A to Z.',
    color: '#ff6b6b',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3d1a1a 50%, #5c2020 100%)',
    cardGradient: 'linear-gradient(135deg, #ff6b6b, #c0392b)',
    preview: 'https://gen.pollinations.ai/image/friendly%20baby%20t rex%20dinosaur%20in%20jungle%20sunshine%20childrens%20illustration?width=400&height=300&nologo=true',
    badge: 'COMING SOON',
    badgeColor: '#f59e0b',
  },
  {
    href: '/space',
    title: 'Space Explorers',
    emoji: '🚀',
    description: 'Blast off to the stars! Planets and stars from A to Z.',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a3d 50%, #2d1b69 100%)',
    cardGradient: 'linear-gradient(135deg, #a855f7, #6b21a8)',
    preview: 'https://gen.pollinations.ai/image/cute%20astronaut%20floating%20among%20planets%20childrens%20space%20illustration%20bright%20stars?width=400&height=300&nologo=true',
    badge: 'COMING SOON',
    badgeColor: '#f59e0b',
  },
]

function Star({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', background: 'white', ...style }} />
}

function WorldCard({ world, index }: { world: typeof worlds[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={world.href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: world.gradient,
          borderRadius: '24px',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
          cursor: world.href === '/ocean' ? 'pointer' : 'default',
          opacity: world.href === '/ocean' ? 1 : 0.6,
          transform: hovered && world.href === '/ocean' ? 'translateY(-8px) scale(1.02)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: hovered && world.href === '/ocean'
            ? `0 20px 60px ${world.color}55`
            : '0 8px 32px rgba(0,0,0,0.4)',
          border: `2px solid ${hovered && world.href === '/ocean' ? world.color + '88' : 'transparent'}`,
          maxWidth: '340px',
          width: '100%',
        }}
      >
        {/* Preview image */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '160px', marginBottom: '20px' }}>
          <Image
            src={world.preview}
            alt={world.title}
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
          />
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: world.badgeColor,
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '999px',
            letterSpacing: '0.5px',
          }}>
            {world.badge}
          </div>
        </div>

        {/* Emoji + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '40px', lineHeight: 1 }}>{world.emoji}</span>
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 700,
            color: 'white',
            fontFamily: 'Quicksand, sans-serif',
          }}>
            {world.title}
          </h2>
        </div>

        <p style={{
          margin: '0 0 20px 0',
          fontSize: '15px',
          color: '#94a3b8',
          lineHeight: 1.5,
          fontFamily: 'Quicksand, sans-serif',
        }}>
          {world.description}
        </p>

        {world.href === '/ocean' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: world.color,
            fontWeight: 700,
            fontSize: '14px',
            fontFamily: 'Quicksand, sans-serif',
          }}>
            <span>Start Learning</span>
            <span style={{ fontSize: '18px' }}>→</span>
          </div>
        )}

        {world.href !== '/ocean' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            fontWeight: 600,
            fontSize: '14px',
            fontFamily: 'Quicksand, sans-serif',
          }}>
            <span>🔒 Locked</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number; delay: number }>>([])

  useEffect(() => {
    const generated = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 3,
    }))
    setStars(generated)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a1a 0%, #0a1628 50%, #0d1f3c 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Stars */}
      {stars.map((star, i) => (
        <Star
          key={i}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle 2s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Header */}
      <div style={{
        padding: '32px 24px 16px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚡</div>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(24px, 6vw, 36px)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ffd93d, #ff6b6b, #00b4d8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Quicksand, sans-serif',
          letterSpacing: '-0.5px',
        }}>
          Kids Academy by Sparkie ✨
        </h1>
        <p style={{
          margin: '8px 0 0',
          color: '#64748b',
          fontSize: '15px',
          fontFamily: 'Quicksand, sans-serif',
        }}>
          Choose your adventure below!
        </p>
      </div>

      {/* World Cards */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '20px 24px 48px',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        {worlds.map((world, i) => (
          <div
            key={world.href}
            style={{
              animation: `floatSlow 3s ease-in-out ${i * 0.5}s infinite`,
            }}
          >
            <WorldCard world={world} index={i} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '0 0 32px',
        color: '#334155',
        fontSize: '12px',
        fontFamily: 'Quicksand, sans-serif',
        position: 'relative',
        zIndex: 10,
      }}>
        Made with 💛 by Sparkie ⚡ for Femebe & Leo
      </div>
    </div>
  )
}
