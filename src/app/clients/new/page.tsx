'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ClientFormData } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ClientFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  function setField<K extends keyof ClientFormData>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nama klien wajib diisi'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('clients').insert({
      user_id: user.id,
      name: form.name.trim(),
      company: form.company?.trim() || null,
      email: form.email?.trim() || null,
      phone: form.phone?.trim() || null,
      address: form.address?.trim() || null,
      notes: form.notes?.trim() || null,
    })

    if (error) {
      toast.error('Gagal menyimpan klien')
      setLoading(false)
      return
    }

    toast.success('Klien berhasil ditambahkan')
    router.push('/clients')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="page-header">
        <Link href="/clients" className="p-1 -ml-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Klien Baru</h1>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div className="card space-y-4">
          <div>
            <label className="label">Nama *</label>
            <input
              className="input"
              placeholder="Nama klien"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Perusahaan / Brand</label>
            <input
              className="input"
              placeholder="Nama perusahaan (opsional)"
              value={form.company ?? ''}
              onChange={e => setField('company', e.target.value)}
            />
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">No. WhatsApp / Telepon</label>
            <input
              className="input"
              placeholder="08xxxxxxxxxx"
              type="tel"
              value={form.phone ?? ''}
              onChange={e => setField('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              placeholder="email@klien.com"
              type="email"
              value={form.email ?? ''}
              onChange={e => setField('email', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Alamat</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Alamat klien (opsional)"
              value={form.address ?? ''}
              onChange={e => setField('address', e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <label className="label">Catatan</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Catatan internal tentang klien ini..."
            value={form.notes ?? ''}
            onChange={e => setField('notes', e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Menyimpan...' : 'Simpan Klien'}
        </button>
      </form>
    </div>
  )
}
