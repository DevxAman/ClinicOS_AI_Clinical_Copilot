// src/components/landing/SocialProofBand.tsx
import Link from 'next/link'

export default function SocialProofBand() {
  return (
    <section style={{ padding: '80px 24px', background: 'transparent' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', margin: '0 0 16px' }}>
          Trusted by surgical teams at<br />over 2,000 specialty clinics
        </h2>
        <Link href="/auth/signin" style={{ display: 'inline-block', margin: '16px 0 48px', padding: '12px 24px', borderRadius: 100, background: '#1a6cf6', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(26,108,246,0.25)' }}>
          Get ClinicOS for free
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px 48px', opacity: 0.28, filter: 'grayscale(1)' }}>
          {['Apollo Hospitals', 'Max Healthcare', 'Fortis', 'Narayana Health', 'Aster Medcity', 'Manipal', 'SCI Hospital', 'Medanta', 'AIIMS'].map((h) => (
            <span key={h} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white' }}>{h}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
