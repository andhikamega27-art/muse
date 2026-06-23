'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import MuseLogo from '@/components/ui/MuseLogo'
import { User } from '@supabase/supabase-js'

export default function GoogleCallbackPage() {
  const supabase = createClient()
  const profileHandled = useRef(false)

  async function createProfileIfNeeded(user: User) {
    if (profileHandled.current) return
    profileHandled.current = true

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const name =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        'User'

      await supabase.from('profiles').insert({
        id: user.id,
        name,
        email: user.email ?? '',
        invoice_prefix: 'INV',
      })
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[auth/google] event:', event, '| user:', session?.user?.email ?? null)

      // INITIAL_SESSION: fires immediately saat listener didaftar (session bisa sudah ada)
      // SIGNED_IN: fires setelah OAuth selesai diproses
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        await createProfileIfNeeded(session.user)
        window.location.href = '/dashboard'
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: 'linear-gradient(160deg, #1E0A4E 0%, #4C1D95 45%, #7C3AED 80%, #8B5CF6 100%)' }}
    >
      <MuseLogo size={72} withBackground />
      <div className="flex flex-col items-center gap-3 mt-2">
        <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-[14px] font-medium">Menyelesaikan login...</p>
      </div>
    </div>
  )
}
