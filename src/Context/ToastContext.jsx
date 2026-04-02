import { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const STYLES = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d', icon: <Check size={11} /> },
    error: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', icon: <X size={11} /> },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706', icon: <AlertTriangle size={11} /> },
    info: { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb', icon: <Info size={11} /> },
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }, [])

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2 pointer-events-none">
                    {toasts.map(t => {
                        const s = STYLES[t.type] ?? STYLES.success
                        return (
                            <div
                                key={t.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold pointer-events-auto anim-slide-down"
                                style={{
                                    background: s.bg,
                                    borderColor: s.border,
                                    color: s.text,
                                    minWidth: '220px',
                                    maxWidth: '360px',
                                }}
                            >
                                <span
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 text-white"
                                    style={{ backgroundColor: s.border }}
                                >
                                    {s.icon}
                                </span>
                                <span className="flex-1 leading-snug">{t.message}</span>
                                <button
                                    onClick={() => dismiss(t.id)}
                                    className="text-xs opacity-50 hover:opacity-100 transition-opacity flex-shrink-0 ml-1"
                                ><X size={12} /></button>
                            </div>
                        )
                    })}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
    return ctx
}
