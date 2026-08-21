import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from './ui'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastCtx {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastCtx | undefined>(undefined)

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-emerald-500" />,
  error: <AlertCircle className="size-5 text-red-500" />,
  info: <Info className="size-5 text-brand-500" />
}

const accents: Record<ToastType, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-brand-500'
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++nextId.current
    setToasts((ts) => [...ts.slice(-4), { id, type, message }])
    setTimeout(() => dismiss(id), 4500)
  }, [dismiss])

  const ctx = React.useMemo<ToastCtx>(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m)
  }), [push])

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={cn(
                'animate-slide-in-right pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 border-l-4 bg-white p-3.5 shadow-lg shadow-slate-900/10',
                'dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30',
                accents[t.type]
              )}
            >
              <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
              <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded p-0.5 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
