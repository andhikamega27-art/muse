import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { formatRupiah, formatDate } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = await createAdminSupabase()
    const { to, message } = await request.json()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, client:clients(*), user:profiles(*)')
      .eq('id', params.id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 })
    }

    const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/i/${invoice.share_token}`
    const muse = invoice.user as any
    const client = invoice.client as any

    await resend.emails.send({
      from: `${muse.name} <onboarding@resend.dev>`,
      to: [to || client?.email],
      subject: `Invoice ${invoice.invoice_number} dari ${muse.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #7C3AED, #5B21B6); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${muse.name}</h1>
            <p style="color: #DDD6FE; margin: 4px 0 0;">Invoice ${invoice.invoice_number}</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
            <p>Halo ${client?.name ?? ''},</p>
            <p>${message || `Berikut adalah invoice untuk pekerjaan yang telah dilaksanakan.`}</p>
            <div style="background: white; border: 1px solid #eee; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #888;">Nomor Invoice</span>
                <strong>${invoice.invoice_number}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #888;">Tanggal</span>
                <span>${formatDate(invoice.invoice_date)}</span>
              </div>
              ${invoice.due_date ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #888;">Jatuh Tempo</span>
                <span>${formatDate(invoice.due_date)}</span>
              </div>` : ''}
              <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
              <div style="display: flex; justify-content: space-between;">
                <strong style="font-size: 16px;">Total</strong>
                <strong style="font-size: 18px; color: #7C3AED;">${formatRupiah(invoice.total)}</strong>
              </div>
            </div>
            ${muse.bank_account ? `
            <div style="background: #EDE9FE; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <p style="margin: 0 0 4px; font-weight: bold; color: #5B21B6;">Info Pembayaran</p>
              <p style="margin: 0; color: #555;">${muse.bank_name} · ${muse.bank_account}</p>
              <p style="margin: 0; color: #555;">a.n. ${muse.bank_holder ?? muse.name}</p>
            </div>` : ''}
            <a href="${invoiceUrl}"
               style="display: block; background: #7C3AED; color: white; text-align: center;
                      padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Lihat Invoice Online
            </a>
            <p style="color: #888; font-size: 12px; text-align: center; margin-top: 16px;">
              Terima kasih atas kepercayaan Anda.
            </p>
          </div>
        </div>
      `,
    })

    // Update status invoice jadi 'sent'
    await supabase.from('invoices').update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Gagal kirim email' }, { status: 500 })
  }
}
