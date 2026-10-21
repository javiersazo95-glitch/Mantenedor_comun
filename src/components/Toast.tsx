import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

type TipoToast = 'info' | 'exito' | 'error'

interface Toast {
  id: number
  texto: string
  tipo: TipoToast
}

interface ToastContextValue {
  mostrar: (texto: string, tipo?: TipoToast) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Acceso sin hook, para código que no está dentro de React (hooks de react-query definidos
 * fuera de componentes, interceptores). Lo registra el provider al montar.
 */
let mostrarGlobal: ToastContextValue['mostrar'] | null = null

export function showToast(texto: string, tipo: TipoToast = 'info') {
  mostrarGlobal?.(texto, tipo)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const contador = useRef(0)

  const mostrar = useCallback((texto: string, tipo: TipoToast = 'info') => {
    const id = ++contador.current
    setToasts((actuales) => [...actuales, { id, texto, tipo }])
    window.setTimeout(() => {
      setToasts((actuales) => actuales.filter((t) => t.id !== id))
    }, tipo === 'error' ? 6000 : 3500)
  }, [])

  useEffect(() => {
    mostrarGlobal = mostrar
    return () => {
      mostrarGlobal = null
    }
  }, [mostrar])

  const value = useMemo(() => ({ mostrar }), [mostrar])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`} role={t.tipo === 'error' ? 'alert' : 'status'}>
            {t.tipo === 'error' ? <AlertCircle size={16} /> : t.tipo === 'exito' ? <CheckCircle2 size={16} /> : <Info size={16} />}
            <span>{t.texto}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
