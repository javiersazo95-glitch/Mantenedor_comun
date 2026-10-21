import { useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Toggle } from '@/components/Toggle'
import { Badge } from '@/components/Badge'
import { FormModal } from '@/components/FormModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { JsonField } from '@/components/JsonField'
import { ClientePicker } from '@/components/ClientePicker'
import { QueryError } from '@/components/QueryError'
import { useCrearFlag, useEditarFlag, useEliminarFlag, useFlags } from '@/hooks/useFlags'
import { useBootstrapPreview } from '@/hooks/useBootstrapPreview'
import { CLIENTES, CLIENTE_LABEL, type Cliente } from '@/types/comun'
import { clienteDeClave, type FeatureFlag, type FeatureFlagFormulario } from '@/types/flags'
import { CLAVE_FLAG } from '@/utils/validators'

export function VisibilidadPage() {
  const [cliente, setCliente] = useState<Cliente>('MARKET')
  const flags = useFlags()
  const editar = useEditarFlag()
  const eliminar = useEliminarFlag()
  const [editando, setEditando] = useState<FeatureFlag | null | 'nuevo'>(null)
  const [eliminando, setEliminando] = useState<FeatureFlag | null>(null)

  /** Flags del cliente elegido más los globales (TODOS), agrupados. */
  const grupos = useMemo(() => {
    const visibles = (flags.data ?? []).filter((f) => f.cliente === cliente || (cliente !== 'TODOS' && f.cliente === 'TODOS'))
    const mapa = new Map<string, FeatureFlag[]>()
    for (const f of visibles) {
      const l = mapa.get(f.grupo) ?? []
      l.push(f)
      mapa.set(f.grupo, l)
    }
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [flags.data, cliente])

  return (
    <>
      <PageHeader
        titulo="Visibilidad por cliente"
        descripcion="Muestra u oculta componentes, secciones y entradas de menú de cada cliente. Un flag apagado se refleja en menos de un minuto; si no existe, el cliente usa su valor por defecto."
        acciones={
          <button type="button" className="boton boton-primario" onClick={() => setEditando('nuevo')}>
            <Plus size={16} /> Nuevo flag
          </button>
        }
      />

      <div className="pestanas" role="tablist">
        {CLIENTES.map((c) => (
          <button key={c} type="button" role="tab" aria-selected={cliente === c} className={`pestana${cliente === c ? ' activa' : ''}`} onClick={() => setCliente(c)}>
            {CLIENTE_LABEL[c]}
          </button>
        ))}
      </div>

      {flags.isError && <QueryError error={flags.error} onReintentar={() => void flags.refetch()} />}

      <div className="dos-columnas">
        <div>
          {flags.isLoading && <p className="texto-suave">Cargando…</p>}
          {!flags.isLoading && grupos.length === 0 && <p className="texto-suave">No hay flags para este cliente.</p>}
          {grupos.map(([grupo, lista]) => (
            <section className="grupo" key={grupo}>
              <div className="grupo-titulo">
                <h2>{grupo}</h2>
              </div>
              <div className="lista-filas">
                {lista.map((f) => (
                  <div className="fila" key={f.id}>
                    <div>
                      <span className="campo-inline">
                        {f.habilitado ? <Eye size={15} className="texto-suave" /> : <EyeOff size={15} style={{ color: 'var(--color-peligro)' }} />}
                        <strong>{f.descripcion}</strong>
                        {f.cliente === 'TODOS' && cliente !== 'TODOS' && (
                          <Badge tono="gris" title="Definido para todos los clientes">
                            global
                          </Badge>
                        )}
                      </span>
                      <div className="fila-meta">
                        <span className="mono">{f.clave}</span>
                        {f.metadata && <code>{JSON.stringify(f.metadata)}</code>}
                      </div>
                    </div>
                    <span className="campo-inline">
                      <Toggle checked={f.habilitado} onChange={(v) => editar.mutate({ id: f.id, cuerpo: { habilitado: v } })} etiqueta="" title={f.habilitado ? 'Ocultar' : 'Mostrar'} disabled={editar.isPending} />
                      <button type="button" className="boton boton-fantasma boton-icono" title="Editar" aria-label="Editar" onClick={() => setEditando(f)}>
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="boton boton-fantasma boton-icono" title="Eliminar" aria-label="Eliminar" onClick={() => setEliminando(f)}>
                        <Trash2 size={16} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <VistaPrevia cliente={cliente} />
      </div>

      {editando !== null && (
        <FlagForm key={editando === 'nuevo' ? 'nuevo' : editando.id} flag={editando === 'nuevo' ? null : editando} clienteInicial={cliente} onCerrar={() => setEditando(null)} />
      )}

      <ConfirmDialog
        abierto={eliminando !== null}
        titulo="Eliminar flag"
        peligro
        textoConfirmar="Eliminar"
        mensaje={
          <p>
            Se eliminará <span className="mono">{eliminando?.clave}</span>. El cliente volverá a su comportamiento por defecto (normalmente visible).
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

/** Lo que recibiría ese cliente ahora mismo del endpoint público, para comprobar el efecto de un cambio. */
function VistaPrevia({ cliente }: { cliente: Cliente }) {
  const clienteReal = cliente === 'TODOS' ? 'MARKET' : cliente
  const preview = useBootstrapPreview(clienteReal)
  const [verJson, setVerJson] = useState(false)
  const data = preview.data
  const apagados = data ? Object.entries(data.flags).filter(([, v]) => !v) : []

  return (
    <aside className="tarjeta" aria-label="Vista previa del bootstrap">
      <div className="grupo-titulo" style={{ justifyContent: 'space-between' }}>
        <h2>Vista previa: {CLIENTE_LABEL[clienteReal]}</h2>
        <button type="button" className="boton boton-fantasma boton-pequeno" onClick={() => void preview.refetch()} disabled={preview.isFetching}>
          Actualizar
        </button>
      </div>
      <p className="texto-suave texto-pequeno" style={{ marginBottom: 10 }}>
        Respuesta real de <span className="mono">GET /config/bootstrap?cliente={clienteReal}</span>, la misma que recibe el cliente.
      </p>
      {preview.isError && <QueryError error={preview.error} onReintentar={() => void preview.refetch()} />}
      {data && (
        <>
          <div className="grid-tarjetas" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
            <div className="kpi">
              <span className="kpi-valor mono" style={{ fontSize: 18 }}>
                {data.version}
              </span>
              <span className="kpi-etiqueta">versión</span>
            </div>
            <div className="kpi">
              <span className="kpi-valor" style={{ fontSize: 18 }}>
                {apagados.length}
              </span>
              <span className="kpi-etiqueta">flags apagados</span>
            </div>
            <div className="kpi">
              <span className="kpi-valor" style={{ fontSize: 18 }}>
                {data.categorias.length}
              </span>
              <span className="kpi-etiqueta">categorías visibles</span>
            </div>
            <div className="kpi">
              <span className="kpi-valor" style={{ fontSize: 18 }}>
                {Object.keys(data.listas).length}
              </span>
              <span className="kpi-etiqueta">listas</span>
            </div>
          </div>
          {apagados.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <strong className="texto-pequeno">Oculto en este cliente:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {apagados.map(([k]) => (
                  <li key={k} className="mono texto-pequeno">
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button type="button" className="boton boton-secundario boton-pequeno" onClick={() => setVerJson((v) => !v)}>
            {verJson ? 'Ocultar JSON' : 'Ver JSON completo'}
          </button>
          {verJson && <pre className="json-preview" style={{ marginTop: 10 }}>{JSON.stringify(data, null, 2)}</pre>}
        </>
      )}
    </aside>
  )
}

/** Se monta con `key` por flag: el estado inicial se toma una sola vez. */
function FlagForm({ flag, clienteInicial, onCerrar }: { flag: FeatureFlag | null; clienteInicial: Cliente; onCerrar: () => void }) {
  const crear = useCrearFlag()
  const editar = useEditarFlag()
  const [form, setForm] = useState<FeatureFlagFormulario>(() => desdeFlag(flag, clienteInicial))
  const [jsonValido, setJsonValido] = useState(true)

  function set<K extends keyof FeatureFlagFormulario>(k: K, v: FeatureFlagFormulario[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function onGuardar() {
    if (!form.clave.trim()) throw new Error('La clave es obligatoria.')
    if (!CLAVE_FLAG.test(form.clave.trim())) throw new Error('La clave usa el formato cliente.zona.componente en minúsculas, por ejemplo market.home.testimonios.')
    if (!form.descripcion.trim()) throw new Error('Describe qué componente controla el flag.')
    if (!form.grupo.trim()) throw new Error('Indica un grupo (home, navegacion, checkout…).')
    if (!jsonValido) throw new Error('Corrige la metadata JSON.')
    const cuerpo = { ...form, clave: form.clave.trim(), descripcion: form.descripcion.trim(), grupo: form.grupo.trim() }
    if (flag) await editar.mutateAsync({ id: flag.id, cuerpo })
    else await crear.mutateAsync(cuerpo)
    onCerrar()
  }

  return (
    <FormModal abierto titulo={flag ? 'Editar flag' : 'Nuevo flag'} onCerrar={onCerrar} onGuardar={onGuardar}>
      <label className="campo">
        <span>Clave {flag && <span className="texto-suave">(no editable)</span>}</span>
        <input
          className="mono"
          value={form.clave}
          disabled={flag !== null}
          onChange={(e) => {
            const clave = e.target.value
            setForm((f) => ({ ...f, clave, cliente: flag ? f.cliente : clienteDeClave(clave) }))
          }}
          placeholder="market.home.testimonios"
          autoFocus
        />
        <span className="campo-ayuda">El cliente debe tener código que lea esta clave; crear un flag no oculta nada por sí solo.</span>
      </label>
      <label className="campo">
        <span>Descripción (qué componente controla)</span>
        <input value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
      </label>
      <div className="formulario-fila">
        <label className="campo">
          <span>Grupo</span>
          <input value={form.grupo} onChange={(e) => set('grupo', e.target.value)} placeholder="home" />
        </label>
        <ClientePicker valor={form.cliente} onCambio={(c) => set('cliente', c)} />
      </div>
      <Toggle checked={form.habilitado} onChange={(v) => set('habilitado', v)} etiqueta="Habilitado (visible)" />
      <JsonField
        valor={form.metadata ?? null}
        onCambio={(v, valido) => {
          set('metadata', v)
          setJsonValido(valido)
        }}
        ayuda='Opcional. Por ejemplo {"mensaje": "Volvemos a las 9:00"} para el banner de mantenimiento.'
      />
    </FormModal>
  )
}

function desdeFlag(f: FeatureFlag | null, clienteInicial: Cliente): FeatureFlagFormulario {
  return {
    clave: f?.clave ?? '',
    cliente: f?.cliente ?? clienteInicial,
    habilitado: f?.habilitado ?? true,
    grupo: f?.grupo ?? '',
    descripcion: f?.descripcion ?? '',
    metadata: f?.metadata ?? null,
  }
}
