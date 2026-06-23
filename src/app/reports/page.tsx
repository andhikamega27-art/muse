'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatRupiah } from '@/lib/utils'
import { Invoice } from '@/types'
import { TrendingUp, CheckCircle, Clock, FileText } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { id } from 'date-fns/locale'

type MonthSummary = {
  label: string
  total: number
  paid: number
  unpaid: number
  count: number
}

export default function ReportsPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonths, setSelectedMonths] = useState(6)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const from = format(subMonths(new Date(), 11), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('invoice_date', from)
      .order('invoice_date', { ascending: false })
    setInvoices((data as Invoice[]) ?? [])
    setLoading(false)
  }

  // Build monthly summaries
  const months: MonthSummary[] = Array.from({ length: selectedMonths }, (_, i) => {
    const date = subMonths(new Date(), i)
    const start = format(startOfMonth(date), 'yyyy-MM-dd')
    const end = format(endOfMonth(date), 'yyyy-MM-dd')
    const monthInvoices = invoices.filter(inv => inv.invoice_date >= start && inv.invoice_date <= end)
    return {
      label: format(date, 'MMMM yyyy', { locale: id }),
      total: monthInvoices.reduce((s, i) => s + i.total, 0),
      paid: monthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
      unpaid: monthInvoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.total, 0),
      count: monthInvoices.length,
    }
  })

  const currentMonth = months[0]
  const maxTotal = Math.max(...months.map(m => m.total), 1)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="page-header">
        <h1 className="text-lg font-bold">Laporan</h1>
      </div>

      <div className="px-4 pt-3 space-y-4">
        {/* Summary bulan ini */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-4 text-white">
          <p className="text-violet-200 text-xs mb-1">Bulan Ini · {currentMonth?.label}</p>
          <p className="text-3xl font-bold">{formatRupiah(currentMonth?.total ?? 0)}</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <p className="text-violet-200 text-xs">Invoice</p>
              <p className="font-bold">{currentMonth?.count ?? 0}</p>
            </div>
            <div>
              <p className="text-violet-200 text-xs">Lunas</p>
              <p className="font-bold text-green-300">{formatRupiah(currentMonth?.paid ?? 0)}</p>
            </div>
            <div>
              <p className="text-violet-200 text-xs">Belum</p>
              <p className="font-bold text-amber-300">{formatRupiah(currentMonth?.unpaid ?? 0)}</p>
            </div>
          </div>
        </div>

        {/* Bar chart sederhana */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-base">Pendapatan per Bulan</h2>
            <select
              className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1"
              value={selectedMonths}
              onChange={e => setSelectedMonths(Number(e.target.value))}
            >
              <option value={3}>3 bulan</option>
              <option value={6}>6 bulan</option>
              <option value={12}>12 bulan</option>
            </select>
          </div>

          {loading ? (
            <div className="h-40 animate-pulse bg-gray-100 rounded-xl" />
          ) : (
            <div className="flex items-end gap-2 h-40">
              {[...months].reverse().map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex items-end" style={{ height: '120px' }}>
                    <div
                      className="w-full bg-violet-200 rounded-t-lg transition-all relative"
                      style={{ height: `${(m.total / maxTotal) * 100}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-violet-600 rounded-t-lg"
                        style={{ height: `${m.total > 0 ? (m.paid / m.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 text-center leading-tight">
                    {m.label.split(' ')[0].slice(0, 3)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 bg-violet-600 rounded" />Lunas
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 bg-violet-200 rounded" />Total
            </span>
          </div>
        </div>

        {/* Riwayat per bulan */}
        <div className="space-y-2">
          <h2 className="section-title text-base px-1">Riwayat Bulanan</h2>
          {months.map((m, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{m.label}</p>
                <p className="font-bold text-sm text-violet-600">{formatRupiah(m.total)}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText size={11} />{m.count} invoice
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={11} />{formatRupiah(m.paid)}
                </span>
                {m.unpaid > 0 && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Clock size={11} />{formatRupiah(m.unpaid)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="invoices" />
    </div>
  )
}
