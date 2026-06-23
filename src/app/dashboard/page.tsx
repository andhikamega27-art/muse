'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatRupiah } from '@/lib/utils'
import { Invoice, Schedule } from '@/types'
import { FileText, Calendar, Users, ChevronRight, Bell, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<{ name: string } | null>(null)
  const [stats, setStats] = useState({ totalIncome: 0, totalBookings: 0, totalClients: 0 })
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')

    const [profileRes, invoicesRes, schedulesRes, clientsRes] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', user.id).single(),
      supabase.from('invoices').select('*, client:clients(name)')
        .eq('user_id', user.id).gte('invoice_date', startOfMonth)
        .order('created_at', { ascending: false }).limit(3),
      supabase.from('schedules').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])

    setProfile(profileRes.data)
    setRecentInvoices((invoicesRes.data as Invoice[]) ?? [])

    const invoices = invoicesRes.data ?? []
    setStats({
      totalIncome: invoices.reduce((s: number, i: Invoice) => s + i.total, 0),
      totalBookings: schedulesRes.count ?? 0,
      totalClients: clientsRes.count ?? 0,
    })
    setLoading(false)
  }

  const firstName = profile?.name?.split(' ')[0] ?? '...'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
  })()

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-500',
    sent: 'bg-blue-50 text-blue-600',
    paid: 'bg-green-50 text-green-600',
    overdue: 'bg-red-50 text-red-500',
    cancelled: 'bg-gray-100 text-gray-400',
  }
  const statusLabel: Record<string, string> = {
    draft: 'Draft', sent: 'Terkirim', paid: 'Lunas', overdue: 'Jatuh Tempo', cancelled: 'Batal',
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8FC' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 bg-white">
        <span className="text-[22px] font-extrabold" style={{ color: '#5B21B6' }}>Muse</span>
        <button className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-[#F3F4F6]">
          <Bell size={19} className="text-[#374151]" />
        </button>
      </div>

      {/* ── Greeting ── */}
      <div className="px-5 pt-5 pb-4 bg-white">
        <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-[14px] text-[#6B7280] font-medium mt-0.5">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
        </p>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Quick Actions ── */}
        <div className="space-y-3">
          <Link href="/invoices/new"
            className="card flex items-center gap-4 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#EDE9FE' }}>
              <FileText size={22} style={{ color: '#5B21B6' }} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[15px] text-[#111827]">Buat Invoice</p>
              <p className="text-[13px] text-[#6B7280] font-medium mt-0.5">Buat dan kirim invoice ke klien</p>
            </div>
            <ChevronRight size={18} className="text-[#D1D5DB]" />
          </Link>

          <Link href="/schedules/new"
            className="card flex items-center gap-4 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#DCFCE7' }}>
              <Calendar size={22} style={{ color: '#16A34A' }} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[15px] text-[#111827]">Booking Jadwal</p>
              <p className="text-[13px] text-[#6B7280] font-medium mt-0.5">Kelola dan atur jadwal booking</p>
            </div>
            <ChevronRight size={18} className="text-[#D1D5DB]" />
          </Link>

          <Link href="/clients/new"
            className="card flex items-center gap-4 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FEF3C7' }}>
              <Users size={22} style={{ color: '#D97706' }} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[15px] text-[#111827]">Kelola Klien</p>
              <p className="text-[13px] text-[#6B7280] font-medium mt-0.5">Lihat dan kelola data klien</p>
            </div>
            <ChevronRight size={18} className="text-[#D1D5DB]" />
          </Link>
        </div>

        {/* ── Ringkasan ── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Ringkasan</p>
            <span className="text-[12px] font-bold text-[#6B7280] bg-[#F3F4F6] px-3 py-1 rounded-full">
              Bulan ini
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-10" />)}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <TrendingUp size={16} style={{ color: '#5B21B6' }} />
                  </div>
                  <span className="text-[14px] font-bold text-[#374151]">Total Invoice</span>
                </div>
                <span className="text-[15px] font-extrabold text-[#111827]">{formatRupiah(stats.totalIncome)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
                    <Calendar size={16} style={{ color: '#16A34A' }} />
                  </div>
                  <span className="text-[14px] font-bold text-[#374151]">Total Booking</span>
                </div>
                <span className="text-[15px] font-extrabold text-[#111827]">{stats.totalBookings}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                    <Users size={16} style={{ color: '#D97706' }} />
                  </div>
                  <span className="text-[14px] font-bold text-[#374151]">Customer</span>
                </div>
                <span className="text-[15px] font-extrabold text-[#111827]">{stats.totalClients}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Invoice terbaru ── */}
        {!loading && recentInvoices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="section-title">Invoice Terbaru</p>
              <Link href="/invoices" className="text-[13px] font-bold" style={{ color: '#7C3AED' }}>
                Lihat semua
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentInvoices.map(inv => (
                <Link key={inv.id} href={`/invoices/${inv.id}`}
                  className="card flex items-center gap-3 active:scale-[0.98] transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                    <FileText size={17} style={{ color: '#5B21B6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-[#111827]">{inv.invoice_number}</p>
                    <p className="text-[12px] text-[#6B7280] font-medium truncate">
                      {(inv.client as any)?.name ?? 'Tanpa klien'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-bold text-[13px] text-[#111827]">{formatRupiah(inv.total)}</p>
                      <span className={`badge text-[10px] ${statusColor[inv.status]}`}>
                        {statusLabel[inv.status]}
                      </span>
                    </div>
                    <ChevronRight size={15} className="text-[#D1D5DB]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="dashboard" />
    </div>
  )
}
