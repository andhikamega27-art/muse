'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Schedule } from '@/types'
import { getScheduleStatusColor, getScheduleStatusLabel, formatDate } from '@/lib/utils'
import { ArrowLeft, Calendar, Clock, MapPin, User, Briefcase, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const STATUS_OPTIONS = [
  { value: 'tentative', label: 'Tentatif' },
  { value: 'confirmed', label: 'Terkonfirmasi' },
  { value: 'done', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
] as const

export default function ScheduleDetailPage() {
  const { id: scheduleId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadSchedule()
  }, [scheduleId])

  async function loadSchedule() {
    const { data } = await supabase
      .from('schedules')
      .select('*, client:clients(id, name, phone, company)')
      .eq('id', scheduleId)
      .single()
    setSchedule(data as Schedule)
    setLoading(false)
  }

  async function updateStatus(status: string) {
    setActionLoading(true)
    const { error } = await supabase.from('schedules').update({ status }).eq('id', scheduleId)
    if (error) {
      toast.error('Gagal mengubah status')
    } else {
      toast.success(`Status diubah ke ${getScheduleStatusLabel(status)}`)
      loadSchedule()
    }
    setActionLoading(false)
  }

  async function deleteSchedule() {
    if (!confirm('Hapus jadwal ini?')) return
    setActionLoading(true)
    const { error } = await supabase.from('schedules').delete().eq('id', scheduleId)
    if (error) {
      toast.error('Gagal menghapus jadwal')
      setActionLoading(false)
    } else {
      toast.success('Jadwal dihapus')
      router.push('/schedules')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Calendar size={40} className="text-gray-200" />
        <p className="text-gray-400">Jadwal tidak ditemukan</p>
        <Link href="/schedules" className="btn-primary text-sm">Kembali</Link>
      </div>
    )
  }

  const client = schedule.client as any

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="page-header">
        <Link href="/schedules" className="p-1 -ml-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-bold truncate flex-1 mx-2">Detail Jadwal</h1>
        <button onClick={deleteSchedule} disabled={actionLoading} className="p-1 text-red-400">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Info utama */}
        <div className="card space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold flex-1">{schedule.title}</h2>
            <span className={`badge flex-shrink-0 ${getScheduleStatusColor(schedule.status)}`}>
              {getScheduleStatusLabel(schedule.status)}
            </span>
          </div>

          <div className="space-y-2 pt-1 border-t border-gray-50">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={15} className="text-gray-400 flex-shrink-0" />
              <span>{format(new Date(schedule.schedule_date + 'T00:00:00'), 'EEEE, d MMMM yyyy', { locale: id })}</span>
            </div>

            {(schedule.start_time || schedule.end_time) && (
              <div className="flex items-center gap-3 text-sm">
                <Clock size={15} className="text-gray-400 flex-shrink-0" />
                <span>
                  {schedule.start_time?.slice(0, 5) ?? '?'}
                  {schedule.end_time && ` – ${schedule.end_time.slice(0, 5)}`}
                </span>
              </div>
            )}

            {schedule.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                <span>{schedule.location}</span>
              </div>
            )}

            {schedule.job_type && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase size={15} className="text-gray-400 flex-shrink-0" />
                <span>{schedule.job_type}</span>
              </div>
            )}

            {client && (
              <div className="flex items-center gap-3 text-sm">
                <User size={15} className="text-gray-400 flex-shrink-0" />
                <div>
                  <span className="font-medium">{client.name}</span>
                  {client.company && <span className="text-gray-400"> · {client.company}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Catatan */}
        {schedule.notes && (
          <div className="card">
            <h2 className="font-semibold text-sm mb-1">Catatan</h2>
            <p className="text-sm text-gray-500">{schedule.notes}</p>
          </div>
        )}

        {/* Ubah Status */}
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Ubah Status</h2>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateStatus(opt.value)}
                disabled={actionLoading || schedule.status === opt.value}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  schedule.status === opt.value
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buat Invoice dari booking ini */}
        {schedule.status !== 'cancelled' && (
          <Link
            href={`/invoices/new?schedule_id=${scheduleId}`}
            className="card flex items-center gap-3 active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)' }}
          >
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-violet-700">Buat Invoice dari Booking Ini</p>
              <p className="text-xs text-violet-400 mt-0.5">Klien & jenis pekerjaan akan otomatis terisi</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
