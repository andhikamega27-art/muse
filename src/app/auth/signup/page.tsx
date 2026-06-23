'use client'

export const dynamic = 'force-dynamic'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import MuseLogo from '@/components/ui/MuseLogo'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState({ password: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function setField(key: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [key]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nama lengkap wajib diisi'); return }
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return }
    if (form.password !== form.confirm) { toast.error('Password tidak sama'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name.trim() },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(form.email)}`)
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

  const pwMatch = form.confirm && form.password !== form.confirm

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF8' }}>
      {/* Logo area */}
      <div className="flex justify-center pt-14 pb-6">
        <MuseLogo size={56} withBackground />
      </div>

      <div className="flex-1 px-6 pb-6">
        <h1 className="text-[28px] font-extrabold text-[#1A1A1A] tracking-tight">Buat Akun</h1>
        <p className="text-[14px] text-[#6B7280] mt-1 mb-6">Mulai kelola invoice & jadwal kamu ✨</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">Nama Lengkap</label>
            <input
              type="text"
              className="w-full px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
              style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}
              placeholder="Nama kamu"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
              style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}
              placeholder="kamu@email.com"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">Buat Password</label>
            <div className="relative">
              <input
                type={showPw.password ? 'text' : 'password'}
                className="w-full px-4 py-3.5 pr-12 rounded-2xl text-[15px] font-medium text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                style={{ background: '#fff', border: '1.5px solid #E8E8E8' }}
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                minLength={6}
                required
              />
              <button type="button" onClick={() => setShowPw(p => ({ ...p, password: !p.password }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {showPw.password ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-2">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showPw.confirm ? 'text' : 'password'}
                className="w-full px-4 py-3.5 pr-12 rounded-2xl text-[15px] font-medium text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                style={{
                  background: '#fff',
                  border: `1.5px solid ${pwMatch ? '#EF4444' : '#E8E8E8'}`,
                }}
                placeholder="Ulangi password"
                value={form.confirm}
                onChange={e => setField('confirm', e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {showPw.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {pwMatch && <p className="text-[12px] text-red-500 font-medium mt-1">Password tidak sama</p>}
          </div>

          {/* Sign Up button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
          >
            {loading ? 'Memproses...' : 'Sign Up'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E8E8E8]" />
          <span className="text-[13px] text-[#9CA3AF] font-medium">Atau daftar dengan</span>
          <div className="flex-1 h-px bg-[#E8E8E8]" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-[15px] text-[#1A1A1A] active:scale-[0.98] transition-all disabled:opacity-50"
          style={{ background: '#fff', border: '1.5px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? 'Menghubungkan...' : 'Google'}
        </button>
      </div>

      {/* Bottom link */}
      <p className="text-center text-[14px] text-[#6B7280] py-6">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="font-extrabold" style={{ color: '#F59E0B' }}>
          Masuk
        </Link>
      </p>
    </div>
  )
}
