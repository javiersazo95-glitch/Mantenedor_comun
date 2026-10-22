import { useCallback, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCheck, ChevronRight, FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { DataTable, type Columna } from '@/components/DataTable'
import { mover } from '@/utils/mover'
import { Badge, BadgeActivo } from '@/components/Badge'
import { Toggle } from '@/components/Toggle'
import { QueryError } from '@/components/QueryError'
import { IconoCatalogo } from '@/components/IconoCatalogo'
import { useActivarCatalogo, useCatalogoItem, useCatalogoLista, useReordenarCatalogo, useRevisarMarca } from '@/hooks/useCatalogo'
import { formatearFecha } from '@/utils/format'
import { CatalogoForm } from './CatalogoForm'
import { QuitarDialog } from './CatalogoDialogos'
import {
  CAPACIDADES,
  TIPOS_CON_HIJOS,
  TIPO_CATALOGO_LABEL,
  type Categoria,
  type FilaCatalogo,
  type MarcaRepuesto,
  type Subcategoria,
  type TipoCatalogo,
} from '@/types/catalogos'

type FiltroActivo = 'todos' | 'activos' | 'inactivos'

const TIPO_PADRE: Partial<Record<TipoCatalogo, TipoCatalogo>> = { modelos: 'marcas-vehiculo', subcategorias: 'categorias' }

export function CatalogoPage({ tipo }: { tipo: TipoCatalogo }) {
  const { padreId: padreIdParam } = useParams()
  const padreId = padreIdParam ? Number(padreIdParam) : undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const etiquetas = TIPO_CATALOGO_LABEL[tipo]
  const cap = CAPACIDADES[tipo]
  const hijos = TIPOS_CON_HIJOS[tipo]
  const tipoPadre = TIPO_PADRE[tipo]

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>('todos')
  const pendientes = tipo === 'marcas-repuesto' && searchParams.get('pendientes') === '1'
  const [pagina, setPagina] = useState(0)
  const [tamano, setTamano] = useState(50)
  const [editando, setEditando] = useState<FilaCatalogo | null | 'nuevo'>(null)
  const [quitando, setQuitando] = useState<FilaCatalogo | null>(null)

  const filtro = useMemo(
    () => ({ q, activo: filtroActivo === 'todos' ? undefined : filtroActivo === 'activos', padreId, pendientes }),
    [q, filtroActivo, padreId, pendientes],
  )
  const lista = useCatalogoLista(tipo, filtro, { page: pagina, size: tamano, sort: 'orden,asc' })
  const padre = useCatalogoItem(tipoPadre ?? tipo, tipoPadre && padreId ? padreId : null)
  const activar = useActivarCatalogo(tipo)
  const reordenar = useReordenarCatalogo(tipo)
  const revisar = useRevisarMarca()

  const filas = useMemo(() => lista.data?.content ?? [], [lista.data])
  const puedeReordenar = !q && !pendientes

  const onReordenar = useCallback(
    (origen: number, destino: number) => {
      const nuevo = mover(filas, origen, destino)
      reordenar.mutate(nuevo.map((f) => f.id))
    },
    [filas, reordenar],
  )

  const columnas: Columna<FilaCatalogo>[] = [
    ...(cap.icono || cap.imagen
      ? [
          {
            clave: 'icono',
            titulo: cap.icono ? 'Ícono' : 'Imagen',
            ancho: '56px',
            render: (f: FilaCatalogo) => (
              <IconoCatalogo
                iconoUrl={cap.icono ? f.iconoUrl : ((f as Categoria | Subcategoria).imagenUrl ?? null)}
                iconoNombre={tipo === 'categorias' ? (f as Categoria).iconoNombre : null}
                color={f.color}
              />
            ),
          },
        ]
      : []),
    {
      clave: 'nombre',
      titulo: 'Nombre',
      render: (f) => (
        <div>
          <span className="nombre-fila">
            {f.color && <span className="muestra-color" style={{ background: f.color }} />}
            <strong>{f.nombre}</strong>
          </span>
          <div className="fila-meta">
            <span className="mono">{f.slug}</span>
            {tipo === 'categorias' && (f as Categoria).familia && <span>familia: {(f as Categoria).familia}</span>}
            {tipo === 'marcas-repuesto' && (f as MarcaRepuesto).calidadReferencial && <span>{(f as MarcaRepuesto).calidadReferencial}</span>}
          </div>
        </div>
      ),
    },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (f) => (
        <span className="campo-inline">
          <BadgeActivo activo={f.activo} />
          {f.destacada && <Badge tono="ambar">Destacada</Badge>}
          {tipo === 'marcas-repuesto' && (f as MarcaRepuesto).origen === 'VENDEDOR' && !(f as MarcaRepuesto).revisada && (
            <Badge tono="violeta" title="La creó un vendedor al cargar inventario">
              Sin revisar
            </Badge>
          )}
        </span>
      ),
    },
    { clave: 'actualizado', titulo: 'Actualizado', render: (f) => <span className="texto-suave texto-pequeno nowrap">{formatearFecha(f.updatedAt)}</span> },
  ]

  return (
    <>
      <PageHeader
        titulo={
          padre.data ? (
            <span className="campo-inline">
              <Link to={`/catalogos/${tipoPadre}`}>{TIPO_CATALOGO_LABEL[tipoPadre ?? tipo].plural}</Link>
              <ChevronRight size={16} className="texto-suave" />
              {padre.data.nombre}
              <ChevronRight size={16} className="texto-suave" />
              {etiquetas.plural}
            </span>
          ) : (
            etiquetas.plural
          )
        }
        descripcion={descripcionDe(tipo)}
        acciones={
          <button type="button" className="boton boton-primario" onClick={() => setEditando('nuevo')}>
            <Plus size={16} /> Nueva {etiquetas.singular.toLowerCase()}
          </button>
        }
      />

      <div className="barra-filtros">
        <SearchInput
          valorInicial={q}
          onCambio={(v) => {
            setQ(v)
            setPagina(0)
          }}
          placeholder={`Buscar ${etiquetas.plural.toLowerCase()}…`}
        />
        {(['todos', 'activos', 'inactivos'] as FiltroActivo[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`chip-filtro${filtroActivo === f ? ' activo' : ''}`}
            onClick={() => {
              setFiltroActivo(f)
              setPagina(0)
            }}
          >
            {f === 'todos' ? 'Todas' : f === 'activos' ? 'Activas' : 'Inactivas'}
          </button>
        ))}
        {tipo === 'marcas-repuesto' && (
          <button
            type="button"
            className={`chip-filtro${pendientes ? ' activo' : ''}`}
            onClick={() => {
              setSearchParams(pendientes ? {} : { pendientes: '1' })
              setPagina(0)
            }}
          >
            Creadas por vendedores sin revisar
          </button>
        )}
      </div>

      {lista.isError && <QueryError error={lista.error} onReintentar={() => void lista.refetch()} />}

      <DataTable
        columnas={columnas}
        filas={filas}
        claveFila={(f) => f.id}
        cargando={lista.isLoading}
        vacio={q ? 'Nada coincide con la búsqueda.' : `Todavía no hay ${etiquetas.plural.toLowerCase()}.`}
        claseFila={(f) => (f.activo ? undefined : 'fila-inactiva')}
        onReordenar={puedeReordenar ? onReordenar : undefined}
        reordenarDeshabilitado={reordenar.isPending}
        paginacion={{
          pagina: lista.data?.currentPage ?? pagina,
          totalPaginas: lista.data?.totalPages ?? 0,
          totalElementos: lista.data?.totalElements ?? 0,
          tamano,
          onPagina: setPagina,
          onTamano: (t) => {
            setTamano(t)
            setPagina(0)
          },
        }}
        acciones={(f) => (
          <span className="campo-inline" style={{ justifyContent: 'flex-end' }}>
            <Toggle checked={f.activo} onChange={(v) => activar.mutate({ id: f.id, activo: v })} ariaLabel={`${f.activo ? 'Desactivar' : 'Activar'} ${f.nombre}`} title={f.activo ? 'Desactivar' : 'Activar'} disabled={activar.isPending} />
            {tipo === 'marcas-repuesto' && (f as MarcaRepuesto).origen === 'VENDEDOR' && !(f as MarcaRepuesto).revisada && (
              <button type="button" className="boton boton-fantasma boton-icono" title="Marcar como revisada" aria-label="Marcar como revisada" onClick={() => revisar.mutate(f.id)}>
                <CheckCheck size={16} />
              </button>
            )}
            {hijos && (
              <Link to={`/catalogos/${tipo}/${f.id}/${hijos.hijo}`} className="boton boton-fantasma boton-icono" title={TIPO_CATALOGO_LABEL[hijos.hijo].plural} aria-label={TIPO_CATALOGO_LABEL[hijos.hijo].plural}>
                <FolderTree size={16} />
              </Link>
            )}
            <button type="button" className="boton boton-fantasma boton-icono" title="Editar" aria-label="Editar" onClick={() => setEditando(f)}>
              <Pencil size={16} />
            </button>
            <button type="button" className="boton boton-fantasma boton-icono" title="Quitar" aria-label="Quitar" onClick={() => setQuitando(f)}>
              <Trash2 size={16} />
            </button>
          </span>
        )}
      />

      {!puedeReordenar && filas.length > 0 && <p className="texto-suave texto-pequeno" style={{ marginTop: 8 }}>Para reordenar, limpia la búsqueda y los filtros especiales.</p>}

      {editando !== null && (
        <CatalogoForm
          key={editando === 'nuevo' ? 'nuevo' : editando.id}
          tipo={tipo}
          abierto
          fila={editando === 'nuevo' ? null : editando}
          padreId={padreId}
          onCerrar={() => setEditando(null)}
        />
      )}
      {quitando && <QuitarDialog tipo={tipo} fila={quitando} padreId={padreId} onCerrar={() => setQuitando(null)} />}
    </>
  )
}

function descripcionDe(tipo: TipoCatalogo): string {
  switch (tipo) {
    case 'categorias':
      return 'Categorías técnicas de repuestos con su ícono, color, imagen y familia. Desactivar una categoría la oculta en todos los clientes sin despublicar productos.'
    case 'subcategorias':
      return 'Subcategorías de la categoría seleccionada. El Market muestra la imagen en el megamenú y en el catálogo.'
    case 'marcas-repuesto':
      return 'Marcas de repuesto. Las que crean los vendedores al cargar inventario llegan como "sin revisar"; márcalas como destacadas para que aparezcan con logo en los clientes.'
    case 'marcas-vehiculo':
      return 'Marcas de vehículo con su logo. El orden define cómo se listan en los selectores de la app, el market y el panel.'
    case 'modelos':
      return 'Modelos de la marca seleccionada.'
  }
}
