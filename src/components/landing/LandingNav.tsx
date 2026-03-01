'use client'
// src/components/landing/LandingNav.tsx
// Responsive navbar with hamburger menu for mobile
import Link from 'next/link'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Resources', href: '#resources' },
  { label: 'Enterprise', href: '#enterprise' },
  { label: 'Pricing', href: '#pricing' },
]

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMobileOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <>
      <style>{`
        .nav-link { padding: 6px 12px; font-size: 13px; color: rgba(255,255,255,0.5); border-radius: 8px; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: rgba(255,255,255,0.9); }
        .nav-cta-primary { padding: 8px 20px; border-radius: 100px; background: #1a6cf6; color: white; font-size: 14px; font-weight: 700; text-decoration: none; transition: background 0.15s, transform 0.15s; box-shadow: 0 4px 20px rgba(26,108,246,0.25); display: inline-block; text-align: center; }
        .nav-cta-primary:hover { background: #1558d4; transform: translateY(-1px); }
        .nav-cta-secondary { padding: 8px 20px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 14px; font-weight: 600; text-decoration: none; transition: border-color 0.15s; display: inline-block; text-align: center; }
        .nav-cta-secondary:hover { border-color: rgba(255,255,255,0.45); }
        .hamburger-bar { display: block; width: 20px; height: 2px; background: white; border-radius: 1px; transition: transform 0.3s, opacity 0.3s; }
        .nav-mobile-link { padding: 12px 16px; font-size: 15px; color: rgba(255,255,255,0.7); text-decoration: none; border-radius: 8px; transition: background 0.15s; display: block; }
        .nav-mobile-link:hover { background: rgba(255,255,255,0.05); }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-ctas { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.3s, border-color 0.3s',
        background: scrolled || mobileOpen ? 'rgba(5,5,8,0.95)' : 'transparent',
        backdropFilter: scrolled || mobileOpen ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 20 20" fill="none" width="22" height="22">
                <circle cx="10" cy="10" r="3.5" fill="white" />
                <circle cx="10" cy="3" r="1.5" fill="white" opacity="0.7" />
                <circle cx="10" cy="17" r="1.5" fill="white" opacity="0.7" />
                <circle cx="3" cy="10" r="1.5" fill="white" opacity="0.7" />
                <circle cx="17" cy="10" r="1.5" fill="white" opacity="0.7" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', lineHeight: 1, marginBottom: 2 }}>AI Powered</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1 }}>ClinicOS</div>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, marginLeft: 16 }}>
            {NAV_LINKS.map((item) => (
              <a key={item.label} href={item.href} className="nav-link">{item.label}</a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="nav-desktop-ctas" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/auth/signin" className="nav-link" style={{ fontSize: 14 }}>Sign In</Link>
            <Link href="/auth/signin" className="nav-cta-primary">Get ClinicOS free</Link>
            <Link href="/auth/signin" className="nav-cta-secondary">Contact Sales</Link>
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, marginLeft: 'auto',
            }}
          >
            <span className="hamburger-bar" style={mobileOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}} />
            <span className="hamburger-bar" style={mobileOpen ? { opacity: 0 } : {}} />
            <span className="hamburger-bar" style={mobileOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="nav-mobile-menu" style={{
            padding: '8px 24px 24px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column', gap: 4,
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            {NAV_LINKS.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="nav-mobile-link">
                {item.label}
              </a>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
            <Link href="/auth/signin" onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              Sign In
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="nav-cta-primary" style={{ padding: '12px 20px', fontSize: 15 }}>
                Get ClinicOS free
              </Link>
              <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="nav-cta-secondary" style={{ padding: '12px 20px', fontSize: 15, textAlign: 'center' }}>
                Contact Sales
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
