'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getScheduleStatusColor, getScheduleStatusLabel } from '@/lib/utils'
import { Schedule } from '@/types'
import { Plus, Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import { format, addDays, startOfWeek, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns'
import { id } from 'date-fns/locale'

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  tentative: { bg: '#FFFBEB', border: '#F59E0B' },
  confirmed: { bg: '#EFF6FF', border: '#3B82F6' },
  done:      { bg: '#F0FDF4', border: '#22C55E' },
  cancelled: { bg: '#F9FAFB', border: '#D1D5DB' },
}

export default function SchedulesPage() {
  const supabase = createClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  useEffect(() => { loadSchedules() }, [])

  async function loadSchedules() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('schedules')
      .select('*, client:clients(name)')
      .eq('user_id', user.id)
      .order('schedule_date', { ascending: true })
      .order('start_time', { ascending: true })
    setSchedules((data as Schedule[]) ?? [])
    setLoading(false)
  }

  const daySchedules = schedules.filter(s =>
    isSameDay(parseISO(s.schedule_date + 'T00:00:00'), selectedDate)
  )

  function prevWeek() {
    setWeekStart(subWeeks(weekStart, 1))
    setSelectedDate(subWeeks(selectedDate, 1))
  }

  function nextWeek() {
    setWeekStart(addWeeks(weekStart, 1))
    setSelectedDate(addWeeks(selectedDate, 1))
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F3F4F8' }}>

      {/* ── Header + Calendar ── */}
      <div className="bg-white pt-14 pb-3" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-4 mb-4">
          <h1 className="text-[20px] font-extrabold text-[#111827]">
            {format(selectedDate, 'MMMM yyyy', { locale: id })}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={prevWeek}
              className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center active:scale-90">
              <ChevronLeft size={16} className="text-[#374151]" />
            </button>
            <button onClick={nextWeek}
              className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center active:scale-90">
              <ChevronRight size={16} className="text-[#374151]" />
            </button>
            <Link href="/schedules/new"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-[13px] font-bold"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
              <Plus size={14} /> Tambah
            </Link>
          </div>
        </div>

        {/* Week Strip */}
        <div className="flex px-3 gap-1">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, today)
            const hasEvent = schedules.some(s =>
              isSameDay(parseISO(s.schedule_date + 'T00:00:00'), day)
            )
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className="flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl transition-all active:scale-90"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #5B21B6, #7C3AED)'
                    : 'transparent',
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}>
                  {format(day, 'EEE', { locale: id }).slice(0, 3)}
                </span>
                <span className="text-[17px] font-extrabold leading-tight"
                  style={{ color: isSelected ? '#fff' : isToday ? '#7C3AED' : '#111827' }}>
                  {format(day, 'd')}
                </span>
                <div className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: hasEvent
                      ? isSelected ? 'rgba(255,255,255,0.6)' : '#7C3AED'
                      : 'transparent',
                  }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── List Jadwal ── */}
      <div className="px-4 pt-4 space-y-2.5">
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest px-1">
          {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
        </p>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white animate-pulse" />
          ))
        ) : daySchedules.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mb-3 flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <Calendar size={24} style={{ color: '#7C3AED' }} />
            </div>
            <p className="font-bold text-[15px] text-[#111827]">Tidak ada jadwal</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1 mb-4">Hari ini kosong</p>
            <Link href="/schedules/new"
              className="px-5 py-2 rounded-2xl text-white text-[13px] font-bold"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
              + Tambah Jadwal
            </Link>
          </div>
        ) : (
          daySchedules.map(s => {
            const color = STATUS_COLORS[s.status] ?? STATUS_COLORS.tentative
            return (
              <Link key={s.id} href={`/schedules/${s.id}`}
                className="flex items-stretch bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {/* Color bar */}
                <div className="w-1 flex-shrink-0" style={{ background: color.border }} />

                {/* Content */}
                <div className="flex-1 px-4 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-bold text-[15px] text-[#111827] leading-tight truncate">{s.title}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: color.bg, color: color.border, border: `1px solid ${color.border}` }}>
                      {getScheduleStatusLabel(s.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {s.start_time && (
                      <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF] font-medium">
                        <Clock size={11} />
                        {s.start_time.slice(0, 5)}{s.end_time ? ` – ${s.end_time.slice(0, 5)}` : ''}
                      </span>
                    )}
                    {(s.client as any)?.name && (
                      <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF]">
                        <User size={11} />{(s.client as any).name}
                      </span>
                    )}
                    {s.location && (
                      <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF] truncate">
                        <MapPin size={11} />{s.location}
                      </span>
                    )}
                    {s.job_type && (
                      <span className="text-[12px] font-semibold" style={{ color: color.border }}>
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

      <BottomNav active="dashboard" />
    </div>
  )
}
