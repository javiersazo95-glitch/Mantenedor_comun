import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Pencil, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { FormModal } from '@/components/FormModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { QueryError } from '@/components/QueryError'
import { useCambiarParametro, useParametros, useRestaurarDefault } from '@/hooks/useParametros'
import { entradaDesdeValor, formatearFecha, formatearValorParametro, normalizarEntradaParametro } from '@/utils/format'
import { GRUPO_LABEL, type Parametro } from '@/types/parametros'

export function ParametrosPage() {
  const parametros = useParametros()
  const restaurar = useRestaurarDefault()
  const [editando, setEditando] = useState<Parametro | null>(null)
  const [restaurando, setRestaurando] = useState<Parametro | null>(null)

  const grupos = useMemo(() => {
    const mapa = new Map<string, Parametro[]>()
    for (const p of parametros.data ?? []) {
      const lista = mapa.get(p.grupo) ?? []
      lista.push(p)
      mapa.set(p.grupo, lista)
    }
    return [...mapa.entries()]
  }, [parametros.data])

  return (
    <>
      <PageHeader
        titulo="Parámetros"
        descripcion="Comisiones, tasas de pasarela, plazos y topes del negocio. Cada cambio queda en el historial con quién lo hizo y por qué; puedes programarlo para una fecha futura. Los pedidos ya creados conservan la tasa con la que se crearon."
      />
      {parametros.isError && <QueryError error={parametros.error} onReintentar={() => void parametros.refetch()} />}
      {parametros.isLoading && <p className="texto-suave">Cargando…</p>}

      {grupos.map(([grupo, lista]) => (
        <section className="grupo" key={grupo}>
          <div className="grupo-titulo">
            <h2>{GRUPO_LABEL[grupo] ?? grupo}</h2>
          </div>
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Valor vigente</th>
                  <th>Por defecto</th>
                  <th>Vigente desde</th>
                  <th className="texto-derecha">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => {
                  const modificado = p.valor !== p.valorDefault
                  return (
                    <tr key={p.clave}>
                      <td>
                        <div>
                          <strong>{p.descripcion}</strong>
                          <div className="fila-meta">
                            <span className="mono">{p.clave}</span>
                            {p.publico && (
                              <Badge tono="azul" title="Los clientes lo reciben en el bootstrap">
                                público
                              </Badge>
                            )}
                            {!p.editable && <Badge tono="gris">solo lectura</Badge>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: modificado ? 'var(--color-primario)' : undefined }}>{formatearValorParametro(p.valor, p.tipo, p.unidad)}</strong>
                      </td>
                      <td className="texto-suave">{formatearValorParametro(p.valorDefault, p.tipo, p.unidad)}</td>
                      <td className="texto-suave texto-pequeno nowrap">
                        {formatearFecha(p.vigenteDesde)}
                        {p.updatedBy && <div>por {p.updatedBy}</div>}
                      </td>
                      <td className="acciones">
                        <Link to={`/parametros/${p.clave}/historial`} className="boton boton-fantasma boton-icono" title="Historial" aria-label="Historial">
                          <History size={16} />
                        </Link>
                        {p.editable && modificado && (
                          <button type="button" className="boton boton-fantasma boton-icono" title="Restaurar valor por defecto" aria-label="Restaurar valor por defecto" onClick={() => setRestaurando(p)}>
                            <RotateCcw size={16} />
                          </button>
                        )}
                        {p.editable && (
                          <button type="button" className="boton boton-fantasma boton-icono" title="Cambiar" aria-label="Cambiar" onClick={() => setEditando(p)}>
                            <Pencil size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {editando && <CambioParametroModal key={editando.clave} parametro={editando} onCerrar={() => setEditando(null)} />}

      <ConfirmDialog
        abierto={restaurando !== null}
        titulo="Restaurar valor por defecto"
        textoConfirmar="Restaurar"
        mensaje={
          restaurando && (
            <p>
              <strong>{restaurando.descripcion}</strong> volverá a {formatearValorParametro(restaurando.valorDefault, restaurando.tipo, restaurando.unidad)} de inmediato.
            </p>
          )
        }
        onCancelar={() => setRestaurando(null)}
        onConfirmar={async () => {
          if (restaurando) await restaurar.mutateAsync(restaurando.clave)
          setRestaurando(null)
        }}
      />
    </>
  )
}

/** Se monta con `key` por clave: el estado inicial se toma una sola vez. */
export function CambioParametroModal({ parametro: p, onCerrar }: { parametro: Parametro; onCerrar: () => void }) {
  const cambiar = useCambiarParametro()
  const [valor, setValor] = useState(() => entradaDesdeValor(p.valor, p.tipo))
  const [motivo, setMotivo] = useState('')
  const [programar, setProgramar] = useState(false)
  const [vigenteDesde, setVigenteDesde] = useState('')

  async function onGuardar() {
    if (!motivo.trim()) throw new Error('Indica el motivo del cambio: queda en el historial.')
    const normalizado = normalizarEntradaParametro(valor, p.tipo, p.minimo, p.maximo)
    if (normalizado === p.valor) throw new Error('El valor es igual al vigente.')
    let iso: string | undefined
    if (programar) {
      if (!vigenteDesde) throw new Error('Indica la fecha y hora de vigencia.')
      const fecha = new Date(vigenteDesde)
      if (Number.isNaN(fecha.getTime())) throw new Error('Fecha inválida.')
      if (fecha.getTime() <= Date.now()) throw new Error('La fecha programada debe ser futura.')
      iso = fecha.toISOString()
    }
    await cambiar.mutateAsync({ clave: p.clave, cambio: { valor: normalizado, motivo: motivo.trim(), vigenteDesde: iso } })
    onCerrar()
  }

  return (
    <FormModal abierto titulo={`Cambiar: ${p.descripcion}`} onCerrar={onCerrar} onGuardar={onGuardar} textoGuardar={programar ? 'Programar cambio' : 'Aplicar ahora'}>
      <p className="texto-suave">
        <span className="mono">{p.clave}</span> · vigente: <strong>{formatearValorParametro(p.valor, p.tipo, p.unidad)}</strong> · por defecto:{' '}
        {formatearValorParametro(p.valorDefault, p.tipo, p.unidad)}
        {(p.minimo !== null || p.maximo !== null) && (
          <>
            {' '}
            · rango permitido: {p.minimo ?? '−∞'} a {p.maximo ?? '∞'}
          </>
        )}
      </p>

      <label className="campo">
        <span>Nuevo valor{p.tipo === 'PERCENT' ? ' (en %)' : p.unidad ? ` (${p.unidad})` : ''}</span>
        {p.tipo === 'BOOLEAN' ? (
          <select value={valor} onChange={(e) => setValor(e.target.value)}>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        ) : p.tipo === 'JSON' ? (
          <textarea className="mono" value={valor} onChange={(e) => setValor(e.target.value)} rows={6} />
        ) : (
          <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode={p.tipo === 'STRING' ? 'text' : 'decimal'} autoFocus />
        )}
        {p.tipo === 'PERCENT' && <span className="campo-ayuda">Escribe 7 para 7 %, 2,89 para 2,89 %.</span>}
      </label>

      <label className="campo">
        <span>Motivo</span>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: fin de la marcha blanca" required />
      </label>

      <div className="campo-inline">
        <input type="checkbox" id="programar" checked={programar} onChange={(e) => setProgramar(e.target.checked)} />
        <label htmlFor="programar">Programar para una fecha futura</label>
      </div>
      {programar && (
        <label className="campo">
          <span>Vigente desde</span>
          <input type="datetime-local" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} />
          <span className="campo-ayuda">Hasta esa fecha sigue el valor actual. Puedes cancelarlo desde el historial.</span>
        </label>
      )}

      {p.grupo === 'COMISION' && (
        <p className="mensaje-aviso">
          Afecta solo a los pedidos que se creen desde la vigencia. Los pedidos anteriores conservan la tasa con la que se crearon.
        </p>
      )}
    </FormModal>
  )
}
