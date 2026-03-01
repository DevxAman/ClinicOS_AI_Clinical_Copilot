"use client";
// src/components/landing/FeatureSections.tsx
// Feature rows with glowing border effect on visual cards
import Link from 'next/link'
import { GlowingEffect } from "@/components/ui/glowing-effect";

function PatientVisual() {
  const patients = [
    { initials: 'AM', name: 'Aarav Mehta', proc: 'Total Knee Replacement', risk: 'High Risk', riskBg: 'rgba(239,68,68,0.14)', riskColor: '#f87171', gradA: '#6366f1', gradB: '#8b5cf6', tl: ['done', 'done', 'active', 'pending', 'pending'], labels: ['Pre-Op', 'Surgery', 'Day 5', 'Review', 'Billing'] },
    { initials: 'PR', name: 'Priya Rajan', proc: 'Lap. Cholecystectomy', risk: 'Medium', riskBg: 'rgba(251,191,36,0.14)', riskColor: '#fbbf24', gradA: '#10b981', gradB: '#0ea5e9', tl: ['done', 'active', 'pending', 'pending', 'pending'], labels: ['Pre-Op', 'Labs', 'Surgery', 'Review', 'Billing'] },
  ]
  return (
    <div style={{ background: '#0d0f18', borderRadius: 20, padding: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
      {patients.map(p => (
        <div key={p.name} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${p.gradA}, ${p.gradB})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{p.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{p.proc}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: p.riskBg, color: p.riskColor }}>{p.risk}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {p.tl.map((state, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < p.tl.length - 1 ? 1 : 'none' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid', flexShrink: 0, background: state === 'done' ? '#3b82f6' : 'transparent', borderColor: state === 'done' ? '#3b82f6' : state === 'active' ? '#60a5fa' : 'rgba(255,255,255,0.15)', boxShadow: state === 'active' ? '0 0 0 3px rgba(96,165,250,0.18)' : 'none' }} />
                {i < p.tl.length - 1 && <div style={{ flex: 1, height: 2, margin: '0 3px', background: state === 'done' ? '#3b82f6' : state === 'active' ? 'linear-gradient(to right, #3b82f6, rgba(255,255,255,0.08))' : 'rgba(255,255,255,0.08)' }} />}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {p.labels.map((l, i) => (
              <span key={i} style={{ fontSize: 9, color: p.tl[i] === 'active' ? '#60a5fa' : 'rgba(255,255,255,0.22)', fontWeight: p.tl[i] === 'active' ? 700 : 400 }}>{l}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AgentVisual() {
  return (
    <div style={{ background: '#06080a', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ padding: '10px 16px', background: '#0d1018', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>agent.run · 09:00 AM</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)' }}>2026-02-28T09:00:04Z</span>
      </div>
      <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 11 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
          <span style={{ color: '#60a5fa' }}>Step 1</span><span style={{ color: 'rgba(255,255,255,0.35)' }}> · DB Query: </span><span style={{ color: '#4ade80' }}>3 gaps found</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
          <span style={{ color: '#60a5fa' }}>&quot;overdueFollowUps&quot;</span><span style={{ color: 'rgba(255,255,255,0.35)' }}>{': ['}</span><span style={{ color: '#fca5a5' }}>&quot;Aarav Mehta&quot;</span><span style={{ color: 'rgba(255,255,255,0.35)' }}>{']'}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
          <span style={{ color: '#60a5fa' }}>&quot;riskScore&quot;</span><span style={{ color: 'rgba(255,255,255,0.35)' }}>{': '}</span><span style={{ color: '#fbbf24' }}>87</span><span style={{ color: 'rgba(255,255,255,0.35)' }}>{', reason: '}</span><span style={{ color: '#fca5a5' }}>&quot;Day 5 TKR, diabetic&quot;</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Actions:&nbsp;</span>
          {[{ l: 'CREATE_TASK', bg: 'rgba(74,222,128,0.15)', c: '#4ade80' }, { l: 'UPDATE_RISK', bg: 'rgba(251,146,60,0.15)', c: '#fb923c' }, { l: 'LOG_ENTRY', bg: 'rgba(96,165,250,0.15)', c: '#60a5fa' }].map(a => (
            <span key={a.l} style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4, background: a.bg, color: a.c, fontSize: 9, fontWeight: 700, marginRight: 4 }}>{a.l}</span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(45,212,191,0.55)', paddingTop: 4 }}>
          ✓ Completed in 2.84s · 4 tasks created · 2 risk scores updated
        </div>
      </div>
    </div>
  )
}

function BillingVisual() {
  const rows = [
    { ref: 'INV-001', patient: 'Aarav Mehta', desc: 'Pre-op Consultation', amount: '₹4,500', s: 'Paid', sBg: 'rgba(74,222,128,0.15)', sC: '#4ade80' },
    { ref: 'INV-002', patient: 'Aarav Mehta', desc: 'Surgical Procedure Fee', amount: '₹1,20,000', s: 'Pending', sBg: 'rgba(251,191,36,0.15)', sC: '#fbbf24' },
    { ref: 'INV-005', patient: 'Rekha Kapoor', desc: 'Physiotherapy (10 sessions)', amount: '₹12,000', s: 'Overdue', sBg: 'rgba(248,113,113,0.15)', sC: '#f87171' },
    { ref: 'INV-006', patient: 'Rekha Kapoor', desc: 'Post-op Medications', amount: '₹3,200', s: 'Overdue', sBg: 'rgba(248,113,113,0.15)', sC: '#f87171' },
    { ref: 'INV-007', patient: 'Suresh Nair', desc: 'Cataract Surgery + IOL', amount: '₹45,000', s: 'Pending', sBg: 'rgba(251,191,36,0.15)', sC: '#fbbf24' },
  ]
  return (
    <div style={{ background: '#0d0f18', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.38)' }}>Billing Events</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>₹15,200 overdue</span>
      </div>
      {rows.map(r => (
        <div key={r.ref} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', width: 60, flexShrink: 0 }}>{r.ref}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.72)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.desc}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>{r.patient}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.72)', flexShrink: 0 }}>{r.amount}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: r.sBg, color: r.sC, flexShrink: 0 }}>{r.s}</span>
        </div>
      ))}
      <div style={{ padding: '12px 16px', background: '#0a0b14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Total Pending Revenue</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>₹1,80,700</span>
      </div>
    </div>
  )
}

interface RowProps {
  badge: string; badgeBg: string; badgeColor: string; dot: string
  headline: string; body: string; ctaText: string; ctaColor: string
  Visual: React.FC; reverse: boolean
}

function FeatureRow({ badge, badgeBg, badgeColor, dot, headline, body, ctaText, ctaColor, Visual, reverse }: RowProps) {
  return (
    <section className="feat-row">
      <style>{`
        .feat-row { padding: 96px 24px; border-top: 1px solid rgba(255,255,255,0.05); }
        .feat-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .feat-cta { font-size: 14px; font-weight: 700; text-decoration: none; transition: opacity 0.15s; }
        .feat-cta:hover { opacity: 0.75; }
        @media (max-width: 768px) { .feat-grid { grid-template-columns: 1fr; gap: 32px; } }
      `}</style>
      <div className="feat-grid">
        <div style={{ order: reverse ? 2 : 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 100, background: badgeBg, border: `1px solid ${badgeColor}33`, fontSize: 12, fontWeight: 700, color: badgeColor, marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
            {badge}
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', lineHeight: 1.2, margin: '0 0 20px' }}>{headline}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: '0 0 28px' }}>{body}</p>
          <Link href="/auth/signin" className="feat-cta" style={{ color: ctaColor }}>{ctaText} →</Link>
        </div>
        {/* Visual card wrapper with glowing effect */}
        <div style={{ order: reverse ? 1 : 2 }}>
          <div className="relative rounded-[1.25rem] border-[0.75px] border-white/[0.08] p-2 md:rounded-[1.5rem] md:p-3">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={3}
            />
            <div className="relative overflow-hidden rounded-xl">
              <Visual />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function FeatureSections() {
  return (
    <>
      <FeatureRow badge="Surgical Lifecycle Tracking" badgeBg="rgba(26,108,246,0.1)" badgeColor="#60a5fa" dot="#60a5fa"
        headline="Every patient. Every step. Nothing missed."
        body="ClinicOS maps your entire surgical workflow — from pre-op checklists through surgery, recovery, and follow-up — into a single real-time timeline."
        ctaText="Explore patient profiles" ctaColor="#60a5fa" Visual={PatientVisual} reverse={false} />
      <FeatureRow badge="AI Operations Agent" badgeBg="rgba(20,184,166,0.1)" badgeColor="#2dd4bf" dot="#2dd4bf"
        headline="Your AI copilot runs your clinic while you operate."
        body="Every hour, the AI agent scans your entire patient database — finding overdue follow-ups, missing pre-op tasks, billing gaps — then automatically creates tasks and adjusts risk scores."
        ctaText="See agent workflow" ctaColor="#2dd4bf" Visual={AgentVisual} reverse={true} />
      <FeatureRow badge="Billing Intelligence" badgeBg="rgba(251,191,36,0.1)" badgeColor="#fbbf24" dot="#fbbf24"
        headline="Never lose revenue to an overdue invoice again."
        body="Procedure-linked billing milestones with overdue alerts, auto-drafted follow-up communications, and a real-time revenue pipeline."
        ctaText="Explore billing module" ctaColor="#fbbf24" Visual={BillingVisual} reverse={false} />
    </>
  )
}
