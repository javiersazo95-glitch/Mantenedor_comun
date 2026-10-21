import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useConfigVersion } from '@/hooks/useBootstrapPreview'
import { useCatalogoLista } from '@/hooks/useCatalogo'
import { useFlags } from '@/hooks/useFlags'
import { useListas } from '@/hooks/useListas'
import { useAuditoria } from '@/hooks/useAuditoria'
import { formatearFecha } from '@/utils/format'
import { CLIENTE_LABEL } from '@/types/comun'

export function DashboardPage() {
  const version = useConfigVersion()
  const pendientes = useCatalogoLista('marcas-repuesto', { pendientes: true }, { page: 0, size: 1 })
  const flags = useFlags()
  const listas = useListas()
  const auditoria = useAuditoria({}, { page: 0, size: 10 })

  const flagsApagados = (flags.data ?? []).filter((f) => !f.habilitado)

  return (
    <>
      <PageHeader
        titulo="Inicio"
        descripcion="Estado general de la configuración publicada. Todo lo que cambies aquí se refleja en la app, el market, el panel vendedor y el backoffice sin desplegar código."
      />

      <div className="grid-tarjetas">
        <div className="tarjeta kpi">
          <span className="kpi-valor mono">{version.data ?? '…'}</span>
          <span className="kpi-etiqueta">Versión de configuración publicada</span>
        </div>
        <Link to="/catalogos/marcas-repuesto?pendientes=1" className="tarjeta kpi" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="kpi-valor" style={{ color: pendientes.data?.totalElements ? 'var(--color-aviso)' : undefined }}>
            {pendientes.data?.totalElements ?? '…'}
          </span>
          <span className="kpi-etiqueta">Marcas creadas por vendedores sin revisar</span>
        </Link>
        <Link to="/visibilidad" className="tarjeta kpi" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="kpi-valor">{flags.data ? flagsApagados.length : '…'}</span>
          <span className="kpi-etiqueta">Componentes ocultos por flag</span>
        </Link>
        <Link to="/listas" className="tarjeta kpi" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="kpi-valor">{listas.data?.length ?? '…'}</span>
          <span className="kpi-etiqueta">Listas de opciones configurables</span>
        </Link>
      </div>

      {flagsApagados.length > 0 && (
        <div className="grupo">
          <div className="grupo-titulo">
            <AlertTriangle size={16} className="texto-suave" />
            <h2>Componentes ocultos ahora mismo</h2>
          </div>
          <div className="lista-filas">
            {flagsApagados.map((f) => (
              <div className="fila" key={f.id}>
                <div>
                  <span className="mono">{f.clave}</span>
                  <div className="fila-desc">
                    {f.descripcion} · {CLIENTE_LABEL[f.cliente]}
                  </div>
                </div>
                <Link to="/visibilidad" className="boton boton-fantasma boton-pequeno">
                  Ver <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grupo">
        <div className="grupo-titulo">
          <h2>Últimos cambios</h2>
          <Link to="/auditoria" className="texto-pequeno">
            Ver auditoría completa
          </Link>
        </div>
        <div className="lista-filas">
          {auditoria.isLoading && <div className="fila texto-suave">Cargando…</div>}
          {auditoria.data?.content.length === 0 && <div className="fila texto-suave">Todavía no hay cambios registrados.</div>}
          {auditoria.data?.content.map((r) => (
            <div className="fila" key={r.id}>
              <div>
                <strong>{r.accion}</strong> <span className="texto-suave">{r.detalle}</span>
                <div className="fila-meta">
                  <span>{r.usuarioNombre ?? 'Sistema'}</span>
                  <span>·</span>
                  <span>{formatearFecha(r.fecha)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
