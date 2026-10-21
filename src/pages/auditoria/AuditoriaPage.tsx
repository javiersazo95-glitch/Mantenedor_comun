import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type Columna } from '@/components/DataTable'
import { QueryError } from '@/components/QueryError'
import { useAuditoria } from '@/hooks/useAuditoria'
import { formatearFecha } from '@/utils/format'
import type { FiltroAuditoria, RegistroAuditoria } from '@/types/auditoria'

export function AuditoriaPage() {
  const [filtro, setFiltro] = useState<FiltroAuditoria>({})
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(null)
  const auditoria = useAuditoria(filtro, { page: pagina, size: 25 })

  function setF<K extends keyof FiltroAuditoria>(k: K, v: FiltroAuditoria[K]) {
    setFiltro((f) => ({ ...f, [k]: v || undefined }))
    setPagina(0)
  }

  const columnas: Columna<RegistroAuditoria>[] = [
    { clave: 'fecha', titulo: 'Fecha', render: (r) => <span className="nowrap texto-pequeno">{formatearFecha(r.fecha)}</span> },
    { clave: 'accion', titulo: 'Acción', render: (r) => <span className="mono">{r.accion}</span> },
    { clave: 'detalle', titulo: 'Detalle', render: (r) => r.detalle ?? <span className="texto-suave">—</span> },
    { clave: 'usuario', titulo: 'Quién', render: (r) => r.usuarioNombre ?? <span className="texto-suave">Sistema</span> },
    {
      clave: 'cambios',
      titulo: 'Antes / después',
      render: (r) =>
        r.estadoAnterior || r.estadoSiguiente ? (
          <div>
            <button type="button" className="boton boton-fantasma boton-pequeno" onClick={() => setAbierto(abierto === r.id ? null : r.id)}>
              {abierto === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {abierto === r.id ? 'Ocultar' : 'Ver'}
            </button>
            {abierto === r.id && (
              <div className="formulario-fila" style={{ marginTop: 6 }}>
                <pre className="json-preview" style={{ maxHeight: 240 }}>
                  {JSON.stringify(r.estadoAnterior ?? {}, null, 2)}
                </pre>
                <pre className="json-preview" style={{ maxHeight: 240 }}>
                  {JSON.stringify(r.estadoSiguiente ?? {}, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <span className="texto-suave">—</span>
        ),
    },
  ]

  return (
    <>
      <PageHeader titulo="Auditoría" descripcion="Todo lo que se cambió desde el mantenedor: quién, cuándo, qué había antes y qué quedó." />

      <div className="barra-filtros">
        <label className="campo">
          <span>Acción</span>
          <input value={filtro.accion ?? ''} onChange={(e) => setF('accion', e.target.value)} placeholder="PARAMETRO_CAMBIAR" className="mono" />
        </label>
        <label className="campo">
          <span>Desde</span>
          <input type="date" value={filtro.desde ?? ''} onChange={(e) => setF('desde', e.target.value)} />
        </label>
        <label className="campo">
          <span>Hasta</span>
          <input type="date" value={filtro.hasta ?? ''} onChange={(e) => setF('hasta', e.target.value)} />
        </label>
      </div>

      {auditoria.isError && <QueryError error={auditoria.error} onReintentar={() => void auditoria.refetch()} />}
      <DataTable
        columnas={columnas}
        filas={auditoria.data?.content ?? []}
        claveFila={(r) => r.id}
        cargando={auditoria.isLoading}
        vacio="Sin registros para ese filtro."
        paginacion={{
          pagina: auditoria.data?.currentPage ?? pagina,
          totalPaginas: auditoria.data?.totalPages ?? 0,
          totalElementos: auditoria.data?.totalElements ?? 0,
          tamano: 25,
          onPagina: setPagina,
        }}
      />
    </>
  )
}
