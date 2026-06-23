import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.user) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(exchangeError?.message ?? 'exchange_failed')}`
    )
  }

  // Auto-buat profile jika belum ada
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    const name =
      data.user.user_metadata?.full_name ??
      data.user.user_metadata?.name ??
      data.user.email?.split('@')[0] ??
      'User'

    await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      email: data.user.email ?? '',
      invoice_prefix: 'INV',
    })
  }

  return response
}
