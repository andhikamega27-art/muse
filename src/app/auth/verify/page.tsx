'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import MuseLogo from '@/components/ui/MuseLogo'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const supabase = createClient()
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    if (!email) return
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      toast.error('Gagal mengirim ulang. Coba beberapa saat lagi.')
    } else {
      setResent(true)
      toast.success('Email verifikasi sudah dikirim ulang!')
    }
    setResending(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1E0A4E 0%, #4C1D95 45%, #7C3AED 80%, #8B5CF6 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)' }} />
      <div className="absolute bottom-40 -left-20 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />

      {/* Top logo */}
      <div className="flex justify-center pt-16 pb-6 relative z-10">
        <MuseLogo size={72} withBackground />
      </div>

      {/* Card */}
      <div
        className="relative z-10 rounded-t-[32px] flex-1 px-5 pt-8 pb-10 flex flex-col"
        style={{ background: '#F2F2F7' }}
      >
        {/* Email icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}
          >
            <Mail size={36} style={{ color: '#7C3AED' }} />
          </div>
        </div>

        <h1 className="text-[24px] font-extrabold text-[#1C1C1E] text-center tracking-tight">
          Cek email kamu
        </h1>
        <p className="text-[14px] text-[#636366] text-center mt-2 leading-relaxed">
          Kami sudah mengirim link verifikasi ke
        </p>
        {email && (
          <p className="text-[15px] font-bold text-[#7C3AED] text-center mt-1">
            {email}
          </p>
        )}

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {[
            { num: '1', text: 'Buka aplikasi email kamu' },
            { num: '2', text: 'Cari email dari Muse Invoice' },
            { num: '3', text: 'Klik link "Konfirmasi Email"' },
          ].map(step => (
            <div key={step.num} className="card flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[13px] text-white"
                style={{ background: 'linear-gradient(135deg, #5B21B6, #8B5CF6)' }}
              >
                {step.num}
              </div>
              <p className="text-[14px] font-semibold text-[#1C1C1E]">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 card" style={{ background: 'rgba(124,58,237,0.06)' }}>
          <p className="text-[13px] text-[#636366] leading-relaxed text-center">
            Tidak ada di inbox? Cek folder <span className="font-bold text-[#1C1C1E]">Spam</span> atau{' '}
            <span className="font-bold text-[#1C1C1E]">Promotions</span>
          </p>
        </div>

        <div className="mt-auto pt-8 space-y-3">
          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: '#FFFFFF', color: '#7C3AED', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
          >
            <RefreshCw size={17} className={resending ? 'animate-spin' : ''} />
            {resent ? 'Email sudah dikirim ulang!' : resending ? 'Mengirim...' : 'Kirim ulang email'}
          </button>

          {/* Back to login */}
          <Link
            href="/auth/login"
            className="w-full py-4 rounded-2xl font-semibold text-[14px] text-[#AEAEB2] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ArrowLeft size={16} /> Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
