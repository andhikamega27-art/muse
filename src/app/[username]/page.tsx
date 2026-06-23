import { createServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import ShareSection from './ShareSection'

export const dynamic = 'force-dynamic'

type Props = { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('profiles').select('name, tagline, avatar_url')
    .eq('username', params.username).single()
  if (!data) return { title: 'Profil tidak ditemukan' }
  return {
    title: `${data.name} — Rate Card`,
    description: data.tagline ?? `Rate card dan layanan ${data.name}`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const supabase = await createServerSupabase()

  const { data: profile } = await supabase
    .from('profiles').select('*')
    .eq('username', params.username).single()

  if (!profile) notFound()

  const { data: rateCards } = await supabase
    .from('rate_cards').select('*')
    .eq('user_id', profile.id).eq('is_active', true)
    .order('price', { ascending: true })

  const initials = profile.name?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || '?'
  const brands: string[] = profile.brands ?? []
  const wa = profile.whatsapp?.replace(/\D/g, '')

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA', fontFamily: 'Nunito, sans-serif' }}>

      {/* ── Header foto ── */}
      <div className="relative w-full" style={{ aspectRatio: '4/3', maxHeight: 340, background: '#E5E7EB', overflow: 'hidden' }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.name}
            className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
            <span className="text-white font-black text-[64px] opacity-40">{initials}</span>
          </div>
        )}
        {/* gradient overlay bawah */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
        {/* nama di atas foto */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h1 className="text-[26px] font-black text-white leading-tight tracking-tight">{profile.name}</h1>
          {profile.tagline && (
            <p className="text-[13px] text-white/80 font-semibold mt-0.5">{profile.tagline}</p>
          )}
          {profile.city && (
            <p className="flex items-center gap-1 text-[12px] text-white/60 mt-1">
              <MapPin size={11} /> {profile.city}
            </p>
          )}
        </div>
      </div>

      {/* ── Contact sticky buttons ── */}
      {(wa || profile.instagram) && (
        <div className="flex gap-2 px-4 py-3 bg-white"
          style={{ borderBottom: '1px solid #F3F4F6' }}>
          {wa && (
            <a href={`https://wa.me/${wa}?text=Halo, saya ingin menanyakan rate card kamu`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: '#25D366' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.856L.057 23.882l6.173-1.448A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.524-5.2-1.432l-.373-.222-3.865.907.976-3.76-.243-.386A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </a>
          )}
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          )}
        </div>
      )}

      <div className="px-4 pt-4 pb-24 space-y-5">

        {/* ── Bio ── */}
        {profile.bio && (
          <p className="text-[14px] text-[#374151] leading-relaxed">{profile.bio}</p>
        )}

        {/* ── Rate Card ── */}
        {rateCards && rateCards.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: '#E5E7EB' }} />
              <p className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-widest px-2">Rate Card</p>
              <div className="h-px flex-1" style={{ background: '#E5E7EB' }} />
            </div>
            <div className="space-y-2">
              {rateCards.map((rc) => (
                <div key={rc.id}
                  className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #F3F4F6' }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] text-[#111827]">{rc.name}</p>
                    {rc.description && (
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">{rc.description}</p>
                    )}
                    <p className="text-[11px] text-[#C4B5FD] font-semibold mt-0.5">/ {rc.unit}</p>
                  </div>
                  <p className="font-extrabold text-[16px] flex-shrink-0 ml-4"
                    style={{ color: '#5B21B6' }}>
                    {formatRupiah(rc.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Brand Collaboration ── */}
        {brands.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: '#E5E7EB' }} />
              <p className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-widest px-2">Brand Collaboration</p>
              <div className="h-px flex-1" style={{ background: '#E5E7EB' }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {brands.map(brand => (
                <span key={brand}
                  className="px-3 py-1.5 rounded-full text-[12px] font-bold"
                  style={{ background: '#F5F3FF', color: '#5B21B6', border: '1px solid #DDD6FE' }}>
                  {brand}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Info Rekening ── */}
        {(profile.bank_name || profile.bank_account) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: '#E5E7EB' }} />
              <p className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-widest px-2">Rekening</p>
              <div className="h-px flex-1" style={{ background: '#E5E7EB' }} />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 space-y-1.5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #F3F4F6' }}>
              {profile.bank_name && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#9CA3AF]">Bank</span>
                  <span className="text-[13px] font-bold text-[#111827]">{profile.bank_name}</span>
                </div>
              )}
              {profile.bank_account && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#9CA3AF]">No. Rekening</span>
                  <span className="text-[13px] font-bold text-[#111827]">{profile.bank_account}</span>
                </div>
              )}
              {profile.bank_holder && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#9CA3AF]">Atas Nama</span>
                  <span className="text-[13px] font-bold text-[#111827]">{profile.bank_holder}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Share ── */}
        <ShareSection username={params.username} whatsapp={profile.whatsapp} instagram={profile.instagram} />

        <p className="text-center text-[11px] text-[#D1D5DB] pb-2">
          Powered by <span className="font-extrabold text-[#7C3AED]">Muse</span>
        </p>
      </div>
    </div>
  )
}
