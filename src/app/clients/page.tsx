'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Client } from '@/types'
import { Plus, Search, Users, Phone, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setClients(data ?? [])
    setLoading(false)
  }

  const filtered = search
    ? clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : clients

  const AVATAR_COLORS = [
    'linear-gradient(135deg, #5B21B6, #8B5CF6)',
    'linear-gradient(135deg, #1D4ED8, #60A5FA)',
    'linear-gradient(135deg, #065F46, #34D399)',
    'linear-gradient(135deg, #9A3412, #FB923C)',
    'linear-gradient(135deg, #831843, #F472B6)',
  ]

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F2F2F7' }}>
      <div className="page-header">
        <h1 className="text-[18px] font-bold tracking-tight text-[#1C1C1E]">Klien</h1>
        <Link href="/clients/new" className="btn-primary py-2 px-4 text-[13px] rounded-xl">
          <Plus size={15} /> Tambah
        </Link>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
          <input
            className="input pl-10"
            placeholder="Cari klien, perusahaan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card flex items-center gap-3 h-[68px]">
                <div className="skeleton w-11 h-11 rounded-2xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-2/5 mb-2" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}>
              <Users size={28} style={{ color: '#7C3AED' }} />
            </div>
            <p className="font-bold text-[16px] text-[#1C1C1E]">
              {search ? 'Klien tidak ditemukan' : 'Belum ada klien'}
            </p>
            <p className="text-[13px] text-[#AEAEB2] mt-1 mb-4">
              {search ? 'Coba kata kunci lain' : 'Tambahkan klien pertamamu'}
            </p>
            {!search && (
              <Link href="/clients/new" className="btn-primary text-sm mx-auto">Tambah Klien</Link>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c, idx) => (
              <Link key={c.id} href={`/clients/${c.id}`}
                className="card flex items-center gap-3 active:scale-[0.98] transition-all">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                >
                  <span className="text-white font-bold text-[15px]">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-[#1C1C1E]">{c.name}</p>
                  <p className="text-[12px] text-[#AEAEB2] font-medium mt-0.5 truncate">
                    {c.company ?? c.phone ?? c.email ?? 'Tanpa detail'}
                  </p>
                </div>
                <ChevronRight size={15} style={{ color: '#C7C7CC' }} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="dashboard" />
    </div>
  )
}
