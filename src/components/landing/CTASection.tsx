// src/components/landing/CTASection.tsx
// Server component
import Link from 'next/link'

export default function CTASection() {
  return (
    <section style={{ padding: '80px 24px', background: '#080a10' }}>
      <style>{`
        .cta-primary { padding: 14px 32px; border-radius: 100px; background: #1a6cf6; color: white; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 8px 32px rgba(26,108,246,0.3); transition: transform 0.15s, background 0.15s; display: inline-block; }
        .cta-primary:hover { background: #1558d4; transform: translateY(-2px); }
        .cta-outline { padding: 14px 32px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.22); color: white; font-size: 16px; font-weight: 600; text-decoration: none; transition: border-color 0.15s; display: inline-block; }
        .cta-outline:hover { border-color: rgba(255,255,255,0.45); }
      `}</style>
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'white', margin: '0 0 20px', lineHeight: 1.1 }}>
          Ready to transform your clinic operations?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 40, lineHeight: 1.65 }}>
          Join thousands of surgical teams who use ClinicOS to deliver better care, eliminate operational chaos, and protect revenue.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/auth/signin" className="cta-primary">Get started for free</Link>
          <Link href="/auth/signin" className="cta-outline">Talk to sales</Link>
        </div>
      </div>
    </section>
  )
}
