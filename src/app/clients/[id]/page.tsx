'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Client, Invoice } from '@/types'
import { formatRupiah, formatDateShort, getInvoiceStatusColor, getInvoiceStatusLabel } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, Building2, FileText, ChevronRight, Trash2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ClientDetailPage() {
  const { id: clientId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [client, setClient] = useState<Client | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClient()
  }, [clientId])

  async function loadClient() {
    const [clientRes, invoicesRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).single(),
      supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
    ])
    setClient(clientRes.data as Client)
    setInvoices((invoicesRes.data as Invoice[]) ?? [])
    setLoading(false)
  }

  async function deleteClient() {
    if (!confirm('Hapus klien ini? Invoice terkait tidak akan terhapus.')) return
    const { error } = await supabase.from('clients').delete().eq('id', clientId)
    if (error) {
      toast.error('Gagal menghapus klien')
    } else {
      toast.success('Klien dihapus')
      router.push('/clients')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <FileText size={40} className="text-gray-200" />
        <p className="text-gray-400">Klien tidak ditemukan</p>
        <Link href="/clients" className="btn-primary text-sm">Kembali</Link>
      </div>
    )
  }

  const totalIncome = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="page-header">
        <Link href="/clients" className="p-1 -ml-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-bold truncate flex-1 mx-2">Detail Klien</h1>
        <button onClick={deleteClient} className="p-1 text-red-400">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Profil klien */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-violet-600 font-bold text-2xl">{client.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{client.name}</h2>
              {client.company && (
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                  <Building2 size={12} />{client.company}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-3 text-sm text-gray-700">
                <Phone size={15} className="text-gray-400 flex-shrink-0" />
                <span>{client.phone}</span>
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-sm text-gray-700">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{client.email}</span>
              </a>
            )}
            {client.address && (
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{client.address}</span>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
            {client.phone && (
              <a
                href={`https://wa.me/${client.phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-50 text-green-600 text-sm font-medium"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
            <Link
              href={`/invoices/new`}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-50 text-violet-600 text-sm font-medium"
            >
              <FileText size={15} /> Buat Invoice
            </Link>
          </div>
        </div>

        {/* Catatan */}
        {client.notes && (
          <div className="card">
            <h2 className="font-semibold text-sm mb-1">Catatan</h2>
            <p className="text-sm text-gray-500">{client.notes}</p>
          </div>
        )}

        {/* Statistik */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-bold text-violet-600">{invoices.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Invoice</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-green-600">{formatRupiah(totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Lunas</p>
          </div>
        </div>

        {/* Riwayat invoice */}
        {invoices.length > 0 && (
          <div>
            <h2 className="section-title text-base px-1 mb-2">Riwayat Invoice</h2>
            <div className="space-y-2">
              {invoices.map(inv => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="card flex items-center gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{inv.invoice_number}</p>
                      <span className={`badge text-xs ${getInvoiceStatusColor(inv.status)}`}>
                        {getInvoiceStatusLabel(inv.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(inv.invoice_date)}</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0">{formatRupiah(inv.total)}</p>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
