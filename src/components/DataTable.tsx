import type { ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'

export interface Columna<T> {
  clave: string
  titulo: ReactNode
  render: (fila: T, indice: number) => ReactNode
  ancho?: string
  alinear?: 'left' | 'right' | 'center'
}

export interface Paginacion {
  pagina: number
  totalPaginas: number
  totalElementos: number
  tamano: number
  onPagina: (pagina: number) => void
  onTamano?: (tamano: number) => void
}

interface Props<T> {
  columnas: Columna<T>[]
  filas: T[]
  claveFila: (fila: T) => string | number
  cargando?: boolean
  vacio?: ReactNode
  acciones?: (fila: T) => ReactNode
  /** Si se entrega, aparece una columna con botones subir/bajar. */
  onReordenar?: (indiceOrigen: number, indiceDestino: number) => void
  reordenarDeshabilitado?: boolean
  claseFila?: (fila: T) => string | undefined
  paginacion?: Paginacion
}

/**
 * Tabla genérica. El orden se cambia con botones subir/bajar en vez de arrastrar: funciona con
 * teclado y en pantallas táctiles, y no requiere librería. Cuando hay paginación, el reorden
 * solo opera dentro de la página visible (el backend recibe la lista completa de ids de la página).
 */
export function DataTable<T>({
  columnas,
  filas,
  claveFila,
  cargando,
  vacio = 'Sin registros.',
  acciones,
  onReordenar,
  reordenarDeshabilitado,
  claseFila,
  paginacion,
}: Props<T>) {
  const totalColumnas = columnas.length + (acciones ? 1 : 0) + (onReordenar ? 1 : 0)

  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            {onReordenar && <th style={{ width: 80 }}>Orden</th>}
            {columnas.map((c) => (
              <th key={c.clave} style={{ width: c.ancho, textAlign: c.alinear }}>
                {c.titulo}
              </th>
            ))}
            {acciones && <th className="texto-derecha">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {cargando && filas.length === 0 && (
            <tr>
              <td colSpan={totalColumnas} className="tabla-vacia">
                Cargando…
              </td>
            </tr>
          )}
          {!cargando && filas.length === 0 && (
            <tr>
              <td colSpan={totalColumnas} className="tabla-vacia">
                {vacio}
              </td>
            </tr>
          )}
          {filas.map((fila, i) => (
            <tr key={claveFila(fila)} className={claseFila?.(fila)}>
              {onReordenar && (
                <td className="orden-celda">
                  <span className="orden-botones">
                    <button
                      type="button"
                      className="boton boton-fantasma boton-icono"
                      aria-label="Subir"
                      disabled={reordenarDeshabilitado || i === 0}
                      onClick={() => onReordenar(i, i - 1)}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="boton boton-fantasma boton-icono"
                      aria-label="Bajar"
                      disabled={reordenarDeshabilitado || i === filas.length - 1}
                      onClick={() => onReordenar(i, i + 1)}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </span>
                </td>
              )}
              {columnas.map((c) => (
                <td key={c.clave} style={{ textAlign: c.alinear }}>
                  {c.render(fila, i)}
                </td>
              ))}
              {acciones && <td className="acciones">{acciones(fila)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {paginacion && paginacion.totalElementos > 0 && (
        <div className="tabla-pie">
          <span>
            {paginacion.totalElementos} registro{paginacion.totalElementos === 1 ? '' : 's'}
            {paginacion.onTamano && (
              <>
                {' · '}
                <select
                  value={paginacion.tamano}
                  onChange={(e) => paginacion.onTamano?.(Number(e.target.value))}
                  aria-label="Registros por página"
                >
                  {[25, 50, 100, 200].map((n) => (
                    <option key={n} value={n}>
                      {n} por página
                    </option>
                  ))}
                </select>
              </>
            )}
          </span>
          <span className="paginacion">
            <button
              type="button"
              className="boton boton-fantasma boton-icono"
              aria-label="Página anterior"
              disabled={paginacion.pagina <= 0}
              onClick={() => paginacion.onPagina(paginacion.pagina - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Página {paginacion.pagina + 1} de {Math.max(paginacion.totalPaginas, 1)}
            </span>
            <button
              type="button"
              className="boton boton-fantasma boton-icono"
              aria-label="Página siguiente"
              disabled={paginacion.pagina + 1 >= paginacion.totalPaginas}
              onClick={() => paginacion.onPagina(paginacion.pagina + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </span>
        </div>
      )}
    </div>
  )
}
