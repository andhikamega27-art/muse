import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { formatRupiah, formatDate } from '@/lib/utils'
import { InvoiceTemplate } from '@/types'

// ─── Shared ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  draft: 'DRAFT', sent: 'TERKIRIM', paid: 'LUNAS', overdue: 'JATUH TEMPO', cancelled: 'BATAL',
}

// ─── Template 1: PROFESIONAL (Purple professional, referensi pertama) ─────────

function ProfesionalPDF({ invoice, qrCode }: { invoice: any; qrCode?: string }) {
  const muse = invoice.user
  const client = invoice.client
  const items = invoice.invoice_items ?? []

  return (
    <Page size="A4" style={{ fontFamily: 'Helvetica', fontSize: 10, backgroundColor: '#fff', paddingBottom: 30 }}>

      {/* ── HEADER ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '30 40 20 40' }}>
        {/* Left: Brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, backgroundColor: '#5B21B6', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', color: 'white' }}>M</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1F2937', letterSpacing: 2 }}>MUSE</Text>
            <Text style={{ fontSize: 7.5, color: '#6B7280', marginTop: 1 }}>Manage Your Business.</Text>
          </View>
        </View>
        {/* Right: INVOICE title */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 34, fontFamily: 'Helvetica-Bold', color: '#5B21B6', letterSpacing: 1 }}>INVOICE</Text>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 }}>
              <Text style={{ fontSize: 9, color: '#374151', fontFamily: 'Helvetica-Bold' }}>{invoice.invoice_number}</Text>
            </View>
            {invoice.status === 'paid' && (
              <View style={{ backgroundColor: '#5B21B6', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 9, color: 'white', fontFamily: 'Helvetica-Bold' }}>LUNAS</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── SELLER INFO + INVOICE DATES ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '0 40 16 40' }}>
        <View>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#5B21B6', marginBottom: 6 }}>{muse?.name}</Text>
          {muse?.address && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 3 }}>📍 {muse.address}</Text>}
          {muse?.phone && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 3 }}>📞 {muse.phone}</Text>}
          {muse?.email && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 3 }}>✉ {muse.email}</Text>}
        </View>
        <View style={{ width: 220 }}>
          {[
            { label: 'Tanggal', value: formatDate(invoice.invoice_date) },
            ...(invoice.due_date ? [{ label: 'Jatuh Tempo', value: formatDate(invoice.due_date) }] : []),
            { label: 'Nomor Invoice', value: invoice.invoice_number },
            { label: 'Metode Pembayaran', value: muse?.bank_name ? 'Transfer Bank' : '-' },
          ].map(({ label, value }, i, arr) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6', borderBottomStyle: 'solid' }}>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#374151' }}>{label}</Text>
              <Text style={{ fontSize: 8.5, color: label === 'Nomor Invoice' ? '#5B21B6' : '#374151', fontFamily: label === 'Nomor Invoice' ? 'Helvetica-Bold' : 'Helvetica' }}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 40, marginBottom: 16 }} />

      {/* ── BILL TO + NOTES ── */}
      <View style={{ flexDirection: 'row', padding: '0 40 16 40' }}>
        <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'solid', padding: 14, marginRight: 12 }}>
          <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#5B21B6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>DITAGIHKAN KEPADA</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1F2937', marginBottom: 4 }}>{client?.name ?? '-'}</Text>
          {client?.company && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 2 }}>{client.company}</Text>}
          {client?.address && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 2 }}>{client.address}</Text>}
          {client?.email && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 2 }}>{client.email}</Text>}
          {client?.phone && <Text style={{ fontSize: 8, color: '#6B7280' }}>{client.phone}</Text>}
        </View>
        <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'solid', padding: 14 }}>
          <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#5B21B6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>CATATAN</Text>
          {invoice.notes
            ? <Text style={{ fontSize: 8.5, color: '#6B7280', lineHeight: 1.6 }}>{invoice.notes}</Text>
            : <Text style={{ fontSize: 8.5, color: '#D1D5DB', lineHeight: 1.6, fontStyle: 'italic' }}>-</Text>
          }
        </View>
      </View>

      {/* ── ITEMS TABLE ── */}
      <View style={{ padding: '0 40' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#5B21B6', padding: '9 12', borderRadius: 6 }}>
          <Text style={{ width: 22, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: 'white' }}>NO</Text>
          <Text style={{ flex: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: 'white' }}>ITEM</Text>
          <Text style={{ flex: 2.5, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: 'white' }}>DESKRIPSI</Text>
          <Text style={{ width: 28, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: 'white', textAlign: 'center' }}>QTY</Text>
          <Text style={{ flex: 1.2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: 'white', textAlign: 'right' }}>HARGA SATUAN</Text>
          <Text style={{ flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: 'white', textAlign: 'right' }}>TOTAL</Text>
        </View>
        {items.map((item: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', padding: '10 12', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', borderBottomStyle: 'solid', backgroundColor: i % 2 === 1 ? '#FAFAFA' : 'white' }}>
            <Text style={{ width: 22, fontSize: 9, color: '#6B7280' }}>{i + 1}</Text>
            <Text style={{ flex: 2, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{item.description}</Text>
            <Text style={{ flex: 2.5, fontSize: 8.5, color: '#6B7280' }}>{item.description}</Text>
            <Text style={{ width: 28, fontSize: 9, color: '#374151', textAlign: 'center' }}>{item.quantity}</Text>
            <Text style={{ flex: 1.2, fontSize: 9, color: '#374151', textAlign: 'right' }}>{formatRupiah(item.unit_price)}</Text>
            <Text style={{ flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1F2937', textAlign: 'right' }}>{formatRupiah(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      {/* ── PAYMENT INFO + TOTALS ── */}
      <View style={{ flexDirection: 'row', padding: '16 40 0 40' }}>
        {/* Left: Bank info */}
        <View style={{ flex: 1.2, marginRight: 20 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#5B21B6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>INFORMASI PEMBAYARAN</Text>
          {muse?.bank_name && <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ fontSize: 8.5, color: '#374151', width: 90 }}>Bank</Text>
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{muse.bank_name}</Text>
          </View>}
          {muse?.bank_holder && <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ fontSize: 8.5, color: '#374151', width: 90 }}>Nama Rekening</Text>
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{muse.bank_holder}</Text>
          </View>}
          {muse?.bank_account && <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={{ fontSize: 8.5, color: '#374151', width: 90 }}>Nomor Rekening</Text>
            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{muse.bank_account}</Text>
          </View>}
          <Text style={{ fontSize: 8, color: '#6B7280', lineHeight: 1.5 }}>
            {invoice.notes ?? 'Mohon melakukan pembayaran sebelum tanggal jatuh tempo.'}
          </Text>
        </View>
        {/* Right: Totals */}
        <View style={{ flex: 1 }}>
          {[
            { label: 'Subtotal', value: formatRupiah(invoice.subtotal), bold: false },
            ...(invoice.discount > 0 ? [{ label: 'Diskon', value: `- ${formatRupiah(invoice.discount)}`, bold: false }] : []),
            ...(invoice.tax_percent > 0 ? [{ label: `Pajak (${invoice.tax_percent}%)`, value: formatRupiah(invoice.tax_amount), bold: false }] : []),
          ].map(({ label, value }) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>{label}</Text>
              <Text style={{ fontSize: 9, color: '#374151' }}>{value}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#5B21B6' }}>TOTAL</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#5B21B6' }}>{formatRupiah(invoice.total)}</Text>
          </View>
        </View>
      </View>

      {/* ── FOOTER ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '16 40 0 40', marginTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', borderTopStyle: 'solid' }}>
        <View>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#5B21B6', fontStyle: 'italic' }}>Thank You!</Text>
          <Text style={{ fontSize: 7.5, color: '#9CA3AF', marginTop: 2 }}>{muse?.invoice_footer ?? 'Atas kepercayaan dan kerjasamanya.'}</Text>
        </View>
        {qrCode && (
          <View style={{ alignItems: 'center' }}>
            <Image src={qrCode} style={{ width: 52, height: 52 }} />
            <Text style={{ fontSize: 6, color: '#9CA3AF', marginTop: 2 }}>SCAN QR</Text>
          </View>
        )}
      </View>
    </Page>
  )
}

// ─── Template 2: FEMININ (Pink beauty, referensi kedua) ───────────────────────

function FemininPDF({ invoice, qrCode }: { invoice: any; qrCode?: string }) {
  const muse = invoice.user
  const client = invoice.client
  const items = invoice.invoice_items ?? []
  const PINK = '#C2185B'
  const PINK_LIGHT = '#FCE4EC'
  const PINK_MID = '#E91E8C'

  return (
    <Page size="A4" style={{ fontFamily: 'Helvetica', fontSize: 10, backgroundColor: '#FDF0F5', paddingBottom: 30 }}>

      {/* ── HEADER ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '28 40 8 40' }}>
        <View>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: PINK, letterSpacing: 2 }}>INVOICE</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: '#9E9E9E', marginRight: 4 }}>NO.</Text>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{invoice.invoice_number}</Text>
        </View>
      </View>

      {/* ── TITLE ── */}
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <Text style={{ fontSize: 26, fontFamily: 'Helvetica-Bold', color: PINK, letterSpacing: 0 }}>{muse?.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: 11, color: '#1F2937', letterSpacing: 3, marginHorizontal: 8 }}>✦</Text>
          <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1F2937', letterSpacing: 4 }}>WITH MUSE</Text>
          <Text style={{ fontSize: 11, color: '#1F2937', letterSpacing: 3, marginHorizontal: 8 }}>✦</Text>
        </View>
        <Text style={{ fontSize: 8.5, color: '#6B7280', marginTop: 8 }}>DATE: {formatDate(invoice.invoice_date)}</Text>
      </View>

      {/* Dotted divider */}
      <View style={{ borderTopWidth: 1.5, borderTopColor: PINK, borderTopStyle: 'dashed', marginHorizontal: 40, marginBottom: 14 }} />

      {/* ── BILL TO + THANK YOU ── */}
      <View style={{ flexDirection: 'row', padding: '0 40 14 40' }}>
        <View style={{ flex: 1, marginRight: 14 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: PINK, textTransform: 'uppercase', marginBottom: 8 }}>BILL TO:</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1F2937', marginBottom: 4 }}>{client?.name ?? '-'}</Text>
          {client?.address && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 2 }}>{client.address}</Text>}
          {client?.email && <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 2 }}>{client.email}</Text>}
          {client?.phone && <Text style={{ fontSize: 8, color: '#6B7280' }}>{client.phone}</Text>}
        </View>
        <View style={{ flex: 1, backgroundColor: PINK_LIGHT, borderRadius: 8, padding: 14 }}>
          <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: PINK, marginBottom: 6 }}>Thank You! ♥</Text>
          <Text style={{ fontSize: 8.5, color: '#555', lineHeight: 1.6 }}>
            {invoice.notes ?? `Terima kasih sudah mempercayakan kebutuhanmu kepada ${muse?.name ?? 'kami'}.`}
          </Text>
        </View>
      </View>

      {/* Dotted divider */}
      <View style={{ borderTopWidth: 1.5, borderTopColor: PINK, borderTopStyle: 'dashed', marginHorizontal: 40, marginBottom: 12 }} />

      {/* ── TABLE ── */}
      <View style={{ padding: '0 40' }}>
        <View style={{ flexDirection: 'row', paddingBottom: 8, marginBottom: 2 }}>
          <Text style={{ flex: 2.5, fontSize: 8, fontFamily: 'Helvetica-Bold', color: PINK, textTransform: 'uppercase' }}>SERVICE / ITEM</Text>
          <Text style={{ width: 32, fontSize: 8, fontFamily: 'Helvetica-Bold', color: PINK, textAlign: 'center', textTransform: 'uppercase' }}>QTY</Text>
          <Text style={{ flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: PINK, textAlign: 'right', textTransform: 'uppercase' }}>PRICE</Text>
          <Text style={{ flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: PINK, textAlign: 'right', textTransform: 'uppercase' }}>TOTAL</Text>
        </View>
        {items.map((item: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: PINK + '44', borderBottomStyle: 'dashed' }}>
            <Text style={{ flex: 2.5, fontSize: 9.5, color: '#1F2937' }}>{item.description}</Text>
            <Text style={{ width: 32, fontSize: 9.5, color: '#555', textAlign: 'center' }}>{item.quantity}</Text>
            <Text style={{ flex: 1, fontSize: 9.5, color: '#555', textAlign: 'right' }}>{formatRupiah(item.unit_price)}</Text>
            <Text style={{ flex: 1, fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: PINK, textAlign: 'right' }}>{formatRupiah(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      {/* Dotted divider */}
      <View style={{ borderTopWidth: 1.5, borderTopColor: PINK, borderTopStyle: 'dashed', marginHorizontal: 40, marginTop: 12, marginBottom: 14 }} />

      {/* ── TOTALS + PAYMENT ── */}
      <View style={{ flexDirection: 'row', padding: '0 40 14 40' }}>
        <View style={{ flex: 1, marginRight: 20 }}>
          {[
            { label: 'SUBTOTAL', value: formatRupiah(invoice.subtotal), bold: true },
            { label: 'DISCOUNT', value: `- ${formatRupiah(invoice.discount)}`, bold: false },
          ].map(({ label, value, bold }) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: PINK + '44', borderBottomStyle: 'dashed' }}>
              <Text style={{ fontSize: 9, fontFamily: bold ? 'Helvetica-Bold' : 'Helvetica', color: bold ? PINK : '#555' }}>{label}</Text>
              <Text style={{ fontSize: 9, color: '#555' }}>{value}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: PINK }}>TOTAL</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: PINK }}>{formatRupiah(invoice.total)}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: PINK, textTransform: 'uppercase', marginBottom: 8 }}>PAYMENT METHOD</Text>
          {muse?.bank_name && <Text style={{ fontSize: 9, color: '#555', marginBottom: 2 }}>Bank <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{muse.bank_name}</Text></Text>}
          {muse?.bank_holder && <Text style={{ fontSize: 9, color: '#555', marginBottom: 2 }}>a.n {muse.bank_holder}</Text>}
          {muse?.bank_account && <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{muse.bank_account}</Text>}
        </View>
      </View>

      {/* Dotted divider */}
      <View style={{ borderTopWidth: 1.5, borderTopColor: PINK, borderTopStyle: 'dashed', marginHorizontal: 40, marginBottom: 14 }} />

      {/* ── FOOTER ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0 40' }}>
        <View>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: PINK, fontStyle: 'italic' }}>Thank You! ♥</Text>
          <Text style={{ fontSize: 7.5, color: '#9CA3AF', marginTop: 4 }}>{muse?.invoice_footer ?? 'Atas kepercayaan dan kerjasamanya.'}</Text>
        </View>
        {qrCode && (
          <View style={{ alignItems: 'center' }}>
            <Image src={qrCode} style={{ width: 56, height: 56 }} />
            <Text style={{ fontSize: 7, color: '#9CA3AF', marginTop: 3, textAlign: 'center' }}>SCAN QR</Text>
          </View>
        )}
      </View>
    </Page>
  )
}

// ─── Template 3: MODERN (Clean purple modern, referensi ketiga) ───────────────

function ModernPDF({ invoice, qrCode }: { invoice: any; qrCode?: string }) {
  const muse = invoice.user
  const client = invoice.client
  const items = invoice.invoice_items ?? []
  const PURPLE = '#5B21B6'
  const initials = client?.name?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() ?? '?'

  return (
    <Page size="A4" style={{ fontFamily: 'Helvetica', fontSize: 10, backgroundColor: '#FAFAFA', paddingBottom: 30 }}>

      {/* ── HEADER ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '30 40 20 40', backgroundColor: 'white' }}>
        {/* Left: Logo */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <View style={{ width: 36, height: 36, backgroundColor: PURPLE, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: 'white' }}>m</Text>
            </View>
            <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>muse</Text>
          </View>
          {muse?.invoice_footer && <Text style={{ fontSize: 8, color: '#9CA3AF', marginLeft: 4 }}>{muse.invoice_footer}</Text>}
        </View>
        {/* Right: INVOICE */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#1F2937', letterSpacing: 1 }}>INVOICE</Text>
            <Text style={{ fontSize: 18, color: PURPLE, marginLeft: 6 }}>✦</Text>
          </View>
          <View style={{ backgroundColor: PURPLE, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 }}>
            <Text style={{ fontSize: 9, color: 'white', fontFamily: 'Helvetica-Bold' }}>{invoice.invoice_number}</Text>
          </View>
        </View>
      </View>

      {/* ── BILL TO + INFO BOX ── */}
      <View style={{ flexDirection: 'row', padding: '16 40', backgroundColor: 'white', marginBottom: 12 }}>
        {/* Left: Bill To */}
        <View style={{ flex: 1.2, marginRight: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 3, height: 14, backgroundColor: PURPLE, borderRadius: 2, marginRight: 6 }} />
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#374151', textTransform: 'uppercase', letterSpacing: 1 }}>Bill To</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ width: 40, height: 40, backgroundColor: '#EDE9FE', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: PURPLE }}>{initials}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{client?.name ?? '-'}</Text>
              {client?.company && <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 1 }}>{client.company}</Text>}
            </View>
          </View>
          {client?.address && <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 6 }}>{client.address}</Text>}
          {client?.email && <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>{client.email}</Text>}
          {client?.phone && <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>{client.phone}</Text>}
        </View>
        {/* Right: Info box */}
        <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'solid', padding: 14 }}>
          {[
            { label: 'Invoice Date', value: formatDate(invoice.invoice_date) },
            ...(invoice.due_date ? [{ label: 'Due Date', value: formatDate(invoice.due_date) }] : []),
            { label: 'Payment Method', value: muse?.bank_name ? 'Transfer Bank' : '-' },
            { label: 'Currency', value: 'IDR' },
          ].map(({ label, value }, i, arr) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6', borderBottomStyle: 'solid' }}>
              <Text style={{ flex: 1, fontSize: 8.5, color: '#6B7280' }}>{label}</Text>
              <Text style={{ fontSize: 8.5, color: '#374151' }}>:</Text>
              <Text style={{ flex: 1, fontSize: 8.5, color: '#1F2937', fontFamily: 'Helvetica-Bold', marginLeft: 8 }}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── TABLE ── */}
      <View style={{ margin: '0 40', backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'solid' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#F9FAFB', padding: '10 14', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', borderBottomStyle: 'solid' }}>
          <Text style={{ width: 26, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151', textTransform: 'uppercase' }}>NO.</Text>
          <Text style={{ flex: 2.5, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151', textTransform: 'uppercase' }}>DESCRIPTION</Text>
          <Text style={{ width: 30, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151', textAlign: 'center', textTransform: 'uppercase' }}>QTY</Text>
          <Text style={{ flex: 1.2, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151', textAlign: 'right', textTransform: 'uppercase' }}>UNIT PRICE</Text>
          <Text style={{ flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151', textAlign: 'right', textTransform: 'uppercase' }}>AMOUNT</Text>
        </View>
        {items.map((item: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: '11 14', borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6', borderBottomStyle: 'solid' }}>
            <Text style={{ width: 26, fontSize: 9, color: '#6B7280' }}>{i + 1}</Text>
            <View style={{ flex: 2.5 }}>
              <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>{item.description}</Text>
            </View>
            <Text style={{ width: 30, fontSize: 9.5, color: '#374151', textAlign: 'center' }}>{item.quantity}</Text>
            <Text style={{ flex: 1.2, fontSize: 9.5, color: '#6B7280', textAlign: 'right' }}>{formatRupiah(item.unit_price)}</Text>
            <Text style={{ flex: 1, fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#1F2937', textAlign: 'right' }}>{formatRupiah(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      {/* ── THANK YOU + TOTALS ── */}
      <View style={{ flexDirection: 'row', padding: '14 40' }}>
        {/* Thank You box */}
        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 8, padding: 14, marginRight: 14, borderLeftWidth: 4, borderLeftColor: PURPLE, borderLeftStyle: 'solid' }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: PURPLE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>THANK YOU!</Text>
          <Text style={{ fontSize: 8.5, color: '#6B7280', lineHeight: 1.6 }}>
            {invoice.notes ?? `Terima kasih atas kepercayaan Anda kepada ${muse?.name ?? ''}.`.replace(/ \.$/, '.')}
          </Text>
        </View>
        {/* Totals */}
        <View style={{ flex: 1 }}>
          {[
            { label: 'SUBTOTAL', value: formatRupiah(invoice.subtotal) },
            ...(invoice.discount > 0 ? [{ label: `DISCOUNT`, value: `- ${formatRupiah(invoice.discount)}`, purple: true }] : []),
            ...(invoice.tax_percent > 0 ? [{ label: `DISCOUNT (${invoice.tax_percent}%)`, value: `- ${formatRupiah(invoice.tax_amount)}`, purple: true }] : []),
          ].map(({ label, value, purple }) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
              <Text style={{ fontSize: 8.5, color: purple ? PURPLE : '#6B7280', fontFamily: purple ? 'Helvetica-Bold' : 'Helvetica' }}>{label}</Text>
              <Text style={{ fontSize: 8.5, color: purple ? PURPLE : '#374151' }}>{value}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1F2937' }}>TOTAL</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: PURPLE }}>{formatRupiah(invoice.total)}</Text>
          </View>
        </View>
      </View>

      {/* ── FOOTER ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '12 40 0 40', borderTopWidth: 1, borderTopColor: '#E5E7EB', borderTopStyle: 'solid', backgroundColor: 'white', marginTop: 4 }}>
        <View>
          <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: PURPLE, fontStyle: 'italic' }}>Thank You!</Text>
          <Text style={{ fontSize: 7.5, color: '#9CA3AF', marginTop: 2 }}>{muse?.invoice_footer ?? 'Atas kepercayaan dan kerjasamanya.'}</Text>
        </View>
        {qrCode && (
          <View style={{ alignItems: 'center' }}>
            <Image src={qrCode} style={{ width: 54, height: 54 }} />
            <Text style={{ fontSize: 6.5, color: '#9CA3AF', marginTop: 3 }}>Scan untuk lihat invoice</Text>
          </View>
        )}
      </View>
    </Page>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function InvoicePDF({ invoice, template = 'modern', qrCode }: {
  invoice: any
  template?: InvoiceTemplate
  qrCode?: string
}) {
  const TemplateComponent = {
    profesional: ProfesionalPDF,
    feminin: FemininPDF,
    modern: ModernPDF,
  }[template] ?? ModernPDF

  return (
    <Document>
      <TemplateComponent invoice={invoice} qrCode={qrCode} />
    </Document>
  )
}
