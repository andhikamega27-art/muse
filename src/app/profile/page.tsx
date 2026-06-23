'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/types'
import {
  User, Shield, Tag, ChevronRight, LogOut,
  FileText, Calendar, Users, Mail, LayoutTemplate,
} from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({ invoices: 0, clients: 0, schedules: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, invoiceRes, clientRes, scheduleRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('schedules').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])

    setProfile(profileRes.data as UserProfile)
    setStats({
      invoices: invoiceRes.count ?? 0,
      clients: clientRes.count ?? 0,
      schedules: scheduleRes.count ?? 0,
    })
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = profile?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

  const menuGroups = [
    {
      title: 'AKUN',
      items: [
        {
          icon: User, label: 'Edit Profil',
          sub: 'Nama, telepon, bank, alamat',
          color: '#EDE9FE', iconColor: '#5B21B6',
          href: '/profile/edit',
        },
        {
          icon: Shield, label: 'Keamanan Akun',
          sub: 'Email & password',
          color: '#DBEAFE', iconColor: '#1D4ED8',
          href: '/profile/security',
        },
        {
          icon: Tag, label: 'Rate Card',
          sub: 'Kelola paket harga layanan',
          color: '#FEF3C7', iconColor: '#D97706',
          href: '/profile/rate-cards',
        },
        {
          icon: LayoutTemplate, label: 'Template Invoice',
          sub: 'Pilih tampilan PDF invoice',
          color: '#DCFCE7', iconColor: '#16A34A',
          href: '/profile/invoice-template',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8FC' }}>

      {/* ── Hero Profile ── */}
      <div
        className="relative px-5 pt-14 pb-20 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1E0A4E 0%, #4C1D95 50%, #7C3AED 100%)' }}
      >
        {/* Decoration blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)' }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar */}
          {loading ? (
            <div className="w-24 h-24 rounded-3xl skeleton mb-4" />
          ) : (
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.35)' }}
            >
              <span className="text-white font-extrabold text-[32px]">{initials}</span>
            </div>
          )}

          {/* Name & email */}
          {loading ? (
            <div className="space-y-2 w-48">
              <div className="skeleton h-6 rounded-xl" />
              <div className="skeleton h-4 rounded-xl" />
            </div>
          ) : (
            <>
              <h1 className="text-white font-extrabold text-[22px] tracking-tight">{profile?.name}</h1>
              <p className="text-white/60 text-[13px] font-medium mt-1">{profile?.email}</p>
              {profile?.phone && (
                <p className="text-white/50 text-[12px] font-medium mt-0.5">{profile.phone}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="card grid grid-cols-3 divide-x divide-[#F3F4F6]">
          {[
            { label: 'Invoice', value: stats.invoices, icon: FileText, color: '#5B21B6' },
            { label: 'Klien', value: stats.clients, icon: Users, color: '#1D4ED8' },
            { label: 'Booking', value: stats.schedules, icon: Calendar, color: '#16A34A' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-2">
              {loading ? (
                <div className="skeleton h-7 w-10 rounded-lg mb-1" />
              ) : (
                <p className="text-[22px] font-extrabold text-[#111827]">{value}</p>
              )}
              <p className="text-[11px] font-bold text-[#6B7280] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Menu ── */}
      <div className="px-4 mt-4 space-y-4">
        {menuGroups.map(group => (
          <div key={group.title}>
            <p className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 px-1">
              {group.title}
            </p>
            <div className="card divide-y divide-[#F3F4F6] p-0 overflow-hidden">
              {group.items.map(({ icon: Icon, label, sub, color, iconColor, href }) => (
                <Link key={label} href={href}
                  className="flex items-center gap-4 px-4 py-4 active:bg-[#F9F9F9] transition-colors">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: color }}>
                    <Icon size={20} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] text-[#111827]">{label}</p>
                    <p className="text-[12px] text-[#6B7280] font-medium mt-0.5">{sub}</p>
                  </div>
                  <ChevronRight size={17} className="text-[#D1D5DB] flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Info profil singkat */}
        {!loading && (profile?.bank_account || profile?.bank_name) && (
          <div>
            <p className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2 px-1">
              INFO PEMBAYARAN
            </p>
            <div className="card space-y-3">
              {profile?.bank_name && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                    <FileText size={15} className="text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wide">Bank</p>
                    <p className="text-[14px] font-bold text-[#111827]">{profile.bank_name}</p>
                  </div>
                </div>
              )}
              {profile?.bank_account && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                    <Mail size={15} className="text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wide">No. Rekening</p>
                    <p className="text-[14px] font-bold text-[#111827]">
                      {profile.bank_account}
                      {profile.bank_holder && <span className="text-[#6B7280] font-medium"> · a.n. {profile.bank_holder}</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleSignOut}
          className="card w-full flex items-center gap-4 active:bg-[#FFF5F5] transition-colors p-4">
          <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut size={20} className="text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-[15px] text-red-500">Keluar</p>
            <p className="text-[12px] text-[#9CA3AF] font-medium mt-0.5">Logout dari akun</p>
          </div>
          <ChevronRight size={17} className="text-[#D1D5DB]" />
        </button>
      </div>

      <BottomNav active="profile" />
    </div>
  )
}
