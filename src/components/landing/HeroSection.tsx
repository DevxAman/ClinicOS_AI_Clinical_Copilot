"use client";
// src/components/landing/HeroSection.tsx
// Hero: animated rotating headline + 3D interactive globe + stats
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { InteractiveGlobe } from '@/components/ui/interactive-globe'

const STATS = [
  { value: '2,000+', label: 'Clinics Onboarded' },
  { value: '48K+', label: 'Patients Tracked' },
  { value: '99.9%', label: 'Uptime' },
]

export default function HeroSection() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(
    () => ['globally connected', 'AI-automated', 'revenue-protected', 'risk-monitored', 'fully streamlined'],
    []
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber(titleNumber === titles.length - 1 ? 0 : titleNumber + 1)
    }, 2500)
    return () => clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <section className="hero-globe-section">
      <style>{`
        .hero-globe-section {
          position: relative; min-height: 100vh; display: flex; align-items: center;
          overflow: hidden; padding-top: 64px;
        }
        .hero-glow-container { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .hero-glow-center { position: absolute; top: 20%; left: 50%; transform: translateX(-50%); width: 900px; height: 700px; border-radius: 50%; background: radial-gradient(ellipse, rgba(26,108,246,0.11) 0%, transparent 70%); }
        .hero-glow-right { position: absolute; top: 15%; right: -5%; width: 680px; height: 680px; border-radius: 50%; background: radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%); }
        .hero-grid-bg { position: absolute; inset: 0; opacity: 0.022; background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px); background-size: 52px 52px; }
        .hero-content-grid {
          position: relative; z-index: 10; width: 100%; max-width: 1200px;
          margin: 0 auto; padding: 60px 32px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 100px;
          background: rgba(26,108,246,0.1); border: 1px solid rgba(26,108,246,0.22);
          color: #93c5fd; font-size: 12px; font-weight: 700; margin-bottom: 28px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
          display: inline-block; box-shadow: 0 0 6px rgba(74,222,128,0.7);
          animation: hero-pulse 2s ease-in-out infinite;
        }
        @keyframes hero-pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.6; transform:scale(0.85) } }
        .hero-headline {
          font-size: clamp(36px, 5vw, 64px); font-weight: 800; line-height: 1.05;
          letter-spacing: -0.03em; color: white; margin: 0 0 8px;
        }
        .hero-rotating-container {
          position: relative; display: flex; width: 100%; overflow: hidden;
          height: clamp(52px, 7vw, 84px); margin-bottom: 20px;
        }
        .hero-rotating-word {
          position: absolute; font-size: clamp(36px, 5vw, 64px); font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.25; padding-bottom: 8px;
          background: linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub { font-size: 17px; color: rgba(255,255,255,0.48); line-height: 1.75; max-width: 480px; margin: 0 0 36px; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 52px; }
        .hero-btn-primary {
          padding: 13px 28px; border-radius: 100px; background: #1a6cf6; color: white;
          font-size: 15px; font-weight: 700; text-decoration: none;
          box-shadow: 0 8px 32px rgba(26,108,246,0.3);
          transition: transform 0.15s, background 0.15s;
        }
        .hero-btn-primary:hover { background: #1558d4; transform: translateY(-2px); }
        .hero-btn-secondary {
          padding: 13px 28px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.2); color: white;
          font-size: 15px; font-weight: 600; text-decoration: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .hero-btn-secondary:hover { border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.04); }
        .hero-stats { display: flex; align-items: center; gap: 0; }
        .hero-stat-value { font-size: 26px; font-weight: 800; color: white; letter-spacing: -0.02em; }
        .hero-stat-label { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px; }
        .hero-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.1); margin: 0 28px; }
        .hero-globe-wrapper {
          display: flex; align-items: center; justify-content: center; position: relative;
        }
        .hero-globe-glow {
          position: absolute; inset: -10%;
          background: radial-gradient(ellipse, rgba(26,108,246,0.12) 0%, transparent 65%);
          pointer-events: none; border-radius: 50%;
        }
        .hero-globe-hint {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          font-size: 11px; color: rgba(255,255,255,0.28); display: flex;
          align-items: center; gap: 6px; white-space: nowrap; pointer-events: none;
        }
        @media (max-width: 900px) {
          .hero-content-grid { grid-template-columns: 1fr; text-align: center; padding: 40px 20px; }
          .hero-sub { margin: 0 auto 36px; }
          .hero-ctas { justify-content: center; }
          .hero-stats { justify-content: center; flex-wrap: wrap; gap: 16px; }
          .hero-stat-divider { display: none; }
          .hero-globe-wrapper { margin-top: 20px; }
          .hero-badge { margin-left: auto; margin-right: auto; }
          .hero-rotating-container { justify-content: center; }
        }
      `}</style>

      {/* Ambient background */}
      <div className="hero-glow-container">
        <div className="hero-glow-center" />
        <div className="hero-glow-right" />
        <div className="hero-grid-bg" />
      </div>

      {/* Content grid: Text + Globe */}
      <div className="hero-content-grid">

        {/* ── LEFT: Text content with animated title ──────────────────── */}
        <div>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            All systems operational · Live in 35+ countries
          </div>

          <h1 className="hero-headline">Clinical operations</h1>

          {/* Animated rotating words */}
          <div className="hero-rotating-container">
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="hero-rotating-word"
                initial={{ opacity: 0, y: -100 }}
                transition={{ type: 'spring', stiffness: 50 }}
                animate={
                  titleNumber === index
                    ? { y: 0, opacity: 1 }
                    : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                }
              >
                {title}
              </motion.span>
            ))}
          </div>

          <p className="hero-sub">
            One AI platform for every surgical workflow — tracking patients,
            automating tasks, and protecting revenue across clinics worldwide.
            Drag the globe to explore our network.
          </p>

          <div className="hero-ctas">
            <Link href="/auth/register" className="hero-btn-primary">Get ClinicOS free</Link>
            <Link href="/auth/signin" className="hero-btn-secondary">Request a Demo</Link>
          </div>

          <div className="hero-stats">
            {STATS.map((stat, i) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div className="hero-stat-value">{stat.value}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
                {i < STATS.length - 1 && <div className="hero-stat-divider" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Interactive Globe ────────────────────────────────── */}
        <div className="hero-globe-wrapper">
          <div className="hero-globe-glow" />
          <InteractiveGlobe
            size={520}
            autoRotateSpeed={0.0016}
            dotColor="rgba(96, 165, 250, ALPHA)"
            arcColor="rgba(96, 165, 250, 0.35)"
            markerColor="rgba(34, 211, 238, 1)"
          />
          <div className="hero-globe-hint">
            <span>⟳</span> Drag to explore
          </div>
        </div>
      </div>
    </section>
  )
}
