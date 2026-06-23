'use client'

import Link from 'next/link'
import { Home, LayoutDashboard, UserCircle } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Beranda',   icon: Home,            key: 'dashboard' },
  { href: '/invoices',  label: 'Kelola',    icon: LayoutDashboard, key: 'invoices'  },
  { href: '/profile',   label: 'Profil',    icon: UserCircle,      key: 'profile'   },
]

export default function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-[40px] pointer-events-auto"
        style={{
          background: 'rgba(18, 12, 38, 0.75)',
          backdropFilter: 'saturate(200%) blur(40px)',
          WebkitBackdropFilter: 'saturate(200%) blur(40px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset',
        }}
      >
        {navItems.map(({ href, label, icon: Icon, key }) => {
          const isActive = active === key
          return (
            <Link
              key={key}
              href={href}
              className="flex flex-col items-center gap-[5px] px-6 py-2.5 rounded-[32px] transition-all duration-200 active:scale-90"
              style={{
                background: isActive
                  ? 'rgba(255,255,255,0.15)'
                  : 'transparent',
                boxShadow: isActive
                  ? '0 2px 16px rgba(124,58,237,0.3), 0 1px 0 rgba(255,255,255,0.12) inset'
                  : 'none',
                minWidth: 72,
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.6}
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)' }}
              />
              <span
                className="text-[10px] font-semibold leading-none tracking-wide"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
