'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Client, RateCard } from '@/types'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatRupiah, generateInvoiceNumber, calculateSubtotal, calculateTotal } from '@/lib/utils'
import { format } from 'date-fns'

type LineItem = {
  rate_card_id?: string
  description: string
  quantity: number
  unit_price: number
}

function NewInvoiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('schedule_id')
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [rateCards, setRateCards] = useState<RateCard[]>([])
  const [loading, setLoading] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState('')

  const today = format(new Date(), 'yyyy-MM-dd')
  const [clientId, setClientId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(today)
  const [dueDate, setDueDate] = useState('')
  const [taxPercent, setTaxPercent] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [clientsRes, rateRes, profileRes, lastInvRes] = await Promise.all([
      supabase.from('clients').select('id, name').eq('user_id', user.id).order('name'),
      supabase.from('rate_cards').select('*').eq('user_id', user.id).eq('is_active', true).order('name'),
      supabase.from('profiles').select('invoice_prefix').eq('id', user.id).single(),
      supabase.from('invoices').select('invoice_number').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    ])

    const loadedClients = (clientsRes.data ?? []) as Client[]
    const loadedRateCards = (rateRes.data ?? []) as RateCard[]
    setClients(loadedClients)
    setRateCards(loadedRateCards)

    const prefix = profileRes.data?.invoice_prefix ?? 'INV'
    const lastNum = lastInvRes.data?.[0]?.invoice_number?.match(/(\d+)$/)?.[1]
    setInvoiceNumber(generateInvoiceNumber(prefix, lastNum ? parseInt(lastNum) : 0))

    // Pre-fill dari booking
    if (scheduleId) {
      const { data: schedule } = await supabase
        .from('schedules')
        .select('*, client:clients(id, name)')
        .eq('id', scheduleId)
        .single()

      if (schedule) {
        if (schedule.client_id) setClientId(schedule.client_id)
        if (schedule.notes) setNotes(schedule.notes)

        // Cari rate card yang cocok dengan job_type
        const matchedRC = loadedRateCards.find(rc => rc.name === schedule.job_type)
        if (matchedRC) {
          setItems([{ rate_card_id: matchedRC.id, description: matchedRC.name, quantity: 1, unit_price: matchedRC.price }])
        } else if (schedule.job_type) {
          setItems([{ description: schedule.job_type, quantity: 1, unit_price: 0 }])
        }
      }
    }
  }

  function addItem() {
    setItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function applyRateCard(index: number, rateCardId: string) {
    const rc = rateCards.find(r => r.id === rateCardId)
    if (!rc) return
    setItems(prev => prev.map((item, i) => i === index
      ? { ...item, rate_card_id: rc.id, description: rc.name, unit_price: rc.price }
      : item
    ))
  }

  const subtotal = calculateSubtotal(items)
  const { tax_amount, total } = calculateTotal(subtotal, taxPercent, discount)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId) { toast.error('Pilih klien terlebih dahulu'); return }
    if (items.some(i => !i.description)) { toast.error('Deskripsi item wajib diisi'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const shareToken = crypto.randomUUID()

    const { data: invoice, error } = await supabase.from('invoices').insert({
      user_id: user.id,
      client_id: clientId,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate || null,
      subtotal,
      tax_percent: taxPercent,
      tax_amount,
      discount,
      total,
      status: 'draft',
      notes: notes || null,
      share_token: shareToken,
    }).select().single()

    if (error || !invoice) {
      toast.error('Gagal membuat invoice')
      setLoading(false)
      return
    }

    const invoiceItems = items.map(item => ({
      invoice_id: invoice.id,
      rate_card_id: item.rate_card_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems)
    if (itemsError) {
      toast.error('Gagal menyimpan item invoice')
      setLoading(false)
      return
    }

    toast.success('Invoice berhasil dibuat')
    router.push(`/invoices/${invoice.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="page-header">
        <Link href="/invoices" className="p-1 -ml-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Invoice Baru</h1>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Info dasar */}
        <div className="card space-y-4">
          <div>
            <label className="label">No. Invoice</label>
            <input className="input" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
          </div>
          <div>
            <label className="label">Klien *</label>
            <select className="input" value={clientId} onChange={e => setClientId(e.target.value)} required>
              <option value="">Pilih klien</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">
                Belum ada klien. <Link href="/clients/new" className="underline">Tambah klien</Link> dulu.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tgl Invoice</label>
              <input type="date" className="input" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Jatuh Tempo</label>
              <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Item-item */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm">Item Pekerjaan</h2>
          {items.map((item, index) => (
            <div key={index} className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">Item {index + 1}</p>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {rateCards.length > 0 && (
                <select
                  className="input text-xs"
                  value={item.rate_card_id ?? ''}
                  onChange={e => applyRateCard(index, e.target.value)}
                >
                  <option value="">Pilih dari rate card (opsional)</option>
                  {rateCards.map(r => <option key={r.id} value={r.id}>{r.name} — {formatRupiah(r.price)}</option>)}
                </select>
              )}

              <input
                className="input"
                placeholder="Deskripsi pekerjaan"
                value={item.description}
                onChange={e => updateItem(index, 'description', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Harga Satuan</label>
                  <input
                    type="number"
                    className="input"
                    min={0}
                    value={item.unit_price}
                    onChange={e => updateItem(index, 'unit_price', Number(e.target.value))}
                  />
                </div>
              </div>
              <p className="text-xs text-right text-gray-500 font-medium">
                Subtotal: {formatRupiah(item.quantity * item.unit_price)}
              </p>
            </div>
          ))}

          <button type="button" onClick={addItem} className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
            <Plus size={16} /> Tambah Item
          </button>
        </div>

        {/* Pajak & diskon */}
        <div className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Pajak (%)</label>
              <input
                type="number"
                className="input"
                min={0}
                max={100}
                value={taxPercent}
                onChange={e => setTaxPercent(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Diskon (Rp)</label>
              <input
                type="number"
                className="input"
                min={0}
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
            </div>
            {taxPercent > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Pajak {taxPercent}%</span><span>{formatRupiah(tax_amount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Diskon</span><span>-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
              <span>Total</span><span className="text-violet-600">{formatRupiah(total)}</span>
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div className="card">
          <label className="label">Catatan</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Catatan atau syarat pembayaran..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Membuat Invoice...' : 'Buat Invoice'}
        </button>
      </form>
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <NewInvoiceForm />
    </Suspense>
  )
}
