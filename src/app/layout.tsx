import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'Muse Invoice',
  description: 'Aplikasi invoicing untuk muse & model profesional',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7C3AED',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={nunito.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
          }}
        />
      </body>
    </html>
  )
}
