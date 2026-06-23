'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getScheduleStatusColor, getScheduleStatusLabel } from '@/lib/utils'
import { Schedule } from '@/types'
import { Plus, Calendar, Clock, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import { format, isSameDay, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

const STATUSES = ['all', 'tentative', 'confirmed', 'done', 'cancelled'] as const
const STATUS_LABEL: Record<string, string> = {
  all: 'Semua', tentative: 'Tentatif', confirmed: 'Konfirmasi', done: 'Selesai', cancelled: 'Batal',
}

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  tentative:  { bg: '#FFFBEB', border: '#F59E0B' },
  confirmed:  { bg: '#EFF6FF', border: '#3B82F6' },
  done:       { bg: '#F0FDF4', border: '#22C55E' },
  cancelled:  { bg: '#F9FAFB', border: '#D1D5DB' },
}

export default function SchedulesPage() {
  const supabase = createClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const today = new Date()

  useEffect(() => { loadSchedules() }, [])

  async function loadSchedules() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('schedules')
      .select('*, client:clients(name)')
      .eq('user_id', user.id)
      .order('schedule_date', { ascending: false })
      .order('start_time', { ascending: true })
    setSchedules((data as Schedule[]) ?? [])
    setLoading(false)
  }

  const filtered = filterStatus === 'all'
    ? schedules
    : schedules.filter(s => s.status === filterStatus)

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F3F4F8' }}>

      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-3" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[20px] font-extrabold text-[#111827]">Jadwal</h1>
          <Link href="/schedules/new"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-[13px] font-bold"
            style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
            <Plus size={14} /> Tambah
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95"
              style={filterStatus === s
                ? { background: '#7C3AED', color: '#fff' }
                : { background: '#F3F4F6', color: '#6B7280' }}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl mb-4 flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <Calendar size={28} style={{ color: '#7C3AED' }} />
            </div>
            <p className="font-bold text-[16px] text-[#111827]">Belum ada jadwal</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1 mb-5">Tambahkan jadwal pekerjaan kamu</p>
            <Link href="/schedules/new"
              className="px-5 py-2.5 rounded-2xl text-white text-[13px] font-bold"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
              + Tambah Jadwal
            </Link>
          </div>
        ) : (
          filtered.map(s => {
            const color = STATUS_COLORS[s.status] ?? STATUS_COLORS.tentative
            const schedDate = parseISO(s.schedule_date + 'T00:00:00')
            const isToday = isSameDay(schedDate, today)
            return (
              <Link key={s.id} href={`/schedules/${s.id}`}
                className="flex items-stretch gap-0 bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {/* Color bar */}
                <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: color.border }} />

                {/* Date block */}
                <div className="flex flex-col items-center justify-center px-3 py-3 flex-shrink-0 min-w-[52px]"
                  style={{ background: color.bg }}>
                  <span className="text-[10px] font-bold uppercase" style={{ color: color.border }}>
                    {format(schedDate, 'MMM', { locale: id })}
                  </span>
                  <span className="text-[22px] font-black leading-tight" style={{ color: color.border }}>
                    {format(schedDate, 'd')}
                  </span>
                  <span className="text-[9px] font-bold uppercase" style={{ color: color.border }}>
                    {format(schedDate, 'EEE', { locale: id })}
                  </span>
                  {isToday && (
                    <span className="mt-1 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: color.border }}>
                      Hari ini
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 px-3 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-[14px] text-[#111827] leading-tight truncate">{s.title}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: color.bg, color: color.border, border: `1px solid ${color.border}` }}>
                      {getScheduleStatusLabel(s.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {s.start_time && (
                      <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF] font-medium">
                        <Clock size={10} />
                        {s.start_time.slice(0, 5)}{s.end_time ? ` – ${s.end_time.slice(0, 5)}` : ''}
                      </span>
                    )}
                    {(s.client as any)?.name && (
                      <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF] font-medium truncate">
                        <User size={10} />{(s.client as any).name}
                      </span>
                    )}
                    {s.location && (
                      <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF] truncate">
                        <MapPin size={10} />{s.location}
                      </span>
                    )}
                    {s.job_type && (
                      <span className="text-[11px] font-semibold" style={{ color: color.border }}>
                        {s.job_type}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <BottomNav active="invoices" />
    </div>
  )
}
