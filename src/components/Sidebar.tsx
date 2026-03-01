'use client'
// src/components/Sidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',   icon: '⊞' },
  { href: '/patients',   label: 'Patients',     icon: '👤' },
  { href: '/procedures', label: 'Procedures',   icon: '🔬' },
  { href: '/tasks',      label: 'Tasks',        icon: '✓' },
  { href: '/billing',    label: 'Billing',      icon: '💳' },
  { href: '/agent-log',  label: 'Agent Log',    icon: '🤖' },
  { href: '/settings',   label: 'Settings',     icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 flex-shrink-0 bg-[#0d0f16] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            C
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/30 font-semibold">
              AI Powered
            </div>
            <div className="text-sm font-bold text-white leading-none">
              ClinicOS
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            DS
          </div>
          <div>
            <div className="text-xs font-semibold text-white/80">Dr. Sharma</div>
            <div className="text-[10px] text-white/35">Surgeon</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
