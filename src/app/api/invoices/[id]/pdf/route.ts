import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoice/InvoicePDF'
import { InvoiceTemplate } from '@/types'
import React from 'react'
import QRCode from 'qrcode'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createAdminSupabase()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`*, client:clients(*), invoice_items(*), user:profiles(*)`)
      .eq('id', params.id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 })
    }

    const template: InvoiceTemplate = (invoice.user as any)?.invoice_template ?? 'modern'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Generate QR code yang mengarah ke halaman invoice
    const qrCode = await QRCode.toDataURL(`${appUrl}/invoices/${params.id}`, {
      width: 200,
      margin: 1,
      color: { dark: '#374151', light: '#ffffff' },
    })

    const pdfBuffer: Buffer = await renderToBuffer(
      React.createElement(InvoicePDF, { invoice, template, qrCode })
    )

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Gagal generate PDF' }, { status: 500 })
  }
}
