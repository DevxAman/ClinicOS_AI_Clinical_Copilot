"use client";
// src/components/landing/FeaturesGrid.tsx
// Features grid with glowing border effect on hover

import { GlowingEffect } from "@/components/ui/glowing-effect";

const features = [
  { icon: '🗂️', bg: '#dbeafe', title: 'Surgical Lifecycle Tracking', desc: 'Visual timelines per patient from pre-op to billing. Never lose track of where a patient is in their care journey.' },
  { icon: '🤖', bg: '#ccfbf1', title: 'AI Operations Agent', desc: 'Hourly autonomous scans that detect operational gaps, auto-create tasks, and log AI reasoning with full transparency.' },
  { icon: '💰', bg: '#fef9c3', title: 'Billing Intelligence', desc: 'Procedure-linked billing milestones with overdue alerts, auto-drafted follow-ups, and revenue dashboards.' },
  { icon: '⚠️', bg: '#fee2e2', title: 'Risk Scoring', desc: 'Dynamic patient risk scores updated by the AI agent based on overdue tasks, missed reviews, and clinical flags.' },
  { icon: '📋', bg: '#f3e8ff', title: 'Smart Task Management', desc: 'Pre-op, follow-up, and billing tasks auto-generated from procedure templates and assigned to the right staff.' },
  { icon: '📊', bg: '#dcfce7', title: 'Agent Log & Transparency', desc: 'Full audit trail of every AI decision — what was queried, recommended, and what actions were taken.' },
]

export default function FeaturesGrid() {
  return (
    <section style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', textAlign: 'center', margin: '0 0 48px' }}>
          Powerful features for modern clinics
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0">
          {features.map(f => (
            <li key={f.title} className="min-h-[14rem] list-none">
              <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/[0.08] p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border-[0.75px] border-white/[0.06] p-6 shadow-sm"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="relative flex flex-1 flex-col justify-between gap-3">
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      {f.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
