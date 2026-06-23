import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoice/InvoicePDF'
import { InvoiceTemplate } from '@/types'
import React from 'react'
import QRCode from 'qrcode'

function makeSampleInvoice() {
  return {
    id: 'sample',
    invoice_number: 'INV-20260624-001',
    invoice_date: '2026-06-24',
    due_date: '2026-07-01',
    subtotal: 6300000,
    tax_percent: 11,
    tax_amount: 693000,
    discount: 0,
    total: 6993000,
    status: 'sent',
    notes: 'Mohon melakukan pembayaran sebelum tanggal jatuh tempo dan konfirmasi pembayaran ke nomor WhatsApp kami.',
    user: {
      name: 'Muse Studio',
      email: 'hello@muse.id',
      phone: '+62 812-3456-7890',
      address: 'Jl. Melati No. 10, Kebayoran Baru, Jakarta Selatan',
      bank_name: 'BCA',
      bank_account: '1234 5678 9012',
      bank_holder: 'Muse Studio',
      invoice_prefix: 'INV',
      invoice_footer: 'Atas kepercayaan dan kerjasamanya.',
    },
    client: {
      name: 'Sarah Monica',
      company: null,
      email: 'sarah.monica@email.com',
      phone: '+62 812-3456-7890',
      address: 'Jl. Cempaka Putih No. 25, Jakarta Pusat',
    },
    invoice_items: [
      { id: '1', description: 'Bridal Makeup', quantity: 1, unit_price: 3500000, subtotal: 3500000 },
      { id: '2', description: 'Hairdo Assistant', quantity: 1, unit_price: 800000, subtotal: 800000 },
      { id: '3', description: 'Touch Up', quantity: 1, unit_price: 700000, subtotal: 700000 },
      { id: '4', description: 'False Lashes Premium', quantity: 1, unit_price: 300000, subtotal: 300000 },
      { id: '5', description: 'Transport', quantity: 1, unit_price: 200000, subtotal: 200000 },
    ],
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const template = (searchParams.get('template') ?? 'modern') as InvoiceTemplate

    const invoice = makeSampleInvoice()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const qrCode = await QRCode.toDataURL(`${appUrl}/invoices/sample-preview`, {
      width: 200,
      margin: 1,
      color: { dark: '#374151', light: '#ffffff' },
    })

    // @ts-expect-error — react-pdf type mismatch
    const pdfBuffer: Buffer = await renderToBuffer(
      React.createElement(InvoicePDF, { invoice, template, qrCode })
    )

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="sample-${template}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Sample PDF error:', err)
    return NextResponse.json({ error: 'Gagal generate PDF' }, { status: 500 })
  }
}
