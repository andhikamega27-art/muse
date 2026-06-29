'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Sudah diinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // iOS Safari
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as any).standalone
    setIsIOS(ios)
    if (ios) {
      const dismissed = sessionStorage.getItem('pwa-dismissed')
      if (!dismissed) setShow(true)
      return
    }

    // Android / Desktop Chrome
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
      const dismissed = sessionStorage.getItem('pwa-dismissed')
      if (!dismissed) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleInstall() {
    if (prompt) {
      prompt.prompt()
      prompt.userChoice.then(() => setShow(false))
    }
  }

  function handleDismiss() {
    sessionStorage.setItem('pwa-dismissed', '1')
    setShow(false)
  }

  if (isInstalled || !show) return null

  return (
    <div className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)', border: '1px solid #DDD6FE' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#7C3AED' }}>
        <Download size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        {isIOS ? (
          <>
            <p className="text-[13px] font-bold text-[#4C1D95]">Install Muse di iPhone</p>
            <p className="text-[11px] text-[#6D28D9] mt-0.5">Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-bold text-[#4C1D95]">Install Muse di perangkat ini</p>
            <p className="text-[11px] text-[#6D28D9] mt-0.5">Akses lebih cepat tanpa browser</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isIOS && (
          <button onClick={handleInstall}
            className="text-[12px] font-bold px-3 py-1.5 rounded-xl text-white"
            style={{ background: '#7C3AED' }}>
            Install
          </button>
        )}
        <button onClick={handleDismiss} className="text-[#9CA3AF]">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
