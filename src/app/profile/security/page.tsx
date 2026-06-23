'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SecurityPage() {
  const supabase = createClient()
  const [currentEmail, setCurrentEmail] = useState('')
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  // Email
  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Password
  const [passwords, setPasswords] = useState({ new: '', confirm: '' })
  const [showPw, setShowPw] = useState({ new: false, confirm: false })
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setCurrentEmail(user.email ?? '')
      const isGoogle = user.app_metadata?.provider === 'google' ||
        user.identities?.some(i => i.provider === 'google') === true
      setIsGoogleUser(isGoogle)
    })
  }, [])

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setSavingEmail(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    if (error) { toast.error(error.message); setSavingEmail(false); return }
    setEmailSent(true)
    setSavingEmail(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwords.new.length < 6) { toast.error('Password minimal 6 karakter'); return }
    if (passwords.new !== passwords.confirm) { toast.error('Password tidak sama'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.new })
    if (error) { toast.error(error.message); setSavingPassword(false); return }
    toast.success('Password berhasil diubah!')
    setPasswords({ new: '', confirm: '' })
    setSavingPassword(false)
  }

  const pwMatch = passwords.confirm && passwords.new !== passwords.confirm

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F8F8FC' }}>
      <div className="flex items-center gap-4 px-4 pt-14 pb-4 bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <Link href="/profile" className="w-9 h-9 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
          <ArrowLeft size={18} className="text-[#374151]" />
        </Link>
        <h1 className="font-extrabold text-[17px] text-[#111827]">Keamanan Akun</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Ganti Email ── */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-extrabold text-[15px] text-[#111827]">Ganti Email</p>
              <p className="text-[12px] text-[#6B7280] font-medium">Email aktif: {currentEmail}</p>
            </div>
          </div>

          {emailSent ? (
            <div className="flex items-center gap-3 bg-green-50 rounded-2xl p-4">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-[14px] text-green-700">Link konfirmasi terkirim!</p>
                <p className="text-[12px] text-green-600 mt-0.5">Cek inbox <span className="font-bold">{newEmail}</span> untuk konfirmasi.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangeEmail} className="space-y-3">
              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-2">Email Baru</label>
                <input
                  type="email"
                  className="w-full px-4 py-3.5 rounded-2xl text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all"
                  style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                  placeholder="email.baru@contoh.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Link konfirmasi akan dikirim ke email baru. Email lama tetap aktif sampai dikonfirmasi.
              </p>
              <button type="submit" disabled={savingEmail}
                className="w-full py-3 rounded-2xl font-bold text-[14px] text-white active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', boxShadow: '0 4px 12px rgba(29,78,216,0.3)' }}>
                {savingEmail ? 'Mengirim...' : 'Kirim Link Konfirmasi'}
              </button>
            </form>
          )}
        </div>

        {/* ── Ganti Password ── */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Lock size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="font-extrabold text-[15px] text-[#111827]">Ganti Password</p>
              <p className="text-[12px] text-[#6B7280] font-medium">
                {isGoogleUser ? 'Login via Google — password dikelola Google' : 'Ubah password akun'}
              </p>
            </div>
          </div>

          {isGoogleUser ? (
            <div className="bg-[#F3F4F6] rounded-2xl p-4 text-center">
              <p className="text-[13px] text-[#6B7280] font-medium">
                Akun ini terhubung dengan Google.<br />
                Ubah password di pengaturan akun Google kamu.
              </p>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-2">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPw.new ? 'text' : 'password'}
                    className="w-full px-4 py-3.5 pr-12 rounded-2xl text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition-all"
                    style={{ background: '#F8F8FC', border: '1.5px solid #E8E8E8' }}
                    placeholder="Minimal 6 karakter"
                    value={passwords.new}
                    onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                    minLength={6} required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    {showPw.new ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <input
                    type={showPw.confirm ? 'text' : 'password'}
                    className="w-full px-4 py-3.5 pr-12 rounded-2xl text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition-all"
                    style={{ background: '#F8F8FC', border: `1.5px solid ${pwMatch ? '#EF4444' : '#E8E8E8'}` }}
                    placeholder="Ulangi password baru"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    {showPw.confirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {pwMatch && <p className="text-[12px] text-red-500 font-medium mt-1">Password tidak sama</p>}
              </div>

              <button type="submit" disabled={savingPassword}
                className="w-full py-3 rounded-2xl font-bold text-[14px] text-white active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
                {savingPassword ? 'Menyimpan...' : 'Ubah Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
