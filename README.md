# Muse Invoice

Aplikasi invoicing untuk muse/model profesional. Multi-user, mobile-friendly, lengkap dengan PDF export dan laporan harian.

## Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (mobile-first)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel (auto-deploy dari GitHub)
- **PDF**: @react-pdf/renderer
- **Email**: Resend

## Cara Setup (dari nol)

### 1. Clone & install

```bash
git clone https://github.com/USERNAME/muse-invoice.git
cd muse-invoice
npm install
```

### 2. Buat akun (semua gratis)

- [Supabase](https://supabase.com) → buat project baru
- [Vercel](https://vercel.com) → connect GitHub repo
- [Resend](https://resend.com) → untuk kirim email invoice (opsional)

### 3. Setup environment variables

Copy `.env.example` jadi `.env.local` lalu isi:

```bash
cp .env.example .env.local
```

### 4. Jalankan migrasi database

Di Supabase Dashboard → SQL Editor, paste isi file `supabase/migrations/001_init.sql`

### 5. Jalankan di local

```bash
npm run dev
```

Buka http://localhost:3000

---

## Workflow Git (deploy otomatis)

```bash
# Setelah coding di local:
git add .
git commit -m "feat: tambah fitur X"
git push origin main
# → Vercel otomatis deploy dalam ~30 detik
```

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/          # Login, register
│   ├── dashboard/       # Halaman utama
│   ├── clients/         # Manajemen klien
│   ├── invoices/        # Invoice list + buat baru
│   ├── schedules/       # Jadwal booking
│   ├── reports/         # Laporan harian
│   ├── settings/        # Rate card, profil
│   └── api/             # API endpoints
├── components/
│   ├── ui/              # Button, Card, Modal, dll
│   ├── invoice/         # Komponen PDF invoice
│   └── dashboard/       # Widget dashboard
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── pdf.ts           # Generate PDF
│   └── email.ts         # Kirim email
└── types/               # TypeScript types
```

## Fitur MVP

- [x] Multi-user dengan isolasi data per muse
- [x] Manajemen klien
- [x] Rate card / paket harga
- [x] Setup jadwal booking
- [x] Buat & download invoice PDF
- [x] Share invoice via link / email / WhatsApp
- [x] Tandai lunas / belum
- [x] Laporan harian & rekap pendapatan
