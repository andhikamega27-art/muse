'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { RateCard } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { ArrowLeft, Plus, Tag, Edit3, Trash2, ToggleLeft, ToggleRight, Check, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const UNITS = ['job', 'hari', 'jam', 'sesi', 'produk', 'konten', 'paket']

export default function RateCardsPage() {
  const supabase = createClient()
  const [rateCards, setRateCards] = useState<RateCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newCard, setNewCard] = useState({ name: '', description: '', price: '', unit: 'job' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCard, setEditCard] = useState({ name: '', description: '', price: '', unit: 'job' })

  useEffect(() => { loadCards() }, [])

  async function loadCards() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('rate_cards').select('*').eq('user_id', user.id).order('name')
    setRateCards((data as RateCard[]) ?? [])
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newCard.name || !newCard.price) { toast.error('Nama dan harga wajib diisi'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('rate_cards').insert({
      user_id: user.id, name: newCard.name.trim(),
      description: newCard.description.trim() || null,
      price: Number(newCard.price), unit: newCard.unit, is_active: true,
    }).select().single()
    if (error) { toast.error('Gagal menyimpan'); setSaving(false); return }
    setRateCards(prev => [...prev, data as RateCard].sort((a, b) => a.name.localeCompare(b.name)))
    setNewCard({ name: '', description: '', price: '', unit: 'job' })
    setShowAdd(false)
    toast.success('Rate card ditambahkan')
    setSaving(false)
  }

  function startEdit(card: RateCard) {
    setEditingId(card.id)
    setEditCard({ name: card.name, description: card.description ?? '', price: String(card.price), unit: card.unit })
  }

  async function saveEdit(id: string) {
    if (!editCard.name || !editCard.price) { toast.error('Nama dan harga wajib diisi'); return }
    setSaving(true)
    const { error } = await supabase.from('rate_cards').update({
      name: editCard.name.trim(), description: editCard.description.trim() || null,
      price: Number(editCard.price), unit: editCard.unit,
    }).eq('id', id)
    if (error) { toast.error('Gagal menyimpan'); setSaving(false); return }
    setRateCards(prev => prev.map(c => c.id === id
      ? { ...c, name: editCard.name, description: editCard.description, price: Number(editCard.price), unit: editCard.unit }
      : c
    ))
    setEditingId(null)
    setSaving(false)
    toast.success('Rate card diperbarui')
  }

  async function toggleActive(card: RateCard) {
    const { error } = await supabase.from('rate_cards').update({ is_active: !card.is_active }).eq('id', card.id)
    if (error) { toast.error('Gagal'); return }
    setRateCards(prev => prev.map(c => c.id === card.id ? { ...c, is_active: !c.is_active } : c))
  }

  async function deleteCard(id: string) {
    if (!confirm('Hapus rate card ini?')) return
    const { error } = await supabase.from('rate_cards').delete().eq('id', id)
    if (error) { toast.error('Gagal menghapus'); return }
    setRateCards(prev => prev.filter(c => c.id !== id))
    toast.success('Rate card dihapus')
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F8F8FC' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <Link href="/profile" className="w-9 h-9 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#374151]" />
        </Link>
        <h1 className="font-extrabold text-[17px] text-[#111827]">Rate Card</h1>
        <button onClick={() => setShowAdd(!showAdd)}
          className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: showAdd ? '#F3F4F6' : '#5B21B6' }}>
          {showAdd ? <X size={17} className="text-[#374151]" /> : <Plus size={17} className="text-white" />}
        </button>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* Form tambah */}
        {showAdd && (
          <form onSubmit={handleAdd} className="card space-y-3 border-2 border-violet-200">
            <p className="font-extrabold text-[15px] text-[#111827]">Rate Card Baru</p>
            <div>
              <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Nama Layanan *</label>
              <input className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                placeholder="cth: Foto Produk, Video Reels..."
                value={newCard.name} onChange={e => setNewCard(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Deskripsi</label>
              <input className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                placeholder="Opsional"
                value={newCard.description} onChange={e => setNewCard(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Harga (Rp) *</label>
                <input type="number" min={0}
                  className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                  style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                  placeholder="0" value={newCard.price}
                  onChange={e => setNewCard(p => ({ ...p, price: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Satuan</label>
                <select className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-violet-400/40 appearance-none"
                  style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                  value={newCard.unit} onChange={e => setNewCard(p => ({ ...p, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-[14px] text-[#374151] bg-[#F3F4F6] active:scale-[0.98]">
                Batal
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-2xl font-bold text-[14px] text-white active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-20 skeleton" />)}
          </div>
        ) : rateCards.length === 0 && !showAdd ? (
          <div className="card text-center py-14">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <Tag size={26} style={{ color: '#5B21B6' }} />
            </div>
            <p className="font-extrabold text-[16px] text-[#111827]">Belum ada rate card</p>
            <p className="text-[13px] text-[#6B7280] mt-1">Tambahkan paket harga layananmu</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-4 px-6 py-3 rounded-2xl font-bold text-[14px] text-white inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
              <Plus size={16} /> Tambah Rate Card
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rateCards.map(card => (
              <div key={card.id} className="card">
                {editingId === card.id ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1 uppercase tracking-wide">Nama</label>
                        <input className="w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                          style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                          value={editCard.name} onChange={e => setEditCard(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1 uppercase tracking-wide">Harga</label>
                        <input type="number" min={0}
                          className="w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                          style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                          value={editCard.price} onChange={e => setEditCard(p => ({ ...p, price: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1 uppercase tracking-wide">Satuan</label>
                        <select className="w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#111827] focus:outline-none appearance-none"
                          style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                          value={editCard.unit} onChange={e => setEditCard(p => ({ ...p, unit: e.target.value }))}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(null)}
                        className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-[#374151] bg-[#F3F4F6] active:scale-[0.97]">
                        Batal
                      </button>
                      <button onClick={() => saveEdit(card.id)} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white active:scale-[0.97] disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
                        {saving ? 'Simpan...' : 'Simpan'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: card.is_active ? '#EDE9FE' : '#F3F4F6' }}>
                      <Tag size={19} style={{ color: card.is_active ? '#5B21B6' : '#9CA3AF' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-extrabold text-[15px] truncate ${card.is_active ? 'text-[#111827]' : 'text-[#9CA3AF] line-through'}`}>
                          {card.name}
                        </p>
                        {!card.is_active && (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">Nonaktif</span>
                        )}
                      </div>
                      <p className="text-[13px] font-extrabold mt-0.5" style={{ color: '#5B21B6' }}>
                        {formatRupiah(card.price)}
                        <span className="text-[11px] font-semibold text-[#9CA3AF]"> / {card.unit}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(card)}
                        className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center active:scale-90 transition-all">
                        <Edit3 size={14} className="text-[#6B7280]" />
                      </button>
                      <button onClick={() => toggleActive(card)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                        style={{ background: card.is_active ? '#DCFCE7' : '#F3F4F6' }}>
                        {card.is_active
                          ? <ToggleRight size={17} style={{ color: '#16A34A' }} />
                          : <ToggleLeft size={17} className="text-[#9CA3AF]" />}
                      </button>
                      <button onClick={() => deleteCard(card.id)}
                        className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center active:scale-90 transition-all">
                        <Trash2 size={15} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
