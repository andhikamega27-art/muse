'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle, Instagram } from 'lucide-react'

export default function ShareSection({
  username,
  whatsapp,
  instagram,
}: {
  username: string
  whatsapp?: string | null
  instagram?: string | null
}) {
  const [copied, setCopied] = useState(false)
  const url = `https://app-muse.vercel.app/${username}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: 'Rate Card', url })
    } else {
      handleCopy()
    }
  }

  const waMsg = encodeURIComponent(`Halo! Ini rate card saya: ${url}`)

  return (
    <div className="bg-white rounded-2xl px-4 py-4 space-y-2.5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <p className="text-[13px] font-extrabold text-[#374151] mb-1">Bagikan Profil</p>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
        style={{ background: copied ? '#F0FDF4' : '#F3F4F6' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          {copied
            ? <Check size={16} className="text-green-500 flex-shrink-0" />
            : <Copy size={16} className="text-[#374151] flex-shrink-0" />}
          <span className="text-[13px] font-semibold truncate"
            style={{ color: copied ? '#16A34A' : '#374151' }}>
            {copied ? 'Link disalin!' : url}
          </span>
        </div>
        <span className="text-[12px] font-bold flex-shrink-0 ml-2"
          style={{ color: copied ? '#16A34A' : '#7C3AED' }}>
          {copied ? '✓' : 'Salin'}
        </span>
      </button>

      {/* WhatsApp share */}
      {whatsapp && (
        <a
          href={`https://wa.me/?text=${waMsg}`}
          target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold text-white active:scale-[0.98] transition-all"
          style={{ background: '#25D366' }}>
          <MessageCircle size={16} /> Bagikan via WhatsApp
        </a>
      )}

      {/* Native share (mobile) */}
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition-all"
        style={{ background: '#EDE9FE', color: '#7C3AED' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Bagikan
      </button>
    </div>
  )
}
