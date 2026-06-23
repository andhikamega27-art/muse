'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/types'
import {
  User, Shield, Tag, ChevronRight, LogOut,
  FileText, Calendar, Users, Mail, LayoutTemplate, Camera, Link2, Check,
} from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import { useRef } from 'react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({ invoices: 0, clients: 0, schedules: 0 })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB')
      return
    }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('Gagal upload foto')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id)
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev)
    toast.success('Foto profil diperbarui')
    setUploading(false)
  }

  async function handleCopyLink() {
    if (!profile?.username) {
      toast.error('Set username dulu di Edit Profil')
      return
    }
    const url = `https://app-muse.vercel.app/${profile.username}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    toast.success('Link rate card disalin!')
    setTimeout(() => setCopied(false), 2500)
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {loading ? (
            <div className="w-24 h-24 rounded-3xl skeleton mb-4" />
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-24 h-24 rounded-3xl mb-4 overflow-hidden active:scale-95 transition-all"
              style={{ border: '3px solid rgba(255,255,255,0.35)' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <span className="text-white font-extrabold text-[32px]">{initials}</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-end justify-center pb-1.5"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }}>
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={14} className="text-white" />
                )}
              </div>
            </button>
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
              {profile?.username ? (
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.15)' }}>
                  {copied
                    ? <Check size={12} className="text-green-300" />
                    : <Link2 size={12} className="text-white/70" />}
                  <span className="text-[11px] font-semibold"
                    style={{ color: copied ? '#86efac' : 'rgba(255,255,255,0.7)' }}>
                    {copied ? 'Link disalin!' : `app-muse.vercel.app/${profile.username}`}
                  </span>
                </button>
              ) : (
                <Link href="/profile/edit"
                  className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <Link2 size={12} className="text-white/50" />
                  <span className="text-[11px] font-semibold text-white/50">Set username dulu</span>
                </Link>
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
