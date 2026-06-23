'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import MuseLogo from '@/components/ui/MuseLogo'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function LoginForm() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      const messages: Record<string, string> = {
        exchange_failed: 'Gagal login dengan Google. Coba lagi.',
        no_code: 'Link tidak valid.',
        auth_failed: 'Login gagal.',
        timeout: 'Waktu login habis. Coba lagi.',
      }
      toast.error(messages[urlError] ?? decodeURIComponent(urlError))
      window.history.replaceState({}, '', '/auth/login')
    }
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email atau password salah')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F7FF' }}>

      {/* Top brand strip */}
      <div
        className="flex flex-col items-center justify-end px-6 pt-16 pb-10"
        style={{
          background: 'linear-gradient(160deg, #2E0F8A 0%, #5B21B6 55%, #7C3AED 100%)',
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
      >
        <MuseLogo size={72} withBackground />
        <h2 className="text-white/80 text-[15px] font-semibold mt-4 text-center">
          Invoice & Jadwal untuk Muse Profesional
        </h2>
      </div>

      {/* Form area */}
      <div className="flex-1 px-6 pt-8">
        <h1 className="text-[26px] font-extrabold text-[#1A1A1A] tracking-tight">Selamat Datang 👋</h1>
        <p className="text-[14px] text-[#6B7280] mt-1 mb-7">Masuk ke akun Muse kamu</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#374151] mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none transition-all"
              style={{
                background: '#fff',
                border: '1.5px solid #E5E7EB',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
              placeholder="kamu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-[#374151]">Password</label>
              <Link href="/auth/forgot-password"
                className="text-[12px] font-bold"
                style={{ color: '#7C3AED' }}>
                Lupa Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full px-4 py-3.5 pr-12 rounded-2xl text-[15px] font-medium text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none transition-all"
                style={{
                  background: '#fff',
                  border: '1.5px solid #E5E7EB',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white active:scale-[0.98] transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
              boxShadow: '0 6px 24px rgba(109,40,217,0.40)',
            }}
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
          <span className="text-[12px] text-[#9CA3AF] font-semibold tracking-wide">ATAU</span>
          <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-[15px] text-[#374151] active:scale-[0.98] transition-all disabled:opacity-50"
          style={{
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
        </button>
      </div>

      {/* Bottom */}
      <p className="text-center text-[14px] text-[#6B7280] py-8">
        Belum punya akun?{' '}
        <Link href="/auth/signup" className="font-extrabold" style={{ color: '#6D28D9' }}>
          Daftar Sekarang
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
