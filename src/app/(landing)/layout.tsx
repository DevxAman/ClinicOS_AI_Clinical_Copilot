// src/app/(landing)/layout.tsx
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen" style={{ background: '#050508', color: 'white' }}>{children}</div>
}
