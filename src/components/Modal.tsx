import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  pie,
  ancho,
}: {
  abierto: boolean
  titulo: ReactNode
  onCerrar: () => void
  children: ReactNode
  pie?: ReactNode
  ancho?: boolean
}) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className={`modal${ancho ? ' modal-ancho' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button type="button" className="boton boton-fantasma boton-icono" onClick={onCerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
        {pie && <div className="modal-pie">{pie}</div>}
      </div>
    </div>
  )
}
