import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Lock, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type Columna } from '@/components/DataTable'
import { mover } from '@/utils/mover'
import { Badge, BadgeActivo } from '@/components/Badge'
import { Toggle } from '@/components/Toggle'
import { FormModal } from '@/components/FormModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ColorField } from '@/components/ColorField'
import { esColorValido } from '@/utils/validators'
import { ClientesMultiPicker } from '@/components/ClientePicker'
import { parsearClientes } from '@/utils/clientes'
import { JsonField } from '@/components/JsonField'
import { IconUploader } from '@/components/IconUploader'
import { IconoCatalogo } from '@/components/IconoCatalogo'
import { QueryError } from '@/components/QueryError'
import { useActivarOpcion, useEliminarOpcion, useGuardarOpcion, useLista, useListaOpciones, useReordenarOpciones } from '@/hooks/useListas'
import { useIconos } from '@/hooks/useIconos'
import { CLIENTE_LABEL } from '@/types/comun'
import type { ListaOpcion, ListaOpcionFormulario } from '@/types/listas'

export function ListaOpcionesPage() {
  const { codigo = '' } = useParams()
  const lista = useLista(codigo)
  const opciones = useListaOpciones(codigo)
  const activar = useActivarOpcion(codigo)
  const reordenar = useReordenarOpciones(codigo)
  const eliminar = useEliminarOpcion(codigo)
  const [editando, setEditando] = useState<ListaOpcion | null | 'nuevo'>(null)
  const [eliminando, setEliminando] = useState<ListaOpcion | null>(null)

  const sistema = lista.data?.sistema ?? false
  const filas = useMemo(() => opciones.data ?? [], [opciones.data])

  const onReordenar = useCallback(
    (origen: number, destino: number) => {
      reordenar.mutate(mover(filas, origen, destino).map((o) => o.id))
    },
    [filas, reordenar],
  )

  const columnas: Columna<ListaOpcion>[] = [
    { clave: 'icono', titulo: 'Ícono', ancho: '56px', render: (o) => <IconoCatalogo iconoUrl={o.iconoUrl} color={o.color} /> },
    {
      clave: 'etiqueta',
      titulo: 'Etiqueta',
      render: (o) => (
        <div>
          <span className="nombre-fila">
            {o.color && <span className="muestra-color" style={{ background: o.color }} />}
            <strong>{o.etiqueta}</strong>
            {o.esDefault && (
              <Badge tono="ambar" title="Opción preseleccionada">
                <Star size={11} /> default
              </Badge>
            )}
          </span>
          <div className="fila-meta">
            <span className="mono">{o.valor}</span>
            {o.descripcion && <span>{o.descripcion}</span>}
          </div>
        </div>
      ),
    },
    {
      clave: 'clientes',
      titulo: 'Clientes',
      render: (o) => <span className="texto-pequeno">{parsearClientes(o.clientes).map((c) => CLIENTE_LABEL[c]).join(', ')}</span>,
    },
    {
      clave: 'metadata',
      titulo: 'Metadata',
      render: (o) => (o.metadata ? <code className="texto-pequeno">{JSON.stringify(o.metadata)}</code> : <span className="texto-suave">—</span>),
    },
    { clave: 'estado', titulo: 'Estado', render: (o) => <BadgeActivo activo={o.activo} /> },
  ]

  return (
    <>
      <PageHeader
        titulo={
          <span className="campo-inline">
            <Link to="/listas">Listas</Link>
            <ChevronRight size={16} className="texto-suave" />
            {lista.data?.nombre ?? codigo}
            {sistema && (
              <Badge tono="gris">
                <Lock size={11} /> sistema
              </Badge>
            )}
          </span>
        }
        descripcion={
          sistema
            ? `${lista.data?.descripcion ?? ''} Esta lista la valida el backend: puedes ocultar, renombrar, reordenar y cambiar ícono o color, pero no agregar ni eliminar valores. Debe quedar al menos una opción visible.`
            : lista.data?.descripcion ?? 'Opciones que ven los clientes en este desplegable.'
        }
        acciones={
          !sistema && (
            <button type="button" className="boton boton-primario" onClick={() => setEditando('nuevo')}>
              <Plus size={16} /> Nueva opción
            </button>
          )
        }
      />

      {opciones.isError && <QueryError error={opciones.error} onReintentar={() => void opciones.refetch()} />}

      <DataTable
        columnas={columnas}
        filas={filas}
        claveFila={(o) => o.id}
        cargando={opciones.isLoading}
        claseFila={(o) => (o.activo ? undefined : 'fila-inactiva')}
        onReordenar={onReordenar}
        reordenarDeshabilitado={reordenar.isPending}
        acciones={(o) => (
          <span className="campo-inline" style={{ justifyContent: 'flex-end' }}>
            <Toggle checked={o.activo} onChange={(v) => activar.mutate({ id: o.id, activo: v })} ariaLabel={`${o.activo ? 'Ocultar' : 'Mostrar'} ${o.etiqueta}`} title={o.activo ? 'Ocultar' : 'Mostrar'} disabled={activar.isPending} />
            <button type="button" className="boton boton-fantasma boton-icono" title="Editar" aria-label="Editar" onClick={() => setEditando(o)}>
              <Pencil size={16} />
            </button>
            {!sistema && (
              <button type="button" className="boton boton-fantasma boton-icono" title="Eliminar" aria-label="Eliminar" onClick={() => setEliminando(o)}>
                <Trash2 size={16} />
              </button>
            )}
          </span>
        )}
      />

      {editando !== null && (
        <OpcionForm key={editando === 'nuevo' ? 'nuevo' : editando.id} codigo={codigo} sistema={sistema} opcion={editando === 'nuevo' ? null : editando} onCerrar={() => setEditando(null)} />
      )}

      <ConfirmDialog
        abierto={eliminando !== null}
        titulo="Eliminar opción"
        peligro
        textoConfirmar="Eliminar"
        mensaje={
          <p>
            Se eliminará <strong>{eliminando?.etiqueta}</strong> de la lista. Si solo quieres que deje de verse, usa el interruptor de visibilidad.
          </p>
        }
        onCancelar={() => setEliminando(null)}
        onConfirmar={async () => {
          if (eliminando) await eliminar.mutateAsync(eliminando.id)
          setEliminando(null)
        }}
      />
    </>
  )
}

/** Se monta con `key` por opción: el estado inicial se toma una sola vez. */
function OpcionForm({ codigo, sistema, opcion, onCerrar }: { codigo: string; sistema: boolean; opcion: ListaOpcion | null; onCerrar: () => void }) {
  const guardar = useGuardarOpcion(codigo)
  const iconos = useIconos(opcion ? { tipo: 'lista-opcion', id: opcion.id } : null)
  const [form, setForm] = useState<ListaOpcionFormulario>(() => desdeOpcion(opcion))
  const [jsonValido, setJsonValido] = useState(true)

  function set<K extends keyof ListaOpcionFormulario>(k: K, v: ListaOpcionFormulario[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function onGuardar() {
    if (!form.etiqueta.trim()) throw new Error('La etiqueta es obligatoria.')
    if (!form.valor.trim()) throw new Error('El valor es obligatorio.')
    if (!esColorValido(form.color)) throw new Error('El color debe tener formato #rrggbb.')
    if (!jsonValido) throw new Error('Corrige la metadata JSON antes de guardar.')
    await guardar.mutateAsync({ id: opcion?.id ?? null, cuerpo: { ...form, etiqueta: form.etiqueta.trim(), valor: form.valor.trim() } })
    onCerrar()
  }

  const valorBloqueado = opcion !== null || sistema

  return (
    <FormModal abierto titulo={opcion ? 'Editar opción' : 'Nueva opción'} onCerrar={onCerrar} onGuardar={onGuardar} ancho>
      <div className="formulario-fila">
        <label className="campo">
          <span>Etiqueta (lo que ve el usuario)</span>
          <input value={form.etiqueta} onChange={(e) => set('etiqueta', e.target.value)} required autoFocus />
        </label>
        <label className="campo">
          <span>Valor {valorBloqueado && <span className="texto-suave">(no editable)</span>}</span>
          <input className="mono" value={form.valor} disabled={valorBloqueado} onChange={(e) => set('valor', e.target.value)} />
          <span className="campo-ayuda">Es lo que se guarda en la base de datos; no cambia aunque cambies la etiqueta.</span>
        </label>
      </div>
      <label className="campo">
        <span>Descripción (ayuda contextual)</span>
        <input value={form.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value || null)} />
      </label>
      <div className="formulario-fila">
        <label className="campo">
          <span>Orden</span>
          <input type="number" value={form.orden ?? 0} onChange={(e) => set('orden', Number(e.target.value))} />
        </label>
        <ColorField valor={form.color ?? null} onCambio={(v) => set('color', v)} />
      </div>
      <ClientesMultiPicker valor={form.clientes ?? 'TODOS'} onCambio={(csv) => set('clientes', csv)} />
      <JsonField
        valor={form.metadata ?? null}
        onCambio={(v, valido) => {
          set('metadata', v)
          setJsonValido(valido)
        }}
        ayuda='Datos extra que usan los clientes, por ejemplo {"trackingUrl": "https://..."} en couriers o {"codigoBci": "001"} en bancos.'
      />
      <div className="campo-inline" style={{ gap: 24 }}>
        <Toggle checked={!!form.esDefault} onChange={(v) => set('esDefault', v)} etiqueta="Opción por defecto" />
        <Toggle checked={form.activo !== false} onChange={(v) => set('activo', v)} etiqueta="Visible" />
      </div>
      {opcion && (
        <IconUploader
          urlActual={opcion.iconoUrl}
          ocupado={iconos.ocupado}
          onSubir={(archivo) => iconos.subir.mutateAsync({ campo: 'icono', archivo }).then(() => undefined)}
          onQuitar={() => iconos.quitar.mutateAsync({ campo: 'icono' }).then(() => undefined)}
        />
      )}
    </FormModal>
  )
}

function desdeOpcion(o: ListaOpcion | null): ListaOpcionFormulario {
  return {
    valor: o?.valor ?? '',
    etiqueta: o?.etiqueta ?? '',
    descripcion: o?.descripcion ?? null,
    orden: o?.orden ?? 0,
    activo: o?.activo ?? true,
    esDefault: o?.esDefault ?? false,
    color: o?.color ?? null,
    metadata: o?.metadata ?? null,
    clientes: o?.clientes ?? 'TODOS',
  }
}
