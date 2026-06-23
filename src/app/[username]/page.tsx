import { createServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'
import { MapPin, Instagram, MessageCircle, Copy, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('name, tagline, avatar_url')
    .eq('username', params.username)
    .single()
  if (!data) return { title: 'Profil tidak ditemukan' }
  return {
    title: `${data.name} — Rate Card`,
    description: data.tagline ?? `Lihat rate card dan layanan ${data.name}`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const supabase = await createServerSupabase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const { data: rateCards } = await supabase
    .from('rate_cards')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('price', { ascending: true })

  const initials = profile.name?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || '?'
  const brands: string[] = profile.brands ?? []

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F3F4F8' }}>

      {/* ── Hero ── */}
      <div className="relative"
        style={{ background: 'linear-gradient(160deg, #1E0A4E 0%, #4C1D95 60%, #7C3AED 100%)' }}>
        {/* Blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)' }} />

        <div className="relative z-10 px-5 pt-16 pb-16 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl mb-4 overflow-hidden flex-shrink-0"
            style={{ border: '3px solid rgba(255,255,255,0.35)' }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <span className="text-white font-extrabold text-[32px]">{initials}</span>
              </div>
            )}
          </div>

          <h1 className="text-[24px] font-black text-white tracking-tight">{profile.name}</h1>
          {profile.tagline && (
            <p className="text-[13px] text-purple-200 font-semibold mt-1">{profile.tagline}</p>
          )}
          {profile.city && (
            <p className="flex items-center gap-1 text-[12px] text-purple-300 mt-1.5">
              <MapPin size={12} /> {profile.city}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 mt-5 w-full max-w-xs">
            {profile.whatsapp && (
              <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold text-white"
                style={{ background: '#25D366' }}>
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #E1306C, #833AB4)' }}>
                <Instagram size={16} /> Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        {/* ── Bio ── */}
        {profile.bio && (
          <div className="bg-white rounded-2xl px-4 py-4"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-[13px] text-[#374151] leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* ── Rate Card ── */}
        {rateCards && rateCards.length > 0 && (
          <div>
            <p className="text-[13px] font-extrabold text-[#374151] mb-3 px-1">Rate Card</p>
            <div className="space-y-2.5">
              {rateCards.map((rc, i) => (
                <div key={rc.id}
                  className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: i === 0 ? '#EDE9FE' : '#F3F4F6' }}>
                      <Star size={16} style={{ color: i === 0 ? '#7C3AED' : '#9CA3AF' }}
                        fill={i === 0 ? '#7C3AED' : 'none'} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[14px] text-[#111827] truncate">{rc.name}</p>
                      {rc.description && (
                        <p className="text-[11px] text-[#9CA3AF] truncate">{rc.description}</p>
                      )}
                      <p className="text-[11px] text-[#9CA3AF]">per {rc.unit}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-extrabold text-[15px]" style={{ color: '#7C3AED' }}>
                      {formatRupiah(rc.price)}
                    </p>
                    {i === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                        Populer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Brand Collaborations ── */}
        {brands.length > 0 && (
          <div>
            <p className="text-[13px] font-extrabold text-[#374151] mb-3 px-1">Brand Collaboration</p>
            <div className="bg-white rounded-2xl px-4 py-4"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <span key={brand}
                    className="px-4 py-2 rounded-full text-[13px] font-bold"
                    style={{ background: '#F3F4F6', color: '#374151', border: '1.5px solid #E5E7EB' }}>
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Info Pembayaran ── */}
        {(profile.bank_name || profile.bank_account) && (
          <div>
            <p className="text-[13px] font-extrabold text-[#374151] mb-3 px-1">Info Pembayaran</p>
            <div className="bg-white rounded-2xl px-4 py-4 space-y-2"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
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
        <ShareButton username={params.username} />

        {/* Powered by */}
        <p className="text-center text-[11px] text-[#9CA3AF] pb-4">
          Powered by <span className="font-extrabold text-[#7C3AED]">Muse</span>
        </p>
      </div>
    </div>
  )
}

function ShareButton({ username }: { username: string }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 space-y-3"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <p className="text-[13px] font-extrabold text-[#374151]">Bagikan Profil</p>
      <CopyLinkButton username={username} />
    </div>
  )
}

function CopyLinkButton({ username }: { username: string }) {
  'use client'
  return (
    <a
      href={`https://app-muse.vercel.app/${username}`}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[13px] font-bold"
      style={{ background: '#EDE9FE', color: '#7C3AED' }}>
      <Copy size={15} />
      app-muse.vercel.app/{username}
    </a>
  )
}
