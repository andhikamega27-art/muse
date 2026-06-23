'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Invoice, InvoiceItem } from '@/types'
import { formatRupiah, formatDate, getInvoiceStatusColor, getInvoiceStatusLabel, getWhatsAppLink } from '@/lib/utils'
import { ArrowLeft, Send, CheckCircle, MoreVertical, FileText, Trash2, X, Download, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadInvoice() }, [id])

  async function loadInvoice() {
    const { data } = await supabase
      .from('invoices')
      .select('*, client:clients(*), invoice_items(*)')
      .eq('id', id)
      .single()
    if (data) {
      setInvoice(data as Invoice)
      setItems((data.invoice_items as InvoiceItem[]) ?? [])
    }
    setLoading(false)
  }

  async function updateStatus(status: string) {
    setActionLoading(true)
    const updates: Record<string, unknown> = { status }
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    const { error } = await supabase.from('invoices').update(updates).eq('id', id)
    if (error) {
      toast.error('Gagal mengubah status')
    } else {
      toast.success(`Status: ${getInvoiceStatusLabel(status)}`)
      loadInvoice()
    }
    setActionLoading(false)
    setShowMenu(false)
  }

  async function deleteInvoice() {
    if (!confirm('Hapus invoice ini?')) return
    setActionLoading(true)
    await supabase.from('invoice_items').delete().eq('invoice_id', id)
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) { toast.error('Gagal menghapus'); setActionLoading(false) }
    else { toast.success('Invoice dihapus'); router.push('/invoices') }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F2F7' }}>
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#F2F2F7' }}>
        <FileText size={40} className="text-[#C7C7CC]" />
        <p className="text-[#AEAEB2] font-medium">Invoice tidak ditemukan</p>
        <Link href="/invoices" className="btn-primary text-sm">Kembali</Link>
      </div>
    )
  }

  const client = invoice.client as any
  const statusColor = getInvoiceStatusColor(invoice.status)
  const statusLabel = getInvoiceStatusLabel(invoice.status)

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F2F2F7' }}>

      {/* Hero header */}
      <div
        className="relative px-5 pt-14 pb-8"
        style={{ background: 'linear-gradient(145deg, #1E0A4E 0%, #4C1D95 40%, #7C3AED 100%)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/invoices" className="w-9 h-9 rounded-2xl flex items-center justify-center glass">
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-2xl flex items-center justify-center glass"
            >
              <MoreVertical size={18} className="text-white" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl z-20 overflow-hidden min-w-[200px]"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                  {invoice.status === 'draft' && (
                    <button onClick={() => updateStatus('sent')}
                      className="w-full px-4 py-3.5 text-left text-[14px] font-semibold text-[#1C1C1E] flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100">
                      <Send size={16} className="text-[#636366]" /> Tandai Terkirim
                    </button>
                  )}
                  {['draft', 'sent', 'overdue'].includes(invoice.status) && (
                    <button onClick={() => updateStatus('paid')}
                      className="w-full px-4 py-3.5 text-left text-[14px] font-semibold text-emerald-600 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100">
                      <CheckCircle size={16} /> Tandai Lunas
                    </button>
                  )}
                  {invoice.status !== 'cancelled' && (
                    <button onClick={() => updateStatus('cancelled')}
                      className="w-full px-4 py-3.5 text-left text-[14px] font-semibold text-[#636366] flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100">
                      <X size={16} /> Batalkan
                    </button>
                  )}
                  <div className="h-px mx-4" style={{ background: 'rgba(60,60,67,0.12)' }} />
                  <button onClick={deleteInvoice}
                    className="w-full px-4 py-3.5 text-left text-[14px] font-semibold text-red-500 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100">
                    <Trash2 size={16} /> Hapus Invoice
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="text-white/50 text-[12px] font-semibold uppercase tracking-widest mb-1">Total Tagihan</p>
          <p className="text-white text-[34px] font-bold tracking-tight">{formatRupiah(invoice.total)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge text-[11px] ${statusColor}`}>{statusLabel}</span>
            <span className="text-white/50 text-[13px]">{invoice.invoice_number}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3 relative z-10">

        {/* Info card */}
        <div className="card space-y-3">
          <Row label="Klien" value={client?.name ?? '—'} />
          {client?.company && <Row label="Perusahaan" value={client.company} />}
          <Row label="Tanggal Invoice" value={formatDate(invoice.invoice_date)} />
          {invoice.due_date && (
            <Row
              label="Jatuh Tempo"
              value={formatDate(invoice.due_date)}
              valueClass={invoice.status === 'overdue' ? 'text-red-500' : undefined}
            />
          )}
          {invoice.paid_at && (
            <Row label="Tanggal Lunas" value={formatDate(invoice.paid_at.split('T')[0])} valueClass="text-emerald-600" />
          )}
        </div>

        {/* Items */}
        <div className="card">
          <p className="font-bold text-[15px] text-[#1C1C1E] mb-3">Item Pekerjaan</p>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-[#1C1C1E]">{item.description}</p>
                  <p className="text-[12px] text-[#AEAEB2] mt-0.5">
                    {item.quantity} × {formatRupiah(item.unit_price)}
                  </p>
                </div>
                <p className="font-bold text-[14px] text-[#1C1C1E] flex-shrink-0">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 space-y-2" style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
            <div className="flex justify-between text-[13px] text-[#636366]">
              <span>Subtotal</span><span className="font-medium">{formatRupiah(invoice.subtotal)}</span>
            </div>
            {invoice.tax_percent > 0 && (
              <div className="flex justify-between text-[13px] text-[#636366]">
                <span>Pajak {invoice.tax_percent}%</span><span className="font-medium">{formatRupiah(invoice.tax_amount)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-[13px] text-[#636366]">
                <span>Diskon</span><span className="font-medium">−{formatRupiah(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[16px] text-[#1C1C1E] pt-1"
              style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
              <span>Total</span>
              <span style={{ color: '#7C3AED' }}>{formatRupiah(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="card">
            <p className="font-bold text-[14px] text-[#1C1C1E] mb-1.5">Catatan</p>
            <p className="text-[13px] text-[#636366] leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* ── Aksi PDF & WA ── */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`/api/invoices/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] text-white active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', boxShadow: '0 4px 14px rgba(91,33,182,0.35)' }}
          >
            <Download size={17} /> Cetak PDF
          </a>
          {client?.phone ? (
            <a
              href={getWhatsAppLink(
                client.phone,
                `${typeof window !== 'undefined' ? window.location.origin : ''}/api/invoices/${id}/pdf`,
                invoice.invoice_number,
                invoice.total
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] text-white active:scale-[0.97] transition-all"
              style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
            >
              <MessageCircle size={17} /> Kirim WA
            </a>
          ) : (
            <button
              onClick={() => toast('Nomor WA klien belum diisi', { icon: 'ℹ️' })}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] text-[#9CA3AF] bg-[#F3F4F6] active:scale-[0.97] transition-all"
            >
              <MessageCircle size={17} /> Kirim WA
            </button>
          )}
        </div>

        {/* CTA Status */}
        {['draft', 'sent', 'overdue'].includes(invoice.status) && (
          <div className="space-y-2.5 pb-2">
            {invoice.status !== 'paid' && (
              <button onClick={() => updateStatus('paid')} disabled={actionLoading}
                className="w-full py-4 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
                <CheckCircle size={18} /> Tandai Lunas
              </button>
            )}
            {invoice.status === 'draft' && (
              <button onClick={() => updateStatus('sent')} disabled={actionLoading}
                className="btn-secondary w-full py-3.5 text-[15px]">
                <Send size={16} /> Tandai Terkirim
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px] text-[#AEAEB2] font-medium flex-shrink-0">{label}</span>
      <span className={`text-[14px] font-semibold text-right ${valueClass ?? 'text-[#1C1C1E]'}`}>{value}</span>
    </div>
  )
}
