import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

// Format angka ke Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal ke bahasa Indonesia
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: id })
}

// Format tanggal pendek
export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy')
}

// Generate invoice number: INV-20240601-001
export function generateInvoiceNumber(prefix: string, lastNumber: number): string {
  const date = format(new Date(), 'yyyyMMdd')
  const seq = String(lastNumber + 1).padStart(3, '0')
  return `${prefix}-${date}-${seq}`
}

// Hitung subtotal dari items
export function calculateSubtotal(items: { quantity: number; unit_price: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
}

// Hitung total dengan pajak dan diskon
export function calculateTotal(subtotal: number, taxPercent: number, discount: number): {
  tax_amount: number
  total: number
} {
  const tax_amount = subtotal * (taxPercent / 100)
  const total = subtotal + tax_amount - discount
  return { tax_amount, total }
}

// WhatsApp share link
export function getWhatsAppLink(phone: string, invoiceUrl: string, invoiceNumber: string, total: number): string {
  const message = encodeURIComponent(
    `Halo, berikut invoice ${invoiceNumber} dengan total ${formatRupiah(total)}.\n\nSilakan lihat invoice di: ${invoiceUrl}`
  )
  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62')
  return `https://wa.me/${cleanPhone}?text=${message}`
}

// Merge class names (Tailwind)
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Status badge color
export function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-600'
}

export function getScheduleStatusColor(status: string): string {
  const colors: Record<string, string> = {
    tentative: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-600'
}

export function getInvoiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Terkirim',
    paid: 'Lunas',
    overdue: 'Jatuh Tempo',
    cancelled: 'Dibatalkan',
  }
  return labels[status] ?? status
}

export function getScheduleStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    tentative: 'Tentatif',
    confirmed: 'Terkonfirmasi',
    done: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return labels[status] ?? status
}
