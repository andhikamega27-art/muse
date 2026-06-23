'use client'

import Link from 'next/link'
import { LayoutDashboard, FileText, Calendar, Users, UserCircle } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Beranda',  icon: LayoutDashboard, key: 'dashboard' },
  { href: '/invoices',  label: 'Invoice',  icon: FileText,         key: 'invoices'  },
  { href: '/schedules', label: 'Booking',  icon: Calendar,         key: 'schedules' },
  { href: '/clients',   label: 'Customer', icon: Users,            key: 'clients'   },
  { href: '/profile',   label: 'Profil',   icon: UserCircle,       key: 'profile'   },
]

export default function BottomNav({ active }: { active: string }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-1">
        {navItems.map(({ href, label, icon: Icon, key }) => {
          const isActive = active === key
          return (
            <Link
              key={key}
              href={href}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all duration-150 active:scale-90"
            >
              <div
                className="flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-150"
                style={{ background: isActive ? 'rgba(124,58,237,0.10)' : 'transparent' }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.7}
                  style={{ color: isActive ? '#7C3AED' : '#9CA3AF' }}
                />
              </div>
              <span
                className="text-[10px] font-bold leading-none"
                style={{ color: isActive ? '#7C3AED' : '#9CA3AF' }}
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
