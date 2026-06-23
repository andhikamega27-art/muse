'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatRupiah } from '@/lib/utils'
import { Invoice } from '@/types'
import {
  FileText, Calendar, Users, ChevronRight,
  Plus, CreditCard, BarChart2, Clock, CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const quickMenus = [
  { href: '/invoices/new',  label: 'Buat Invoice',  icon: Plus,       bg: 'rgba(124,58,237,0.12)', color: '#7C3AED' },
  { href: '/invoices',      label: 'Invoice',        icon: FileText,   bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
  { href: '/schedules/new', label: 'Booking Baru',   icon: Calendar,   bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  { href: '/schedules',     label: 'Jadwal',         icon: Clock,      bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  { href: '/clients',       label: 'Klien',          icon: Users,      bg: 'rgba(236,72,153,0.12)', color: '#EC4899' },
  { href: '/profile/rate-cards', label: 'Rate Card', icon: CreditCard, bg: 'rgba(99,102,241,0.12)', color: '#6366F1' },
]

const statusColor: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-500',
  sent:      'bg-blue-50 text-blue-600',
  paid:      'bg-green-50 text-green-600',
  overdue:   'bg-red-50 text-red-500',
  cancelled: 'bg-gray-100 text-gray-400',
}
const statusLabel: Record<string, string> = {
  draft: 'Draft', sent: 'Terkirim', paid: 'Lunas', overdue: 'Jatuh Tempo', cancelled: 'Batal',
}

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<{ name: string } | null>(null)
  const [stats, setStats] = useState({ totalIncome: 0, paidIncome: 0, totalBookings: 0, totalClients: 0, paidCount: 0, pendingCount: 0 })
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const [profileRes, invoicesRes, allInvoicesRes, schedulesRes, clientsRes] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', user.id).single(),
      supabase.from('invoices').select('*, client:clients(name)')
        .eq('user_id', user.id).gte('invoice_date', startOfMonth.split('T')[0])
        .order('created_at', { ascending: false }).limit(3),
      supabase.from('invoices').select('total, status').eq('user_id', user.id).gte('invoice_date', startOfMonth.split('T')[0]),
      supabase.from('schedules').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])

    setProfile(profileRes.data)
    setRecentInvoices((invoicesRes.data as Invoice[]) ?? [])

    const allInv = allInvoicesRes.data ?? []
    setStats({
      totalIncome:   allInv.reduce((s: number, i: any) => s + i.total, 0),
      paidIncome:    allInv.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + i.total, 0),
      paidCount:     allInv.filter((i: any) => i.status === 'paid').length,
      pendingCount:  allInv.filter((i: any) => i.status !== 'paid' && i.status !== 'cancelled').length,
      totalBookings: schedulesRes.count ?? 0,
      totalClients:  clientsRes.count ?? 0,
    })
    setLoading(false)
  }

  const firstName = profile?.name?.split(' ')[0] ?? '...'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 11) return 'Pagi'
    if (h < 15) return 'Siang'
    if (h < 18) return 'Sore'
    return 'Malam'
  })()

  return (
    <div className="min-h-screen pb-36" style={{ background: '#F3F4F8' }}>

      {/* ── Hero Card ── */}
      <div
        className="relative px-5 pt-14 pb-7 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
        }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[13px] font-semibold text-purple-200">Selamat {greeting},</p>
              <h1 className="text-[22px] font-extrabold text-white tracking-tight">{firstName} 👋</h1>
            </div>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
            >
              <span className="text-[18px] font-black text-white">M</span>
            </div>
          </div>

          {/* Earnings Card */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <p className="text-[12px] font-semibold text-purple-200 mb-1">Pendapatan Bulan Ini</p>
            {loading ? (
              <div className="h-8 w-40 rounded-lg bg-white/20 animate-pulse mb-3" />
            ) : (
              <p className="text-[28px] font-black text-white tracking-tight leading-tight mb-3">
                {formatRupiah(stats.totalIncome)}
              </p>
            )}
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-green-300" />
                <span className="text-[11px] font-semibold text-purple-100">
                  {loading ? '—' : formatRupiah(stats.paidIncome)} lunas
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-yellow-300" />
                <span className="text-[11px] font-semibold text-purple-100">
                  {loading ? '—' : stats.pendingCount} menunggu
                </span>
              </div>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 rounded-2xl px-3 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-[18px] font-black text-white">{loading ? '—' : stats.totalBookings}</p>
              <p className="text-[10px] font-semibold text-purple-200">Booking</p>
            </div>
            <div className="flex-1 rounded-2xl px-3 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-[18px] font-black text-white">{loading ? '—' : stats.totalClients}</p>
              <p className="text-[10px] font-semibold text-purple-200">Klien</p>
            </div>
            <div className="flex-1 rounded-2xl px-3 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-[18px] font-black text-white">{loading ? '—' : stats.paidCount}</p>
              <p className="text-[10px] font-semibold text-purple-200">Lunas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* ── Quick Menu ── */}
        <div>
          <p className="text-[13px] font-bold text-[#374151] mb-3 px-1">Fitur Utama</p>
          <div className="grid grid-cols-3 gap-3">
            {quickMenus.map(({ href, label, icon: Icon, bg, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-white active:scale-95 transition-all duration-150"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-bold text-[#374151] text-center leading-tight px-1">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Invoice Terbaru ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[13px] font-bold text-[#374151]">Invoice Terbaru</p>
            <Link href="/invoices" className="flex items-center gap-0.5 text-[12px] font-bold" style={{ color: '#7C3AED' }}>
              Lihat semua <ArrowUpRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <FileText size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-[13px] font-semibold text-gray-400">Belum ada invoice bulan ini</p>
              <Link href="/invoices/new"
                className="inline-block mt-3 text-[12px] font-bold px-4 py-1.5 rounded-xl"
                style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                Buat Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentInvoices.map(inv => (
                <Link key={inv.id} href={`/invoices/${inv.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 active:scale-[0.98] transition-all"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#EDE9FE' }}>
                    <FileText size={17} style={{ color: '#5B21B6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-[#111827]">{inv.invoice_number}</p>
                    <p className="text-[11px] text-[#9CA3AF] font-medium truncate">
                      {(inv.client as any)?.name ?? 'Tanpa klien'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-bold text-[13px] text-[#111827]">{formatRupiah(inv.total)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[inv.status]}`}>
                      {statusLabel[inv.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Laporan shortcut ── */}
        <Link href="/reports"
          className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 active:scale-[0.98] transition-all"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(124,58,237,0.1)' }}>
            <BarChart2 size={20} style={{ color: '#7C3AED' }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px] text-[#111827]">Laporan & Statistik</p>
            <p className="text-[12px] text-[#9CA3AF]">Analisa pendapatan & performa</p>
          </div>
          <ChevronRight size={16} className="text-[#D1D5DB]" />
        </Link>

      </div>

      <BottomNav active="dashboard" />
    </div>
  )
}
