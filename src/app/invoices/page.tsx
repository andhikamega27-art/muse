'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatRupiah, formatDateShort, getInvoiceStatusColor, getInvoiceStatusLabel } from '@/lib/utils'
import { Invoice } from '@/types'
import { Plus, Search, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'

const STATUSES = ['all', 'draft', 'sent', 'paid', 'overdue'] as const
const STATUS_LABEL: Record<string, string> = {
  all: 'Semua', draft: 'Draft', sent: 'Terkirim', paid: 'Lunas', overdue: 'Jatuh Tempo',
}

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadInvoices() }, [])

  async function loadInvoices() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('invoices')
      .select('*, client:clients(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setInvoices((data as Invoice[]) ?? [])
    setLoading(false)
  }

  const filtered = invoices
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .filter(i =>
      !search ||
      i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (i.client as any)?.name?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F2F2F7' }}>
      <div className="page-header">
        <h1 className="text-[18px] font-bold tracking-tight text-[#1C1C1E]">Invoice</h1>
        <Link href="/invoices/new" className="btn-primary py-2 px-4 text-[13px] rounded-xl">
          <Plus size={15} /> Buat
        </Link>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
          <input
            className="input pl-10"
            placeholder="Cari invoice atau klien..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${
                filterStatus === s
                  ? 'text-white shadow-lg shadow-violet-200/60'
                  : 'text-[#636366]'
              }`}
              style={filterStatus === s
                ? { background: 'linear-gradient(135deg, #5B21B6, #8B5CF6)' }
                : { background: '#FFFFFF' }
              }
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-[72px]">
                <div className="skeleton h-4 w-2/5 mb-2.5" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}>
              <FileText size={28} style={{ color: '#7C3AED' }} />
            </div>
            <p className="font-bold text-[16px] text-[#1C1C1E]">Tidak ada invoice</p>
            <p className="text-[13px] text-[#AEAEB2] mt-1">
              {search ? 'Coba kata kunci lain' : 'Buat invoice pertamamu'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(inv => {
              const color = getInvoiceStatusColor(inv.status)
              const label = getInvoiceStatusLabel(inv.status)
              return (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="card flex items-center gap-3 active:scale-[0.98] transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-[14px] text-[#1C1C1E]">{inv.invoice_number}</p>
                      <span className={`badge text-[10px] ${color}`}>{label}</span>
                    </div>
                    <p className="text-[12px] text-[#AEAEB2] font-medium truncate">
                      {(inv.client as any)?.name ?? 'Tanpa klien'}
                      {inv.due_date && inv.status !== 'paid' && (
                        <span className="text-orange-400"> · Jatuh tempo {formatDateShort(inv.due_date)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <p className="font-bold text-[14px] text-[#1C1C1E]">{formatRupiah(inv.total)}</p>
                    <ChevronRight size={15} style={{ color: '#C7C7CC' }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="dashboard" />
    </div>
  )
}
