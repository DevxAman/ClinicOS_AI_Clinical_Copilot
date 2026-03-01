"use client";
// src/components/landing/SecuritySection.tsx
// Security card with glowing border effect
import Link from 'next/link'
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function SecuritySection() {
  return (
    <section style={{ padding: '48px 24px' }}>
      <div className="relative rounded-[1.75rem] border-[0.75px] border-white/[0.08] p-2 md:p-3" style={{ maxWidth: 860, margin: '0 auto' }}>
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative overflow-hidden rounded-[1.5rem]" style={{ padding: '64px 48px', textAlign: 'center', background: 'linear-gradient(135deg, #0d1220 0%, #0a0d18 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(26,108,246,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 16px' }}>
              Keep your clinical data safe
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
              HIPAA-ready architecture, role-based access control, end-to-end encryption, and full audit trails — built in from day one.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px 32px', marginBottom: 32 }}>
              {['HIPAA Ready', 'AES-256 Encryption', 'Role-Based Access', 'Full Audit Trail', 'SSO Support'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#4ade80', fontSize: 12 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <Link href="/auth/signin" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 100, background: 'white', color: '#0a0b0f', fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'opacity 0.15s' }}>
              Learn about security
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
