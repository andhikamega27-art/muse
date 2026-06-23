'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/types'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const fields = [
  { key: 'name',         label: 'Nama Lengkap',    type: 'text',  placeholder: 'Nama kamu',           required: true },
  { key: 'phone',        label: 'No. WhatsApp',     type: 'tel',   placeholder: '08xxxxxxxxxx',        required: false },
  { key: 'address',      label: 'Alamat',           type: 'text',  placeholder: 'Alamat lengkap',      required: false },
  { key: 'bank_name',    label: 'Nama Bank',        type: 'text',  placeholder: 'cth: BCA, Mandiri',   required: false },
  { key: 'bank_account', label: 'No. Rekening',     type: 'text',  placeholder: 'Nomor rekening',      required: false },
  { key: 'bank_holder',  label: 'Nama di Rekening', type: 'text',  placeholder: 'Pemilik rekening',    required: false },
  { key: 'invoice_prefix', label: 'Prefix Invoice', type: 'text',  placeholder: 'INV',                 required: false },
  { key: 'invoice_footer', label: 'Footer Invoice', type: 'text',  placeholder: 'cth: Terima kasih!', required: false },
] as const

type FormKey = typeof fields[number]['key']

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState<Record<FormKey, string>>({
    name: '', phone: '', address: '', bank_name: '',
    bank_account: '', bank_holder: '', invoice_prefix: 'INV', invoice_footer: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        bank_name: data.bank_name ?? '',
        bank_account: data.bank_account ?? '',
        bank_holder: data.bank_holder ?? '',
        invoice_prefix: data.invoice_prefix ?? 'INV',
        invoice_footer: data.invoice_footer ?? '',
      })
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      bank_name: form.bank_name.trim() || null,
      bank_account: form.bank_account.trim() || null,
      bank_holder: form.bank_holder.trim() || null,
      invoice_prefix: form.invoice_prefix.trim().toUpperCase() || 'INV',
      invoice_footer: form.invoice_footer.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    if (error) { toast.error('Gagal menyimpan'); setSaving(false); return }
    toast.success('Profil disimpan!')
    router.push('/profile')
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F8F8FC' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <Link href="/profile" className="w-9 h-9 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#374151]" />
        </Link>
        <h1 className="font-extrabold text-[17px] text-[#111827]">Edit Profil</h1>
        <button onClick={handleSave} disabled={saving}
          className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: saving ? '#E5E7EB' : '#5B21B6' }}>
          {saving
            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Check size={17} className="text-white" />}
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {fields.map(({ key, label, type, placeholder, required }) => (
          <div key={key}>
            <label className="block text-[13px] font-bold text-[#374151] mb-2">
              {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type={type}
              className="w-full px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
              style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setForm(p => ({
                ...p,
                [key]: key === 'invoice_prefix' ? e.target.value.toUpperCase() : e.target.value,
              }))}
              disabled={loading}
            />
            {key === 'invoice_prefix' && form.invoice_prefix && (
              <p className="text-[12px] text-[#9CA3AF] mt-1.5 font-medium">
                Contoh: <span className="text-[#5B21B6] font-bold">{form.invoice_prefix}-20260624-001</span>
              </p>
            )}
          </div>
        ))}

        <button onClick={handleSave} disabled={saving || loading}
          className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white active:scale-[0.98] transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', boxShadow: '0 4px 14px rgba(91,33,182,0.35)' }}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
