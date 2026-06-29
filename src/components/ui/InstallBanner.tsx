'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share } from 'lucide-react'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Sudah standalone (sudah diinstall)
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((window.navigator as any).standalone === true) return

    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    // Deteksi iOS Safari
    const ua = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)

    if (isIOSDevice && isSafari) {
      setIsIOS(true)
      setShow(true)
      return
    }

    // Android / Desktop: tunggu beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleInstall() {
    if (!prompt) return
    prompt.prompt()
    prompt.userChoice.then(() => {
      setShow(false)
      localStorage.setItem('pwa-banner-dismissed', '1')
    })
  }

  function handleDismiss() {
    localStorage.setItem('pwa-banner-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  if (isIOS) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl px-4 py-3.5 shadow-xl"
        style={{ background: '#1C1033', border: '1px solid rgba(124,58,237,0.4)' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#7C3AED' }}>
            <span className="text-white font-black text-[16px]">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white">Install Muse di iPhone</p>
            <p className="text-[11px] text-purple-300 mt-1 leading-relaxed">
              Tap <span className="font-bold text-white">􀈂 Share</span> → pilih <span className="font-bold text-white">"Add to Home Screen"</span>
            </p>
          </div>
          <button onClick={handleDismiss} className="text-purple-400 flex-shrink-0 mt-0.5">
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-2 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)', border: '1px solid #DDD6FE' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#7C3AED' }}>
        <Download size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#4C1D95]">Install Muse</p>
        <p className="text-[11px] text-[#6D28D9] mt-0.5">Akses lebih cepat tanpa browser</p>
      </div>
      <button onClick={handleInstall}
        className="text-[12px] font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0"
        style={{ background: '#7C3AED' }}>
        Install
      </button>
      <button onClick={handleDismiss} className="text-[#9CA3AF] flex-shrink-0">
        <X size={15} />
      </button>
    </div>
  )
}
