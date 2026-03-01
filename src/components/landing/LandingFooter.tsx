'use client'
// src/components/landing/LandingFooter.tsx
// Professional dark-themed footer matching the site's dark aesthetic
import Link from 'next/link'
import { useState } from 'react'
import { SocialIcons } from '@/components/ui/social-icons'

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Patient Management', href: '/patients' },
      { label: 'Task Automation', href: '/tasks' },
      { label: 'Billing Intelligence', href: '/billing' },
      { label: 'AI Agent Log', href: '/agent-log' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Status Page', href: '#' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Orthopaedics', href: '#' },
      { label: 'Cardiology', href: '#' },
      { label: 'Neurosurgery', href: '#' },
      { label: 'Enterprise', href: '#' },
      { label: 'Multi-site Clinics', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Partners', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
]

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  )
}

export default function LandingFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <footer>
      <style>{`
        .footer-link { font-size: 13.5px; color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.2s; line-height: 1.9; }
        .footer-link:hover { color: #60a5fa; }
        .footer-social { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); transition: background 0.2s, color 0.2s, transform 0.2s; cursor: pointer; border: 1px solid rgba(255,255,255,0.06); }
        .footer-social:hover { background: rgba(26,108,246,0.15); color: #60a5fa; transform: translateY(-2px); border-color: rgba(26,108,246,0.3); }
        .newsletter-input { flex: 1; padding: 12px 16px; border-radius: 12px 0 0 12px; border: 1px solid rgba(255,255,255,0.15); border-right: none; font-size: 14px; outline: none; color: white; background: rgba(255,255,255,0.06); min-width: 0; }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.35); }
        .newsletter-input:focus { border-color: #1a6cf6; box-shadow: 0 0 0 3px rgba(26,108,246,0.15); }
        .newsletter-btn { padding: 12px 24px; border-radius: 0 12px 12px 0; background: #1a6cf6; color: white; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
        .newsletter-btn:hover { background: #3b82f6; }
        .footer-bottom-link { font-size: 13px; color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.15s; }
        .footer-bottom-link:hover { color: rgba(255,255,255,0.7); }
        @media (max-width: 768px) {
          .footer-columns { grid-template-columns: repeat(2, 1fr) !important; }
          .footer-newsletter-inner { flex-direction: column !important; gap: 8px !important; }
          .newsletter-input { border-radius: 12px !important; border-right: 1px solid rgba(255,255,255,0.15) !important; }
          .newsletter-btn { border-radius: 12px !important; }
          .footer-bottom-inner { flex-direction: column !important; text-align: center !important; }
          .footer-bottom-links { justify-content: center !important; }
          .footer-contact-row { justify-content: center !important; }
        }
        @media (max-width: 480px) {
          .footer-columns { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── Newsletter CTA Banner (Commented out for future use) ─── */}
      {/* 
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,108,246,0.2) 0%, rgba(59,130,246,0.1) 50%, rgba(26,108,246,0.2) 100%)',
        borderTop: '1px solid rgba(26,108,246,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 24px',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 8px', fontFamily: 'system-ui' }}>
            Subscribe to our newsletter
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', lineHeight: 1.6 }}>
            Get the latest updates on AI-powered clinical workflows, product news, and industry insights.
          </p>

          {subscribed ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '16px 24px', color: '#4ade80', fontSize: 15, fontWeight: 600 }}>
              ✓ Subscribed successfully! We&apos;ll keep you updated.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-inner" style={{ display: 'flex', maxWidth: 440, margin: '0 auto', gap: 0 }}>
              <input
                className="newsletter-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          )}

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
            You can unsubscribe at any time. Read our <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>privacy policy</a>.
          </p>
        </div>
      </div>
      */}

      {/* ─── Main Footer Content ─── */}
      <div style={{ background: '#06070c', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 40px' }}>

          {/* Top: Brand + Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 40, marginBottom: 48 }} className="footer-columns">

            {/* Brand column */}
            <div>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1a6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                    <circle cx="10" cy="10" r="3.5" fill="white" />
                    <circle cx="10" cy="3" r="1.5" fill="white" opacity="0.7" />
                    <circle cx="10" cy="17" r="1.5" fill="white" opacity="0.7" />
                    <circle cx="3" cy="10" r="1.5" fill="white" opacity="0.7" />
                    <circle cx="17" cy="10" r="1.5" fill="white" opacity="0.7" />
                  </svg>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'system-ui' }}>ClinicOS</span>
              </Link>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: '0 0 20px', maxWidth: 260 }}>
                AI-powered clinical operations copilot for surgical teams. Automate workflows, surface risks, and protect revenue.
              </p>
              {/* Social icons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <SocialIcons />
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', margin: '0 0 16px', fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {col.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {col.links.map((link) => (
                    <a key={link.label} href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact row */}
          <div className="footer-contact-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 32, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(26,108,246,0.1)', border: '1px solid rgba(26,108,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                <PhoneIcon />
              </div>
              <span>+91-9876280190</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(26,108,246,0.1)', border: '1px solid rgba(26,108,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                <MailIcon />
              </div>
              <span>devxaman@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div style={{ background: '#040508', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-bottom-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} ClinicOS, Inc. All rights reserved.
          </span>
          <div className="footer-bottom-links" style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Use', 'Legal', 'Site Map'].map((item) => (
              <a key={item} href="#" className="footer-bottom-link">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
