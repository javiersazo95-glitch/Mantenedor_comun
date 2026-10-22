import { useState } from 'react'
import { FormModal } from '@/components/FormModal'
import { ColorField } from '@/components/ColorField'
import { esColorValido } from '@/utils/validators'
import { Toggle } from '@/components/Toggle'
import { IconUploader } from '@/components/IconUploader'
import { IconoCatalogo } from '@/components/IconoCatalogo'

import { useGuardarCatalogo } from '@/hooks/useCatalogo'
import { useIconos } from '@/hooks/useIconos'
import { slugificar } from '@/utils/slug'
import { CAPACIDADES, TIPO_CATALOGO_LABEL, type Categoria, type CatalogoFormulario, type FilaCatalogo, type MarcaRepuesto, type Subcategoria, type TipoCatalogo } from '@/types/catalogos'

interface Props {
  tipo: TipoCatalogo
  abierto: boolean
  /** null = crear. */
  fila: FilaCatalogo | null
  padreId?: number
  onCerrar: () => void
}

/** Las 8 familias del Market (SIDEBAR_CATEGORIES). */
const FAMILIAS_SUGERIDAS = ['frenos', 'motor', 'suspension', 'iluminacion', 'aceites', 'electrico', 'carroceria', 'neumaticos']

/** Nombres lucide que resuelve CategoryIconTile.jsx del Market; cualquier otro cae a Package. */
const ICONOS_CATEGORIA = [
  'Disc3', 'Cog', 'ArrowUpDown', 'Lightbulb', 'Droplets', 'Zap', 'CarFront', 'CircleDot', 'Wind', 'ThermometerSun',
  'KeyRound', 'Fuel', 'Gauge', 'CircleGauge', 'Recycle', 'GitFork', 'Layers', 'Filter', 'Cable', 'Snowflake', 'Radar', 'Box', 'Package',
]

/**
 * Formulario compartido por los cinco catálogos. Los campos que no aplican al tipo no se
 * muestran (ver CAPACIDADES). El slug se sugiere a partir del nombre al crear y queda bloqueado
 * al editar: es la clave con la que los clientes cruzan sus datos.
 * Montar siempre con `key` (id del registro o 'nuevo').
 */
export function CatalogoForm({ tipo, abierto, fila, padreId, onCerrar }: Props) {
  const cap = CAPACIDADES[tipo]
  const guardar = useGuardarCatalogo(tipo)
  const iconos = useIconos(fila ? { tipo, id: fila.id } : null)

  // El estado inicial se toma al montar: la página monta este formulario con `key` por registro,
  // así que abrir otro registro crea un formulario nuevo en vez de sincronizar props con efectos.
  const [form, setForm] = useState<CatalogoFormulario>(() => desdeFila(fila, tipo, padreId))
  const [slugManual, setSlugManual] = useState(fila !== null)

  function set<K extends keyof CatalogoFormulario>(clave: K, valor: CatalogoFormulario[K]) {
    setForm((f) => ({ ...f, [clave]: valor }))
  }

  function onNombre(nombre: string) {
    setForm((f) => ({ ...f, nombre, slug: slugManual ? f.slug : slugificar(nombre) }))
  }

  async function onGuardar() {
    if (!form.nombre.trim()) throw new Error('El nombre es obligatorio.')
    if (!esColorValido(form.color)) throw new Error('El color debe tener formato #rrggbb.')
    // Un campo de texto vacío se guarda como null, no como "": los clientes distinguen "sin valor".
    const limpio = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v]),
    ) as CatalogoFormulario
    await guardar.mutateAsync({ id: fila?.id ?? null, cuerpo: { ...limpio, nombre: form.nombre.trim() } })
    onCerrar()
  }

  const etiquetas = TIPO_CATALOGO_LABEL[tipo]
  const esMarcaRepuesto = tipo === 'marcas-repuesto'
  const esCategoria = tipo === 'categorias'
  const marca = fila as MarcaRepuesto | null
  const categoria = fila as Categoria | null
  const subcategoria = fila as Subcategoria | null

  return (
    <FormModal
      abierto={abierto}
      titulo={fila ? `Editar ${etiquetas.singular.toLowerCase()}` : `Nueva ${etiquetas.singular.toLowerCase()}`}
      onCerrar={onCerrar}
      onGuardar={onGuardar}
      ancho
    >
      <div className="formulario-fila">
        <label className="campo">
          <span>Nombre</span>
          <input value={form.nombre} onChange={(e) => onNombre(e.target.value)} required autoFocus />
        </label>
        <label className="campo">
          <span>Slug {fila && <span className="texto-suave">(no editable)</span>}</span>
          <input
            className="mono"
            value={form.slug ?? ''}
            disabled={fila !== null}
            onChange={(e) => {
              setSlugManual(true)
              set('slug', slugificar(e.target.value))
            }}
          />
          <span className="campo-ayuda">Clave estable que usan los clientes para cruzar datos. Se genera del nombre.</span>
        </label>
      </div>

      {esMarcaRepuesto && (
        <>
          <div className="formulario-fila">
            <label className="campo">
              <span>País de origen</span>
              <input value={form.paisOrigen ?? ''} onChange={(e) => set('paisOrigen', e.target.value || null)} />
            </label>
            <label className="campo">
              <span>Calidad referencial</span>
              <select value={form.calidadReferencial ?? ''} onChange={(e) => set('calidadReferencial', e.target.value || null)}>
                <option value="">Sin clasificar</option>
                <option value="Premium">Premium</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Económica">Económica</option>
              </select>
            </label>
          </div>
          <label className="campo">
            <span>Descripción de calidad</span>
            <textarea value={form.descripcionCalidad ?? ''} onChange={(e) => set('descripcionCalidad', e.target.value || null)} />
          </label>
          <label className="campo">
            <span>URL del sitio oficial</span>
            <input type="url" value={form.fuenteUrl ?? ''} onChange={(e) => set('fuenteUrl', e.target.value || null)} />
          </label>
          {marca?.origen === 'VENDEDOR' && (
            <p className="mensaje-aviso">Esta marca la creó un vendedor al cargar inventario. Revisa el nombre antes de destacarla.</p>
          )}
        </>
      )}

      {esCategoria && (
        <>
          <label className="campo">
            <span>Descripción</span>
            <textarea value={form.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value || null)} />
          </label>
          <div className="formulario-fila">
            <label className="campo">
              <span>Familia (agrupación del Market)</span>
              <input list="familias" value={form.familia ?? ''} onChange={(e) => set('familia', e.target.value || null)} />
              <datalist id="familias">
                {FAMILIAS_SUGERIDAS.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </label>
            <label className="campo">
              <span>Ícono de respaldo</span>
              <div className="campo-inline">
                <select value={form.iconoNombre ?? ''} onChange={(e) => set('iconoNombre', e.target.value || null)}>
                  <option value="">Sin ícono (usa Package)</option>
                  {ICONOS_CATEGORIA.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <IconoCatalogo iconoUrl={null} iconoNombre={form.iconoNombre} color={form.color} />
              </div>
              <span className="campo-ayuda">Solo estos nombres están disponibles en el Market y la app. Se usa cuando no hay ícono subido.</span>
            </label>
          </div>
        </>
      )}

      <div className="formulario-fila">
        <label className="campo">
          <span>Orden</span>
          <input type="number" value={form.orden ?? 0} onChange={(e) => set('orden', Number(e.target.value))} />
          <span className="campo-ayuda">También puedes reordenar con las flechas de la tabla.</span>
        </label>
        {cap.color && <ColorField valor={form.color ?? null} onCambio={(v) => set('color', v)} />}
      </div>

      <div className="campo-inline" style={{ gap: 24 }}>
        {cap.destacada && (
          <Toggle
            checked={!!form.destacada}
            onChange={(v) => set('destacada', v)}
            etiqueta={esMarcaRepuesto ? 'Destacada (va en el bootstrap de los clientes)' : 'Destacada'}
          />
        )}
        <Toggle checked={form.activo !== false} onChange={(v) => set('activo', v)} etiqueta="Activo (visible en los clientes)" />
      </div>

      {fila && (cap.icono || cap.imagen) && (
        <div className="formulario-fila">
          {cap.icono && (
            <IconUploader
              etiqueta="Ícono"
              urlActual={fila.iconoUrl}
              ocupado={iconos.ocupado}
              onSubir={(archivo) => iconos.subir.mutateAsync({ campo: 'icono', archivo }).then(() => undefined)}
              onQuitar={() => iconos.quitar.mutateAsync({ campo: 'icono' }).then(() => undefined)}
            />
          )}
          {cap.imagen && (
            <IconUploader
              etiqueta="Imagen"
              urlActual={(categoria?.imagenUrl ?? subcategoria?.imagenUrl) ?? null}
              ocupado={iconos.ocupado}
              onSubir={(archivo) => iconos.subir.mutateAsync({ campo: 'imagen', archivo }).then(() => undefined)}
              onQuitar={() => iconos.quitar.mutateAsync({ campo: 'imagen' }).then(() => undefined)}
            />
          )}
        </div>
      )}
      {!fila && (cap.icono || cap.imagen) && <p className="campo-ayuda">Podrás subir el ícono o la imagen después de guardar.</p>}
    </FormModal>
  )
}

function desdeFila(fila: FilaCatalogo | null, tipo: TipoCatalogo, padreId?: number): CatalogoFormulario {
  const base: CatalogoFormulario = {
    nombre: fila?.nombre ?? '',
    slug: fila?.slug ?? '',
    orden: fila?.orden ?? 0,
    color: fila?.color ?? null,
    destacada: fila?.destacada ?? false,
    activo: fila?.activo ?? true,
  }
  if (tipo === 'modelos') base.marcaId = (fila as { marcaId?: number } | null)?.marcaId ?? padreId
  if (tipo === 'subcategorias') base.categoriaId = (fila as { categoriaId?: number } | null)?.categoriaId ?? padreId
  if (tipo === 'marcas-repuesto' && fila) {
    const m = fila as MarcaRepuesto
    base.paisOrigen = m.paisOrigen
    base.calidadReferencial = m.calidadReferencial
    base.descripcionCalidad = m.descripcionCalidad
    base.fuenteUrl = m.fuenteUrl
  }
  if (tipo === 'categorias' && fila) {
    const c = fila as Categoria
    base.descripcion = c.descripcion
    base.iconoNombre = c.iconoNombre
    base.familia = c.familia
  }
  return base
}
