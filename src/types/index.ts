// =============================================
// Database Types - sesuai schema Supabase
// =============================================

export type InvoiceTemplate = 'profesional' | 'feminin' | 'modern'

export type UserProfile = {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  bank_account?: string
  bank_name?: string
  bank_holder?: string
  avatar_url?: string
  signature_url?: string
  logo_url?: string
  invoice_prefix: string
  invoice_footer?: string
  invoice_template?: InvoiceTemplate
  kop_surat_url?: string
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  user_id: string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type RateCard = {
  id: string
  user_id: string
  name: string
  description?: string
  price: number
  unit: string
  is_active: boolean
  created_at: string
}

export type ScheduleStatus = 'tentative' | 'confirmed' | 'done' | 'cancelled'

export type Schedule = {
  id: string
  user_id: string
  client_id?: string
  title: string
  schedule_date: string
  start_time?: string
  end_time?: string
  location?: string
  job_type?: string
  status: ScheduleStatus
  notes?: string
  created_at: string
  updated_at: string
  // joined
  client?: Client
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export type Invoice = {
  id: string
  user_id: string
  client_id?: string
  schedule_id?: string
  invoice_number: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_percent: number
  tax_amount: number
  discount: number
  total: number
  status: InvoiceStatus
  notes?: string
  pdf_url?: string
  share_token: string
  paid_at?: string
  created_at: string
  updated_at: string
  // joined
  client?: Client
  invoice_items?: InvoiceItem[]
}

export type InvoiceItem = {
  id: string
  invoice_id: string
  rate_card_id?: string
  description: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type DailyReport = {
  id: string
  user_id: string
  report_date: string
  total_jobs: number
  total_income: number
  total_paid: number
  total_unpaid: number
  notes?: string
  created_at: string
}

// =============================================
// Form Types
// =============================================

export type InvoiceFormData = {
  client_id: string
  schedule_id?: string
  invoice_date: string
  due_date?: string
  tax_percent: number
  discount: number
  notes?: string
  items: {
    rate_card_id?: string
    description: string
    quantity: number
    unit_price: number
  }[]
}

export type ClientFormData = {
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}

export type ScheduleFormData = {
  title: string
  client_id?: string
  schedule_date: string
  start_time?: string
  end_time?: string
  location?: string
  job_type?: string
  status: ScheduleStatus
  notes?: string
}

export type RateCardFormData = {
  name: string
  description?: string
  price: number
  unit: string
  is_active: boolean
}
