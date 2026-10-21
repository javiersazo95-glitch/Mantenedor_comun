import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type Columna } from '@/components/DataTable'
import { Badge, type TonoBadge } from '@/components/Badge'
import { QueryError } from '@/components/QueryError'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useCancelarProgramado, useHistorialParametro, useParametro } from '@/hooks/useParametros'
import { formatearFecha, formatearValorParametro } from '@/utils/format'
import type { EstadoHistorial, ParametroHistorial } from '@/types/parametros'

const TONO: Record<EstadoHistorial, TonoBadge> = { APLICADO: 'verde', PROGRAMADO: 'ambar', CANCELADO: 'gris' }

export function ParametroHistorialPage() {
  const { clave = '' } = useParams()
  const parametro = useParametro(clave)
  const [pagina, setPagina] = useState(0)
  const historial = useHistorialParametro(clave, { page: pagina, size: 25 })
  const cancelar = useCancelarProgramado(clave)
  const [cancelando, setCancelando] = useState<ParametroHistorial | null>(null)

  const p = parametro.data
  const fmt = (v: string | null) => (v === null || !p ? '—' : formatearValorParametro(v, p.tipo, p.unidad))

  const columnas: Columna<ParametroHistorial>[] = [
    { clave: 'fecha', titulo: 'Registrado', render: (h) => <span className="nowrap texto-pequeno">{formatearFecha(h.fecha)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (h) => <Badge tono={TONO[h.estado]}>{h.estado.toLowerCase()}</Badge> },
    { clave: 'anterior', titulo: 'Valor anterior', render: (h) => <span className="texto-suave">{fmt(h.valorAnterior)}</span> },
    { clave: 'nuevo', titulo: 'Valor nuevo', render: (h) => <strong>{fmt(h.valorNuevo)}</strong> },
    { clave: 'vigente', titulo: 'Vigente desde', render: (h) => <span className="nowrap texto-pequeno">{formatearFecha(h.vigenteDesde)}</span> },
    { clave: 'usuario', titulo: 'Quién', render: (h) => h.usuarioNombre ?? <span className="texto-suave">Sistema</span> },
    { clave: 'motivo', titulo: 'Motivo', render: (h) => h.motivo ?? <span className="texto-suave">—</span> },
  ]

  return (
    <>
      <PageHeader
        titulo={
          <span className="campo-inline">
            <Link to="/parametros">Parámetros</Link>
            <ChevronRight size={16} className="texto-suave" />
            {p?.descripcion ?? clave}
          </span>
        }
        descripcion={
          p && (
            <>
              <span className="mono">{p.clave}</span> · vigente ahora: <strong>{formatearValorParametro(p.valor, p.tipo, p.unidad)}</strong>
            </>
          )
        }
      />
      {historial.isError && <QueryError error={historial.error} onReintentar={() => void historial.refetch()} />}
      <DataTable
        columnas={columnas}
        filas={historial.data?.content ?? []}
        claveFila={(h) => h.id}
        cargando={historial.isLoading}
        vacio="Sin cambios registrados."
        paginacion={{
          pagina: historial.data?.currentPage ?? pagina,
          totalPaginas: historial.data?.totalPages ?? 0,
          totalElementos: historial.data?.totalElements ?? 0,
          tamano: 25,
          onPagina: setPagina,
        }}
        acciones={(h) =>
          h.estado === 'PROGRAMADO' ? (
            <button type="button" className="boton boton-fantasma boton-pequeno" onClick={() => setCancelando(h)}>
              <XCircle size={14} /> Cancelar
            </button>
          ) : null
        }
      />
      <ConfirmDialog
        abierto={cancelando !== null}
        titulo="Cancelar cambio programado"
        peligro
        textoConfirmar="Cancelar el cambio"
        mensaje={<p>El valor {fmt(cancelando?.valorNuevo ?? null)} programado para {formatearFecha(cancelando?.vigenteDesde)} no se aplicará.</p>}
        onCancelar={() => setCancelando(null)}
        onConfirmar={async () => {
          if (cancelando) await cancelar.mutateAsync(cancelando.id)
          setCancelando(null)
        }}
      />
    </>
  )
}
