"use client";
// src/app/auth/verify/page.tsx
// Shown after email magic link is sent
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #f1f3f5' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <circle cx="10" cy="10" r="3.5" fill="white"/>
              <circle cx="10" cy="3" r="1.5" fill="white" opacity="0.7"/>
              <circle cx="10" cy="17" r="1.5" fill="white" opacity="0.7"/>
              <circle cx="3" cy="10" r="1.5" fill="white" opacity="0.7"/>
              <circle cx="17" cy="10" r="1.5" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#111', fontFamily: 'system-ui' }}>ClinicOS</span>
        </Link>
      </header>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 24px' }}>✉️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 12px', fontFamily: 'system-ui' }}>Check your email</h1>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 8, lineHeight: 1.6 }}>
            A magic sign-in link has been sent to your email address.
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>The link expires in 10 minutes.</p>
          <Link href="/auth/signin" style={{ fontSize: 14, color: '#1a6cf6', fontWeight: 600, textDecoration: 'none', fontFamily: 'system-ui' }}>
            ← Back to sign in
          </Link>
        </div>
      </main>
    </div>
  )
}


