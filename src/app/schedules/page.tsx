'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getScheduleStatusColor, getScheduleStatusLabel } from '@/lib/utils'
import { Schedule } from '@/types'
import { Plus, Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const STATUSES = ['all', 'tentative', 'confirmed', 'done', 'cancelled'] as const
const STATUS_LABEL: Record<string, string> = {
  all: 'Semua', tentative: 'Tentatif', confirmed: 'Konfirmasi', done: 'Selesai', cancelled: 'Batal',
}

export default function SchedulesPage() {
  const supabase = createClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSchedules() }, [])

  async function loadSchedules() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('schedules')
      .select('*, client:clients(name)')
      .eq('user_id', user.id)
      .order('schedule_date', { ascending: false })
    setSchedules((data as Schedule[]) ?? [])
    setLoading(false)
  }

  const filtered = filterStatus === 'all' ? schedules : schedules.filter(s => s.status === filterStatus)

  const grouped = filtered.reduce<Record<string, Schedule[]>>((acc, s) => {
    if (!acc[s.schedule_date]) acc[s.schedule_date] = []
    acc[s.schedule_date].push(s)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F2F2F7' }}>
      <div className="page-header">
        <h1 className="text-[18px] font-bold tracking-tight text-[#1C1C1E]">Jadwal</h1>
        <Link href="/schedules/new" className="btn-primary py-2 px-4 text-[13px] rounded-xl">
          <Plus size={15} /> Tambah
        </Link>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${
                filterStatus === s ? 'text-white' : 'text-[#636366]'
              }`}
              style={filterStatus === s
                ? { background: 'linear-gradient(135deg, #5B21B6, #8B5CF6)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }
                : { background: '#FFFFFF' }
              }
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-[72px]">
                <div className="skeleton h-4 w-1/2 mb-2.5" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' }}>
              <Calendar size={28} style={{ color: '#2563EB' }} />
            </div>
            <p className="font-bold text-[16px] text-[#1C1C1E]">Belum ada jadwal</p>
            <p className="text-[13px] text-[#AEAEB2] mt-1 mb-4">Tambahkan jadwal pekerjaan kamu</p>
            <Link href="/schedules/new" className="btn-primary text-sm mx-auto">Tambah Jadwal</Link>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <p className="text-[12px] font-bold text-[#AEAEB2] uppercase tracking-widest mb-2 px-1">
                {format(new Date(date + 'T00:00:00'), 'EEEE, d MMMM', { locale: id })}
              </p>
              <div className="space-y-2.5">
                {grouped[date].map(s => (
                  <Link key={s.id} href={`/schedules/${s.id}`}
                    className="card flex items-start gap-3 active:scale-[0.98] transition-all">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)' }}>
                      <Calendar size={17} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[14px] text-[#1C1C1E] truncate">{s.title}</p>
                        <span className={`badge text-[10px] flex-shrink-0 ${getScheduleStatusColor(s.status)}`}>
                          {getScheduleStatusLabel(s.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.start_time && (
                          <span className="flex items-center gap-1 text-[12px] text-[#AEAEB2] font-medium">
                            <Clock size={11} />{s.start_time.slice(0, 5)}{s.end_time && `–${s.end_time.slice(0, 5)}`}
                          </span>
                        )}
                        {s.location && (
                          <span className="flex items-center gap-1 text-[12px] text-[#AEAEB2] truncate">
                            <MapPin size={11} />{s.location}
                          </span>
                        )}
                        {(s.client as any)?.name && (
                          <span className="text-[12px] text-[#AEAEB2] truncate">{(s.client as any).name}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav active="schedules" />
    </div>
  )
}
