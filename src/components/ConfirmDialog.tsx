import { useState, type ReactNode } from 'react'
import { Modal } from './Modal'

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligro,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar?: string
  peligro?: boolean
  onConfirmar: () => Promise<void> | void
  onCancelar: () => void
}) {
  const [ocupado, setOcupado] = useState(false)

  async function confirmar() {
    setOcupado(true)
    try {
      await onConfirmar()
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      onCerrar={onCancelar}
      pie={
        <>
          <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={ocupado}>
            Cancelar
          </button>
          <button
            type="button"
            className={`boton ${peligro ? 'boton-peligro' : 'boton-primario'}`}
            onClick={() => void confirmar()}
            disabled={ocupado}
          >
            {ocupado ? 'Procesando…' : textoConfirmar}
          </button>
        </>
      }
    >
      <div>{mensaje}</div>
    </Modal>
  )
}
