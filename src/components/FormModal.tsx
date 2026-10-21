import { useState, type FormEvent, type ReactNode } from 'react'
import { Modal } from './Modal'
import { mensajeDeError } from '@/api/client'

/**
 * Modal con formulario: maneja el envío, el estado "guardando" y muestra el error del backend
 * dentro del modal (no en un toast que desaparece) para que el usuario pueda corregir.
 */
export function FormModal({
  abierto,
  titulo,
  onCerrar,
  onGuardar,
  children,
  textoGuardar = 'Guardar',
  ancho,
  deshabilitado,
}: {
  abierto: boolean
  titulo: ReactNode
  onCerrar: () => void
  onGuardar: () => Promise<void>
  children: ReactNode
  textoGuardar?: string
  ancho?: boolean
  deshabilitado?: boolean
}) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await onGuardar()
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar.'))
    } finally {
      setGuardando(false)
    }
  }

  function cerrar() {
    setError(null)
    onCerrar()
  }

  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={cerrar} ancho={ancho}>
      <form className="formulario" onSubmit={onSubmit} noValidate>
        {children}
        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}
        <div className="formulario-acciones">
          <button type="button" className="boton boton-secundario" onClick={cerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="boton boton-primario" disabled={guardando || deshabilitado}>
            {guardando ? 'Guardando…' : textoGuardar}
          </button>
        </div>
      </form>
    </Modal>
  )
}
