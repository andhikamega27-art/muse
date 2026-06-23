'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Check, Plus, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Komponen di luar agar tidak re-mount tiap render
function Section({ title }: { title: string }) {
  return <p className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-widest pt-2">{title}</p>
}

function Field({
  label, value, onChange, type = 'text', placeholder = '', prefix = '', hint = '', required = false, disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  prefix?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-[#374151] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex items-center rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}>
        {prefix && (
          <span className="pl-4 text-[14px] text-[#9CA3AF] font-semibold flex-shrink-0">{prefix}</span>
        )}
        <input
          type={type}
          className="flex-1 px-4 py-3.5 text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none bg-transparent"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      {hint && <p className="text-[11px] text-[#9CA3AF] mt-1">{hint}</p>}
    </div>
  )
}

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [brandInput, setBrandInput] = useState('')

  const [form, setForm] = useState({
    name: '', username: '', tagline: '', city: '', bio: '',
    phone: '', instagram: '', whatsapp: '', address: '',
    bank_name: '', bank_account: '', bank_holder: '',
    invoice_prefix: 'INV', invoice_footer: '',
    brands: [] as string[],
  })

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setForm({
        name:           data.name ?? '',
        username:       data.username ?? '',
        tagline:        data.tagline ?? '',
        city:           data.city ?? '',
        bio:            data.bio ?? '',
        phone:          data.phone ?? '',
        instagram:      data.instagram ?? '',
        whatsapp:       data.whatsapp ?? '',
        address:        data.address ?? '',
        bank_name:      data.bank_name ?? '',
        bank_account:   data.bank_account ?? '',
        bank_holder:    data.bank_holder ?? '',
        invoice_prefix: data.invoice_prefix ?? 'INV',
        invoice_footer: data.invoice_footer ?? '',
        brands:         data.brands ?? [],
      })
    }
    setLoading(false)
  }

  function set(key: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [key]: value }))
  }

  function addBrand() {
    const b = brandInput.trim()
    if (!b || form.brands.includes(b)) { setBrandInput(''); return }
    setForm(p => ({ ...p, brands: [...p.brands, b] }))
    setBrandInput('')
  }

  function removeBrand(brand: string) {
    setForm(p => ({ ...p, brands: p.brands.filter(b => b !== brand) }))
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nama wajib diisi'); return }
    if (form.username && !/^[a-z0-9_]+$/.test(form.username)) {
      toast.error('Username hanya huruf kecil, angka, dan underscore')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({
      name:           form.name.trim(),
      username:       form.username.trim().toLowerCase() || null,
      tagline:        form.tagline.trim() || null,
      city:           form.city.trim() || null,
      bio:            form.bio.trim() || null,
      phone:          form.phone.trim() || null,
      instagram:      form.instagram.trim().replace('@', '') || null,
      whatsapp:       form.whatsapp.trim() || null,
      address:        form.address.trim() || null,
      bank_name:      form.bank_name.trim() || null,
      bank_account:   form.bank_account.trim() || null,
      bank_holder:    form.bank_holder.trim() || null,
      invoice_prefix: form.invoice_prefix.trim().toUpperCase() || 'INV',
      invoice_footer: form.invoice_footer.trim() || null,
      brands:         form.brands.length > 0 ? form.brands : null,
      updated_at:     new Date().toISOString(),
    }).eq('id', user.id)
    if (error) {
      toast.error(error.message.includes('unique') ? 'Username sudah dipakai' : 'Gagal menyimpan')
      setSaving(false)
      return
    }
    toast.success('Profil disimpan!')
    router.push('/profile')
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F8F8FC' }}>
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

        <Section title="Profil Publik" />

        <Field label="Nama Lengkap" value={form.name} onChange={v => set('name', v)}
          placeholder="Nama kamu" required disabled={loading} />

        {/* Username */}
        <div>
          <label className="block text-[13px] font-bold text-[#374151] mb-1.5">Username</label>
          <div className="flex items-center rounded-2xl overflow-hidden"
            style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}>
            <span className="pl-4 text-[13px] text-[#9CA3AF] font-semibold flex-shrink-0 whitespace-nowrap">
              app-muse.vercel.app/
            </span>
            <input
              className="flex-1 pr-4 py-3.5 text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none bg-transparent min-w-0"
              placeholder="username"
              value={form.username}
              onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              disabled={loading}
            />
          </div>
          {form.username && (
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Link publik: <span className="text-[#7C3AED] font-bold">app-muse.vercel.app/{form.username}</span>
            </p>
          )}
        </div>

        <Field label="Tagline" value={form.tagline} onChange={v => set('tagline', v)}
          placeholder="cth: Fashion Model • Commercial Talent" disabled={loading} />

        <Field label="Kota" value={form.city} onChange={v => set('city', v)}
          placeholder="cth: Surabaya, Indonesia" disabled={loading} />

        {/* Bio */}
        <div>
          <label className="block text-[13px] font-bold text-[#374151] mb-1.5">Bio</label>
          <textarea
            className="w-full px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none resize-none"
            style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}
            placeholder="Ceritakan tentang diri kamu..."
            rows={3}
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Brand Collaborations */}
        <div>
          <label className="block text-[13px] font-bold text-[#374151] mb-1.5">Brand Collaboration</label>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 px-4 py-3 rounded-2xl text-[14px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none"
              style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}
              placeholder="Nama brand, cth: Zara"
              value={brandInput}
              onChange={e => setBrandInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBrand())}
            />
            <button onClick={addBrand}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#EDE9FE' }}>
              <Plus size={18} style={{ color: '#7C3AED' }} />
            </button>
          </div>
          {form.brands.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.brands.map(b => (
                <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                  style={{ background: '#EDE9FE', color: '#5B21B6' }}>
                  {b}
                  <button onClick={() => removeBrand(b)}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Section title="Kontak" />
        <Field label="No. WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)}
          type="tel" placeholder="08xxxxxxxxxx" disabled={loading} />
        <Field label="Instagram" value={form.instagram} onChange={v => set('instagram', v.replace('@', ''))}
          placeholder="username_kamu" prefix="@" disabled={loading} />

        <Section title="Invoice & Pembayaran" />
        <Field label="No. WhatsApp (kontak klien)" value={form.phone} onChange={v => set('phone', v)}
          type="tel" placeholder="08xxxxxxxxxx" disabled={loading} />
        <Field label="Alamat" value={form.address} onChange={v => set('address', v)}
          placeholder="Alamat lengkap" disabled={loading} />
        <Field label="Nama Bank" value={form.bank_name} onChange={v => set('bank_name', v)}
          placeholder="cth: BCA, Mandiri" disabled={loading} />
        <Field label="No. Rekening" value={form.bank_account} onChange={v => set('bank_account', v)}
          placeholder="Nomor rekening" disabled={loading} />
        <Field label="Nama di Rekening" value={form.bank_holder} onChange={v => set('bank_holder', v)}
          placeholder="Pemilik rekening" disabled={loading} />
        <Field label="Prefix Invoice" value={form.invoice_prefix}
          onChange={v => set('invoice_prefix', v.toUpperCase())}
          placeholder="INV" disabled={loading}
          hint={form.invoice_prefix ? `Contoh: ${form.invoice_prefix}-20260624-001` : ''} />
        <Field label="Footer Invoice" value={form.invoice_footer} onChange={v => set('invoice_footer', v)}
          placeholder="cth: Terima kasih!" disabled={loading} />

        <button onClick={handleSave} disabled={saving || loading}
          className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white active:scale-[0.98] transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', boxShadow: '0 4px 14px rgba(91,33,182,0.35)' }}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
