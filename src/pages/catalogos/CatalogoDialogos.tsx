import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { useActivarCatalogo, useCatalogoLista, useEliminarCatalogo, useReasignarCatalogo, useReferencias } from '@/hooks/useCatalogo'
import { mensajeDeError } from '@/api/client'
import { TIPO_CATALOGO_LABEL, type FilaCatalogo, type TipoCatalogo } from '@/types/catalogos'

/**
 * Diálogo de "quitar". Muestra cuántos productos, hijos y compatibilidades referencian la fila y
 * ofrece tres salidas: desactivar (soft delete, lo normal), reasignar los productos a otra fila y
 * luego desactivar, o eliminar físicamente (solo cuando no hay referencias).
 */
export function QuitarDialog({
  tipo,
  fila,
  padreId,
  onCerrar,
}: {
  tipo: TipoCatalogo
  fila: FilaCatalogo | null
  padreId?: number
  onCerrar: () => void
}) {
  const referencias = useReferencias(tipo, fila?.id ?? null)
  const activar = useActivarCatalogo(tipo)
  const reasignar = useReasignarCatalogo(tipo)
  const eliminar = useEliminarCatalogo(tipo)
  const destinos = useCatalogoLista(tipo, { activo: true, padreId }, { page: 0, size: 500, sort: 'nombre,asc' })
  const [destinoId, setDestinoId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  if (!fila) return null

  const ref = referencias.data
  const total = ref ? ref.productos + ref.hijos + ref.compatibilidades : null
  const sinReferencias = total === 0
  const ocupado = activar.isPending || reasignar.isPending || eliminar.isPending
  const etiqueta = TIPO_CATALOGO_LABEL[tipo].singular.toLowerCase()

  async function ejecutar(fn: () => Promise<unknown>) {
    setError(null)
    try {
      await fn()
      onCerrar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <Modal abierto titulo={`Quitar ${etiqueta}: ${fila.nombre}`} onCerrar={onCerrar}>
      <div className="formulario">
        {referencias.isLoading && <p className="texto-suave">Contando referencias…</p>}
        {ref && (
          <div className="mensaje-info">
            Referencias actuales: <strong>{ref.productos}</strong> productos, <strong>{ref.hijos}</strong>{' '}
            {tipo === 'marcas-vehiculo' ? 'modelos' : tipo === 'categorias' ? 'subcategorías' : 'hijos'}, <strong>{ref.compatibilidades}</strong> compatibilidades.
          </div>
        )}

        <section>
          <h3>Desactivar</h3>
          <p className="texto-suave">
            Deja de mostrarse en desplegables, filtros y catálogos de los cuatro clientes. Los productos que ya la usan siguen
            publicados y puedes reactivarla cuando quieras.
          </p>
          <button type="button" className="boton boton-primario" style={{ marginTop: 8 }} disabled={ocupado || !fila.activo} onClick={() => void ejecutar(() => activar.mutateAsync({ id: fila.id, activo: false }))}>
            {fila.activo ? 'Desactivar' : 'Ya está inactiva'}
          </button>
        </section>

        {ref && ref.productos > 0 && (
          <section>
            <h3>Reasignar productos y desactivar</h3>
            <p className="texto-suave">Mueve los {ref.productos} productos a otra {etiqueta} activa en una sola operación.</p>
            <div className="campo-inline" style={{ marginTop: 8 }}>
              <select value={destinoId} onChange={(e) => setDestinoId(e.target.value ? Number(e.target.value) : '')} aria-label="Destino">
                <option value="">Elige destino…</option>
                {(destinos.data?.content ?? [])
                  .filter((d) => d.id !== fila.id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="boton boton-secundario"
                disabled={ocupado || destinoId === ''}
                onClick={() =>
                  void ejecutar(async () => {
                    await reasignar.mutateAsync({ id: fila.id, destinoId: destinoId as number })
                    if (fila.activo) await activar.mutateAsync({ id: fila.id, activo: false })
                  })
                }
              >
                Reasignar y desactivar
              </button>
            </div>
          </section>
        )}

        <section>
          <h3>Eliminar definitivamente</h3>
          <p className="texto-suave">
            {sinReferencias
              ? 'No tiene referencias: se puede borrar de la base de datos. No se puede deshacer.'
              : 'Solo es posible cuando no quedan productos, hijos ni compatibilidades asociados.'}
          </p>
          <button type="button" className="boton boton-peligro" style={{ marginTop: 8 }} disabled={ocupado || !sinReferencias} onClick={() => void ejecutar(() => eliminar.mutateAsync(fila.id))}>
            Eliminar
          </button>
        </section>

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
