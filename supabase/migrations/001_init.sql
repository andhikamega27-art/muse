-- =============================================
-- MUSE INVOICE - Database Schema
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: profiles (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  bank_account TEXT,
  bank_name TEXT,
  bank_holder TEXT,
  signature_url TEXT,
  logo_url TEXT,
  invoice_prefix TEXT DEFAULT 'INV',
  invoice_footer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: clients
-- =============================================
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: rate_cards (paket harga)
-- =============================================
CREATE TABLE rate_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'job',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: schedules (jadwal booking)
-- =============================================
CREATE TABLE schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  job_type TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('tentative', 'confirmed', 'done', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: invoices
-- =============================================
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_percent DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  pdf_url TEXT,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, invoice_number)
);

-- =============================================
-- TABLE: invoice_items
-- =============================================
CREATE TABLE invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  rate_card_id UUID REFERENCES rate_cards(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0
);

-- =============================================
-- TABLE: daily_reports (auto-generated / manual)
-- =============================================
CREATE TABLE daily_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  report_date DATE NOT NULL,
  total_jobs INTEGER DEFAULT 0,
  total_income DECIMAL(15, 2) DEFAULT 0,
  total_paid DECIMAL(15, 2) DEFAULT 0,
  total_unpaid DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, report_date)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Setiap muse hanya bisa lihat data sendiri
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Clients
CREATE POLICY "Users can CRUD own clients" ON clients
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Rate cards
CREATE POLICY "Users can CRUD own rate_cards" ON rate_cards
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Schedules
CREATE POLICY "Users can CRUD own schedules" ON schedules
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Invoices
CREATE POLICY "Users can CRUD own invoices" ON invoices
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Invoice items (via invoice ownership)
CREATE POLICY "Users can CRUD own invoice_items" ON invoice_items
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

-- Daily reports
CREATE POLICY "Users can CRUD own daily_reports" ON daily_reports
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow public read of invoice via share_token (untuk link invoice)
CREATE POLICY "Public can view invoice by share_token" ON invoices
  FOR SELECT USING (share_token IS NOT NULL);

-- =============================================
-- TRIGGER: Auto-create profile saat register
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TRIGGER: Auto-update invoice subtotal
-- =============================================
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(15, 2);
  v_tax_amount DECIMAL(15, 2);
  v_total DECIMAL(15, 2);
  v_tax_percent DECIMAL(5, 2);
  v_discount DECIMAL(15, 2);
BEGIN
  SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
  FROM invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  SELECT tax_percent, discount INTO v_tax_percent, v_discount
  FROM invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  v_tax_amount := v_subtotal * (COALESCE(v_tax_percent, 0) / 100);
  v_total := v_subtotal + v_tax_amount - COALESCE(v_discount, 0);

  UPDATE invoices SET
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total = v_total,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_items_changed
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();
