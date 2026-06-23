'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { InvoiceTemplate } from '@/types'
import { ArrowLeft, Check, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type TemplateConfig = { id: InvoiceTemplate; name: string; desc: string; preview: React.FC; accent: string }

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'profesional',
    name: 'Profesional',
    desc: 'Header ungu, tabel formal, cocok untuk semua jenis klien',
    accent: '#5B21B6',
    preview: () => (
      <svg viewBox="0 0 160 210" className="w-full h-full">
        {/* Header with logo */}
        <rect x="10" y="12" width="30" height="30" rx="6" fill="#5B21B6" />
        <text x="25" y="33" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">M</text>
        <text x="46" y="24" fill="#1F2937" fontSize="9" fontWeight="bold">MUSE</text>
        <text x="46" y="33" fill="#9CA3AF" fontSize="5.5">Manage Your Business.</text>
        <text x="150" y="24" textAnchor="end" fill="#5B21B6" fontSize="18" fontWeight="bold">INVOICE</text>
        <rect x="105" y="28" width="30" height="10" rx="3" fill="#F3F4F6" />
        <text x="120" y="36" textAnchor="middle" fill="#374151" fontSize="5" fontWeight="bold">INV-001</text>
        <rect x="138" y="28" width="14" height="10" rx="3" fill="#5B21B6" />
        <text x="145" y="36" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="bold">LUNAS</text>
        {/* Divider */}
        <line x1="8" y1="52" x2="152" y2="52" stroke="#E5E7EB" strokeWidth="0.8" />
        {/* Seller + dates */}
        <text x="10" y="62" fill="#5B21B6" fontSize="7" fontWeight="bold">Muse Studio</text>
        <rect x="10" y="65" width="50" height="2.5" rx="1.2" fill="#E5E7EB" />
        <rect x="10" y="70" width="40" height="2.5" rx="1.2" fill="#D1D5DB" />
        <rect x="85" y="58" width="67" height="7" rx="1.5" fill="#F9FAFB" />
        <rect x="85" y="67" width="67" height="7" rx="1.5" fill="#F9FAFB" />
        <rect x="85" y="76" width="67" height="7" rx="1.5" fill="#F9FAFB" />
        {/* 2 info boxes */}
        <rect x="8" y="86" width="68" height="26" rx="4" fill="#F9FAFB" />
        <text x="13" y="94" fill="#5B21B6" fontSize="4.5" fontWeight="bold">DITAGIHKAN KEPADA</text>
        <rect x="13" y="97" width="40" height="2.5" rx="1.2" fill="#D1D5DB" />
        <rect x="13" y="102" width="55" height="2" rx="1" fill="#E5E7EB" />
        <rect x="13" y="106" width="45" height="2" rx="1" fill="#E5E7EB" />
        <rect x="80" y="86" width="72" height="26" rx="4" fill="#F9FAFB" />
        <text x="85" y="94" fill="#5B21B6" fontSize="4.5" fontWeight="bold">CATATAN</text>
        <rect x="85" y="97" width="60" height="2" rx="1" fill="#E5E7EB" />
        <rect x="85" y="102" width="50" height="2" rx="1" fill="#E5E7EB" />
        <rect x="85" y="107" width="55" height="2" rx="1" fill="#E5E7EB" />
        {/* Table header */}
        <rect x="8" y="118" width="144" height="12" rx="4" fill="#5B21B6" />
        <text x="13" y="127" fill="white" fontSize="4.5" fontWeight="bold">NO  ITEM</text>
        <text x="70" y="127" fill="white" fontSize="4.5" fontWeight="bold">DESKRIPSI</text>
        <text x="120" y="127" fill="white" fontSize="4.5" fontWeight="bold">QTY</text>
        <text x="150" y="127" textAnchor="end" fill="white" fontSize="4.5" fontWeight="bold">TOTAL</text>
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <rect x="8" y={132 + i * 11} width="144" height="10" fill={i % 2 ? '#FAFAFA' : 'white'} />
            <text x="13" y={139 + i * 11} fill="#9CA3AF" fontSize="4">{i+1}</text>
            <rect x="22" y={135 + i * 11} width="40" height="2.5" rx="1.2" fill="#D1D5DB" />
            <rect x="70" y={135 + i * 11} width="35" height="2.5" rx="1.2" fill="#E5E7EB" />
            <rect x="118" y={135 + i * 11} width="8" height="2.5" rx="1.2" fill="#E5E7EB" />
            <rect x="130" y={135 + i * 11} width="20" height="2.5" rx="1.2" fill="#DDD6FE" />
          </g>
        ))}
        {/* TOTAL */}
        <text x="80" y="194" fill="#5B21B6" fontSize="8" fontWeight="bold">TOTAL</text>
        <text x="152" y="194" textAnchor="end" fill="#5B21B6" fontSize="9" fontWeight="bold">Rp 6.993.000</text>
        {/* QR footer */}
        <rect x="130" y="198" width="22" height="22" rx="2" fill="#F3F4F6" />
        <text x="141" y="212" textAnchor="middle" fill="#9CA3AF" fontSize="4">QR</text>
      </svg>
    ),
  },
  {
    id: 'feminin',
    name: 'Feminin',
    desc: 'Pink elegan, cocok untuk beauty & makeup artist',
    accent: '#C2185B',
    preview: () => (
      <svg viewBox="0 0 160 210" className="w-full h-full">
        <rect width="160" height="210" fill="#FDF0F5" />
        {/* Header */}
        <text x="12" y="22" fill="#C2185B" fontSize="8" fontWeight="bold">INVOICE</text>
        <text x="148" y="22" textAnchor="end" fill="#1F2937" fontSize="9" fontWeight="bold">NO. 001</text>
        {/* Title */}
        <text x="80" y="42" textAnchor="middle" fill="#C2185B" fontSize="14" fontWeight="bold">Muse Studio</text>
        <text x="60" y="51" fill="#1F2937" fontSize="5" fontWeight="bold" letterSpacing="2">✦  WITH MUSE  ✦</text>
        <text x="80" y="61" textAnchor="middle" fill="#9CA3AF" fontSize="5.5">DATE: 24 Juni 2026</text>
        {/* Dotted divider */}
        <line x1="8" y1="68" x2="152" y2="68" stroke="#C2185B" strokeWidth="1.2" strokeDasharray="3 2" />
        {/* Bill to + thank you */}
        <text x="10" y="77" fill="#C2185B" fontSize="5.5" fontWeight="bold">BILL TO:</text>
        <text x="10" y="85" fill="#1F2937" fontSize="8" fontWeight="bold">Sarah Monica</text>
        <rect x="10" y="88" width="55" height="2.5" rx="1.2" fill="#FBBCCC" />
        <rect x="10" y="93" width="45" height="2.5" rx="1.2" fill="#FBBCCC" />
        {/* Thank you box */}
        <rect x="82" y="72" width="70" height="28" rx="5" fill="#FCE4EC" />
        <text x="90" y="82" fill="#C2185B" fontSize="7" fontWeight="bold">Thank You! ♥</text>
        <rect x="88" y="85" width="56" height="2" rx="1" fill="#F48FB1" />
        <rect x="88" y="90" width="48" height="2" rx="1" fill="#F48FB1" />
        {/* Dotted divider */}
        <line x1="8" y1="106" x2="152" y2="106" stroke="#C2185B" strokeWidth="1.2" strokeDasharray="3 2" />
        {/* Table */}
        <text x="10" y="115" fill="#C2185B" fontSize="5.5" fontWeight="bold">SERVICE / ITEM</text>
        <text x="104" y="115" textAnchor="end" fill="#C2185B" fontSize="5.5" fontWeight="bold">QTY</text>
        <text x="130" y="115" textAnchor="end" fill="#C2185B" fontSize="5.5" fontWeight="bold">PRICE</text>
        <text x="152" y="115" textAnchor="end" fill="#C2185B" fontSize="5.5" fontWeight="bold">TOTAL</text>
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <line x1="8" y1={118 + i * 12} x2="152" y2={118 + i * 12} stroke="#F8BBD0" strokeWidth="0.8" strokeDasharray="2 2" />
            <rect x="10" y={120 + i * 12} width="55" height="3" rx="1.5" fill="#FBBCCC" />
            <text x="104" y={124 + i * 12} textAnchor="end" fill="#555" fontSize="5">1</text>
            <rect x="112" y={120 + i * 12} width="20" height="3" rx="1.5" fill="#FBBCCC" />
            <text x="152" y={124 + i * 12} textAnchor="end" fill="#C2185B" fontSize="5" fontWeight="bold">Rp xxx</text>
          </g>
        ))}
        {/* Bottom */}
        <line x1="8" y1="180" x2="152" y2="180" stroke="#C2185B" strokeWidth="1.2" strokeDasharray="3 2" />
        <text x="10" y="190" fill="#C2185B" fontSize="8" fontWeight="bold">TOTAL</text>
        <text x="80" y="190" fill="#C2185B" fontSize="9" fontWeight="bold">Rp 6.993.000</text>
        {/* QR */}
        <rect x="128" y="198" width="22" height="22" rx="2" fill="#FCE4EC" />
        <text x="139" y="212" textAnchor="middle" fill="#C2185B" fontSize="4">QR</text>
        <text x="10" y="210" fill="#C2185B" fontSize="7" fontWeight="bold">Thank You! ♥</text>
      </svg>
    ),
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Clean & minimalis, avatar klien, cocok untuk semua industri',
    accent: '#4C1D95',
    preview: () => (
      <svg viewBox="0 0 160 210" className="w-full h-full">
        <rect width="160" height="210" fill="#FAFAFA" />
        <rect width="160" height="66" fill="white" />
        {/* Logo */}
        <rect x="10" y="14" width="30" height="30" rx="8" fill="#5B21B6" />
        <text x="25" y="34" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">m</text>
        <text x="45" y="26" fill="#1F2937" fontSize="12" fontWeight="bold">muse</text>
        <text x="45" y="35" fill="#9CA3AF" fontSize="5.5">for your every muse.</text>
        {/* INVOICE + pill */}
        <text x="112" y="24" fill="#1F2937" fontSize="14" fontWeight="bold">INVOICE</text>
        <text x="135" y="24" fill="#5B21B6" fontSize="10">✦</text>
        <rect x="107" y="30" width="45" height="12" rx="6" fill="#5B21B6" />
        <text x="129" y="39" textAnchor="middle" fill="white" fontSize="5.5" fontWeight="bold">INV-2026-001</text>
        {/* Bill to section */}
        <rect width="160" height="50" y="66" fill="white" />
        <rect x="10" y="72" width="3" height="12" rx="1.5" fill="#5B21B6" />
        <text x="17" y="81" fill="#374151" fontSize="6" fontWeight="bold">BILL TO</text>
        {/* Avatar */}
        <circle cx="23" cy="101" r="14" fill="#EDE9FE" />
        <text x="23" y="105" textAnchor="middle" fill="#5B21B6" fontSize="9" fontWeight="bold">SM</text>
        <text x="42" y="97" fill="#1F2937" fontSize="9" fontWeight="bold">Sarah Monica</text>
        <rect x="42" y="100" width="45" height="2.5" rx="1.2" fill="#E5E7EB" />
        <rect x="42" y="105" width="55" height="2" rx="1" fill="#E5E7EB" />
        {/* Info box right */}
        <rect x="86" y="68" width="66" height="44" rx="5" fill="#F9FAFB" />
        {['Invoice Date','Due Date','Payment','Currency'].map((label, i) => (
          <g key={label}>
            <rect x="90" y={74 + i * 10} width="25" height="2.5" rx="1.2" fill="#E5E7EB" />
            <rect x="120" y={74 + i * 10} width="28" height="2.5" rx="1.2" fill="#D1D5DB" />
          </g>
        ))}
        {/* Table */}
        <rect x="8" y="120" width="144" height="54" rx="5" fill="white" />
        <rect x="8" y="120" width="144" height="12" rx="5" fill="#F9FAFB" />
        {['NO.','DESCRIPTION','QTY','UNIT PRICE','AMOUNT'].map((label, i) => (
          <text key={label} x={[13, 30, 106, 118, 148][i]} y={129} textAnchor={i === 4 ? 'end' : 'start'} fill="#374151" fontSize="4.5" fontWeight="bold">{label}</text>
        ))}
        {[0,1,2,3].map(i => (
          <g key={i}>
            <text x="13" y={140 + i * 11} fill="#9CA3AF" fontSize="4.5">{i+1}</text>
            <rect x="28" y={136 + i * 11} width="60" height="3" rx="1.5" fill="#E5E7EB" />
            <rect x="104" y={136 + i * 11} width="8" height="3" rx="1.5" fill="#E5E7EB" />
            <rect x="115" y={136 + i * 11} width="22" height="3" rx="1.5" fill="#E5E7EB" />
            <rect x="130" y={136 + i * 11} width="20" height="3" rx="1.5" fill="#DDD6FE" />
          </g>
        ))}
        {/* Thank you + Total */}
        <rect x="8" y="178" width="60" height="22" rx="4" fill="white" />
        <rect x="8" y="178" width="4" height="22" rx="2" fill="#5B21B6" />
        <text x="17" y="187" fill="#5B21B6" fontSize="4.5" fontWeight="bold">THANK YOU!</text>
        <rect x="17" y="190" width="45" height="2" rx="1" fill="#E5E7EB" />
        <text x="78" y="188" fill="#374151" fontSize="6" fontWeight="bold">TOTAL</text>
        <text x="153" y="188" textAnchor="end" fill="#5B21B6" fontSize="9" fontWeight="bold">Rp 6.993.000</text>
        {/* Footer */}
        <rect width="160" height="24" y="186" fill="white" />
        <rect x="10" y="190" width="22" height="22" rx="5" fill="#5B21B6" />
        <text x="21" y="205" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">m</text>
        <rect x="130" y="190" width="22" height="22" rx="2" fill="#F3F4F6" />
        <text x="141" y="204" textAnchor="middle" fill="#9CA3AF" fontSize="4">QR</text>
      </svg>
    ),
  },
]

export default function InvoiceTemplatePage() {
  const supabase = createClient()
  const router = useRouter()
  const [selected, setSelected] = useState<InvoiceTemplate>('modern')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewId, setPreviewId] = useState<InvoiceTemplate | null>(null)

  useEffect(() => { loadCurrent() }, [])

  async function loadCurrent() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('invoice_template').eq('id', user.id).single()
    if (data?.invoice_template) setSelected(data.invoice_template as InvoiceTemplate)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({
      invoice_template: selected,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    if (error) { toast.error('Gagal menyimpan'); setSaving(false); return }
    toast.success(`Template "${TEMPLATES.find(t => t.id === selected)?.name}" disimpan!`)
    router.push('/profile')
  }

  const selectedConfig = TEMPLATES.find(t => t.id === selected)

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F8F8FC' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <Link href="/profile" className="w-9 h-9 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#374151]" />
        </Link>
        <h1 className="font-extrabold text-[17px] text-[#111827]">Template Invoice</h1>
        <button onClick={handleSave} disabled={saving || loading}
          className="w-9 h-9 rounded-2xl flex items-center justify-center disabled:opacity-50"
          style={{ background: '#5B21B6' }}>
          {saving
            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Check size={17} className="text-white" />}
        </button>
      </div>

      <div className="px-4 pt-5 space-y-4">
        <p className="text-[13px] text-[#6B7280] font-medium px-1">
          Pilih tampilan PDF invoice. Setiap template sudah dilengkapi <strong>QR code</strong> yang saat discan mengarah ke halaman invoice.
        </p>

        {/* Template cards */}
        <div className="space-y-3">
          {TEMPLATES.map(({ id, name, desc, preview: Preview, accent }) => {
            const isSelected = selected === id
            return (
              <div
                key={id}
                className="card overflow-hidden active:scale-[0.99] transition-all cursor-pointer"
                style={{
                  border: isSelected ? `2.5px solid ${accent}` : '2px solid #E5E7EB',
                  boxShadow: isSelected ? `0 4px 20px ${accent}30` : undefined,
                  padding: 0,
                }}
                onClick={() => setSelected(id)}
              >
                <div className="flex items-stretch">
                  {/* Preview mini */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center bg-white p-3 relative"
                    style={{ width: 130, borderRight: '1px solid #F3F4F6' }}
                  >
                    <Preview />
                    {/* Eye button */}
                    <button
                      onClick={e => { e.stopPropagation(); setPreviewId(id) }}
                      className="absolute bottom-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: `${accent}cc` }}
                    >
                      <ExternalLink size={11} className="text-white" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-extrabold text-[16px]" style={{ color: isSelected ? accent : '#111827' }}>{name}</p>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: accent }}>
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-[12px] text-[#6B7280] font-medium leading-relaxed">{desc}</p>
                    </div>
                    <a
                      href={`/api/pdf/sample?template=${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold mt-3"
                      style={{ color: accent }}
                    >
                      <ExternalLink size={13} /> Lihat PDF Sample
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Simpan */}
        <button onClick={handleSave} disabled={saving || loading}
          className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white active:scale-[0.98] transition-all disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${selectedConfig?.accent ?? '#4C1D95'}, #7C3AED)`,
            boxShadow: '0 4px 16px rgba(91,33,182,0.35)',
          }}>
          {saving ? 'Menyimpan...' : `Gunakan Template ${selectedConfig?.name}`}
        </button>
      </div>

      {/* Modal Preview Besar */}
      {previewId && (() => {
        const tpl = TEMPLATES.find(t => t.id === previewId)!
        const Preview = tpl.preview
        return (
          <div className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(0,0,0,0.9)' }}
            onClick={() => setPreviewId(null)}>
            <div className="flex items-center justify-between px-5 pt-14 pb-4" onClick={e => e.stopPropagation()}>
              <div>
                <p className="font-extrabold text-[18px] text-white">{tpl.name}</p>
                <p className="text-[13px] text-white/50 font-medium mt-0.5">{tpl.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/api/pdf/sample?template=${previewId}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[13px] text-white"
                  style={{ background: tpl.accent }}
                  onClick={e => e.stopPropagation()}>
                  <ExternalLink size={14} /> Buka PDF
                </a>
                <button onClick={() => setPreviewId(null)}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6" onClick={e => e.stopPropagation()}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl"
                style={{ width: '100%', maxWidth: 340, aspectRatio: '210/297' }}>
                <Preview />
              </div>
            </div>

            <div className="px-5 pb-10" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setSelected(previewId); setPreviewId(null) }}
                className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white"
                style={{ background: `linear-gradient(135deg, ${tpl.accent}, #7C3AED)` }}>
                {selected === previewId ? '✓ Sedang Digunakan' : `Pilih Template ${tpl.name}`}
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
