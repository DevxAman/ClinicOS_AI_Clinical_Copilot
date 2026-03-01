"use client";
// src/components/landing/UseCasesGrid.tsx
// Specialty use cases grid with glowing border effect

import Link from 'next/link'
import { GlowingEffect } from "@/components/ui/glowing-effect";

const cases = [
  { emoji: '🦴', title: 'Orthopaedics', desc: 'Track pre-op physio, surgical milestones, and post-op rehab schedules automatically.', bg: '#dcfce7' },
  { emoji: '🔬', title: 'General Surgery', desc: 'Manage laparoscopic and open surgery workflows with procedure-specific task templates.', bg: '#f3e8ff' },
  { emoji: '❤️', title: 'Cardiology', desc: 'Coordinate multi-disciplinary care pathways and high-risk patient monitoring.', bg: '#dbeafe' },
  { emoji: '👁️', title: 'Ophthalmology', desc: 'Streamline high-volume cataract and refractive surgery scheduling and follow-ups.', bg: '#fef9c3' },
]

export default function UseCasesGrid() {
  return (
    <section style={{ padding: '80px 24px', background: 'transparent' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', textAlign: 'center', margin: '0 0 48px' }}>
          Clinical operations for every specialty
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none p-0 m-0 mb-10">
          {cases.map(c => (
            <li key={c.title} className="min-h-[18rem] list-none">
              <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/[0.08] p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border-[0.75px] border-white/[0.06]"
                  style={{ background: '#0d0f18' }}>
                  <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: c.bg, borderRadius: '11px 11px 0 0' }}>
                    {c.emoji}
                  </div>
                  <div className="p-5 flex-1">
                    <div className="text-sm font-bold text-white mb-2">{c.title}</div>
                    <div className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      {c.desc}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div style={{ textAlign: 'center' }}>
          <Link href="/auth/signin" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            See all specialties
          </Link>
        </div>
      </div>
    </section>
  )
}
