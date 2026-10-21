import { Link } from 'react-router-dom'
import { ChevronRight, Lock } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { QueryError } from '@/components/QueryError'
import { useListas } from '@/hooks/useListas'
import { parsearClientes } from '@/utils/clientes'
import { CLIENTE_LABEL } from '@/types/comun'

export function ListasPage() {
  const listas = useListas()

  return (
    <>
      <PageHeader
        titulo="Listas de opciones"
        descripcion="Opciones de los desplegables de los cuatro clientes: condición del producto, garantías, couriers, métodos de envío, bancos, motivos, combustibles y más. Oculta, renombra o reordena sin tocar código."
      />
      {listas.isError && <QueryError error={listas.error} onReintentar={() => void listas.refetch()} />}
      <div className="lista-filas">
        {listas.isLoading && <div className="fila texto-suave">Cargando…</div>}
        {listas.data?.map((l) => (
          <Link key={l.codigo} to={`/listas/${l.codigo}`} className="fila" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div>
              <span className="campo-inline">
                <strong>{l.nombre}</strong>
                <span className="mono texto-suave texto-pequeno">{l.codigo}</span>
                {l.sistema && (
                  <Badge tono="gris" title="El backend valida estos valores: solo se pueden ocultar o renombrar">
                    <Lock size={11} /> sistema
                  </Badge>
                )}
              </span>
              {l.descripcion && <div className="fila-desc">{l.descripcion}</div>}
              <div className="fila-meta">
                {typeof l.opcionesActivas === 'number' && typeof l.totalOpciones === 'number' && (
                  <span>
                    {l.opcionesActivas} de {l.totalOpciones} opciones visibles
                  </span>
                )}
                <span>{parsearClientes(l.clientes).map((c) => CLIENTE_LABEL[c]).join(', ')}</span>
              </div>
            </div>
            <ChevronRight size={18} className="texto-suave" />
          </Link>
        ))}
      </div>
    </>
  )
}
