'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Client, ScheduleFormData } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const JOB_TYPES = ['Foto Produk', 'Foto Editorial', 'Foto Fashion', 'Video Iklan', 'Lookbook', 'Brand Ambassador', 'Event', 'Lainnya']

export default function NewSchedulePage() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ScheduleFormData>({
    title: '',
    client_id: '',
    schedule_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    location: '',
    job_type: '',
    status: 'tentative',
    notes: '',
  })

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('clients').select('id, name').eq('user_id', user.id).order('name')
    setClients(data ?? [])
  }

  function setField<K extends keyof ScheduleFormData>(key: K, value: ScheduleFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.schedule_date) {
      toast.error('Judul dan tanggal wajib diisi')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      ...form,
      user_id: user.id,
      client_id: form.client_id || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      location: form.location || null,
      job_type: form.job_type || null,
      notes: form.notes || null,
    }

    const { error } = await supabase.from('schedules').insert(payload)
    if (error) {
      toast.error('Gagal menyimpan jadwal')
      setLoading(false)
      return
    }
    toast.success('Jadwal berhasil ditambahkan')
    router.push('/schedules')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="page-header">
        <Link href="/schedules" className="p-1 -ml-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Jadwal Baru</h1>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div className="card space-y-4">
          <div>
            <label className="label">Judul Pekerjaan *</label>
            <input
              className="input"
              placeholder="Contoh: Foto Produk Skincare"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Klien</label>
            <select className="input" value={form.client_id} onChange={e => setField('client_id', e.target.value)}>
              <option value="">Pilih klien (opsional)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Jenis Pekerjaan</label>
            <select className="input" value={form.job_type ?? ''} onChange={e => setField('job_type', e.target.value)}>
              <option value="">Pilih jenis</option>
              {JOB_TYPES.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Tanggal *</label>
            <input
              type="date"
              className="input"
              value={form.schedule_date}
              onChange={e => setField('schedule_date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Mulai</label>
              <input
                type="time"
                className="input"
                value={form.start_time ?? ''}
                onChange={e => setField('start_time', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Selesai</label>
              <input
                type="time"
                className="input"
                value={form.end_time ?? ''}
                onChange={e => setField('end_time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Lokasi</label>
            <input
              className="input"
              placeholder="Alamat atau nama studio"
              value={form.location ?? ''}
              onChange={e => setField('location', e.target.value)}
            />
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(['tentative', 'confirmed'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setField('status', s)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.status === s
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {s === 'tentative' ? 'Tentatif' : 'Terkonfirmasi'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Catatan</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Catatan tambahan..."
              value={form.notes ?? ''}
              onChange={e => setField('notes', e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
        </button>
      </form>
    </div>
  )
}
