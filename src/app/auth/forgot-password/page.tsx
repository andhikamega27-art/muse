'use client'

export const dynamic = 'force-dynamic'


import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import MuseLogo from '@/components/ui/MuseLogo'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF8' }}>
      <div className="px-5 pt-14 pb-4">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-[#6B7280] font-semibold text-[14px]">
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="flex justify-center pt-4 pb-8">
        <MuseLogo size={56} withBackground />
      </div>

      <div className="flex-1 px-6">
        {sent ? (
          /* ── Success state ── */
          <div className="text-center pt-4">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
              <CheckCircle size={36} style={{ color: '#F59E0B' }} />
            </div>
            <h1 className="text-[24px] font-extrabold text-[#1A1A1A]">Email Terkirim!</h1>
            <p className="text-[14px] text-[#6B7280] mt-2 leading-relaxed">
              Link reset password sudah dikirim ke<br />
              <span className="font-bold text-[#1A1A1A]">{email}</span>
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-4">
              Cek inbox atau folder spam kamu.
            </p>
            <Link href="/auth/login"
              className="inline-flex items-center justify-center w-full py-4 rounded-2xl font-extrabold text-[16px] text-white mt-8 active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
              Kembali ke Login
            </Link>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <h1 className="text-[28px] font-extrabold text-[#1A1A1A] tracking-tight">Lupa Password?</h1>
            <p className="text-[14px] text-[#6B7280] mt-1 mb-8">
              Masukkan emailmu dan kami akan kirim link untuk reset password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-2">Email</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                    style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}
                    placeholder="kamu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
