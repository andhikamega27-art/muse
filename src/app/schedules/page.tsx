'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { getScheduleStatusColor, getScheduleStatusLabel } from '@/lib/utils'
import { Schedule } from '@/types'
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import { format, addDays, startOfWeek, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns'
import { id } from 'date-fns/locale'

const EVENT_COLORS = [
  { bg: '#FEF9C3', border: '#EAB308', text: '#713F12' },
  { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A' },
  { bg: '#DCFCE7', border: '#22C55E', text: '#14532D' },
  { bg: '#FCE7F3', border: '#EC4899', text: '#831843' },
  { bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95' },
  { bg: '#FEE2E2', border: '#EF4444', text: '#7F1D1D' },
]

function getEventColor(index: number) {
  return EVENT_COLORS[index % EVENT_COLORS.length]
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7AM – 8PM

export default function SchedulesPage() {
  const supabase = createClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const stripRef = useRef<HTMLDivElement>(null)
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

  // Schedules with time for timeline, without time for all-day section
  const timedSchedules = daySchedules.filter(s => s.start_time)
  const allDaySchedules = daySchedules.filter(s => !s.start_time)

  function toMinutes(time: string) {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  function timelineTop(time: string) {
    const mins = toMinutes(time) - 7 * 60 // offset from 7AM
    return Math.max(0, (mins / 60) * 64)
  }

  function timelineHeight(start: string, end?: string | null) {
    if (!end) return 56
    const diff = toMinutes(end) - toMinutes(start)
    return Math.max(40, (diff / 60) * 64)
  }

  return (
    <div className="min-h-screen flex flex-col pb-28" style={{ background: '#F3F4F8' }}>

      {/* ── Header ── */}
      <div className="bg-white px-4 pt-14 pb-0" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-extrabold text-[#111827] tracking-tight">
              {format(selectedDate, 'MMMM yyyy', { locale: id })}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setWeekStart(subWeeks(weekStart, 1)); setSelectedDate(subWeeks(selectedDate, 1)) }}
              className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center active:scale-90"
            >
              <ChevronLeft size={16} className="text-[#374151]" />
            </button>
            <button
              onClick={() => { setWeekStart(addWeeks(weekStart, 1)); setSelectedDate(addWeeks(selectedDate, 1)) }}
              className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center active:scale-90"
            >
              <ChevronRight size={16} className="text-[#374151]" />
            </button>
            <Link href="/schedules/new"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-[13px] font-bold"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
              <Plus size={14} /> Tambah
            </Link>
          </div>
        </div>

        {/* ── Week Strip ── */}
        <div ref={stripRef} className="flex gap-1 pb-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, today)
            const hasEvent = schedules.some(s => isSameDay(parseISO(s.schedule_date + 'T00:00:00'), day))
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-[13.5%] py-2 rounded-2xl transition-all active:scale-90"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #5B21B6, #7C3AED)'
                    : 'transparent',
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}>
                  {format(day, 'EEE', { locale: id }).slice(0, 3)}
                </span>
                <span className="text-[16px] font-extrabold"
                  style={{ color: isSelected ? '#fff' : isToday ? '#7C3AED' : '#111827' }}>
                  {format(day, 'd')}
                </span>
                {/* dot indicator */}
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: hasEvent
                      ? isSelected ? 'rgba(255,255,255,0.6)' : '#7C3AED'
                      : 'transparent'
                  }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-white animate-pulse" />)}
          </div>
        ) : daySchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-3xl mb-4 flex items-center justify-center"
              style={{ background: '#EDE9FE' }}>
              <span className="text-2xl">📅</span>
            </div>
            <p className="font-bold text-[16px] text-[#111827]">Tidak ada jadwal</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1 mb-5">
              {format(selectedDate, 'EEEE, d MMMM', { locale: id })}
            </p>
            <Link href="/schedules/new"
              className="px-5 py-2.5 rounded-2xl text-white text-[13px] font-bold"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
              + Tambah Jadwal
            </Link>
          </div>
        ) : (
          <div className="p-4">
            {/* All-day events */}
            {allDaySchedules.length > 0 && (
              <div className="mb-4 space-y-2">
                {allDaySchedules.map((s, i) => {
                  const color = getEventColor(i)
                  return (
                    <Link key={s.id} href={`/schedules/${s.id}`}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 active:scale-[0.98] transition-all"
                      style={{ background: color.bg, borderLeft: `3px solid ${color.border}` }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[14px] truncate" style={{ color: color.text }}>{s.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {(s.client as any)?.name && (
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: color.border }}>
                              <User size={10} />{(s.client as any).name}
                            </span>
                          )}
                          {s.location && (
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: color.border }}>
                              <MapPin size={10} />{s.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: color.border, color: '#fff' }}>
                        {getScheduleStatusLabel(s.status)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Timeline */}
            {timedSchedules.length > 0 && (
              <div className="relative">
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div key={h} className="flex items-start" style={{ height: 64 }}>
                    <span className="text-[11px] font-semibold text-[#9CA3AF] w-10 flex-shrink-0 -mt-2">
                      {h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                    </span>
                    <div className="flex-1 border-t border-[#F3F4F6] mt-0" style={{ height: 64 }} />
                  </div>
                ))}

                {/* Events overlay */}
                <div className="absolute top-0 left-10 right-0 bottom-0 pointer-events-none">
                  {timedSchedules.map((s, i) => {
                    const color = getEventColor(i + allDaySchedules.length)
                    const top = timelineTop(s.start_time!)
                    const height = timelineHeight(s.start_time!, s.end_time)
                    return (
                      <Link
                        key={s.id}
                        href={`/schedules/${s.id}`}
                        className="absolute left-1 right-0 rounded-xl px-3 py-2 pointer-events-auto active:scale-[0.98] transition-all overflow-hidden"
                        style={{
                          top,
                          height,
                          background: color.bg,
                          borderLeft: `3px solid ${color.border}`,
                        }}
                      >
                        <p className="font-bold text-[13px] leading-tight truncate" style={{ color: color.text }}>
                          {s.title}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: color.border }}>
                          {s.start_time!.slice(0, 5)}{s.end_time ? ` – ${s.end_time.slice(0, 5)}` : ''}
                        </p>
                        {(s.client as any)?.name && height > 48 && (
                          <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: color.border }}>
                            <User size={9} />{(s.client as any).name}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav active="invoices" />
    </div>
  )
}
