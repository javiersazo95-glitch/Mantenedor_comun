/**
 * Tipos de catálogo que administra el mantenedor. El valor es el segmento de ruta que usa
 * el backend en `/api/v1/mantenedor/catalogos/{tipo}` y en `/api/v1/mantenedor/iconos/{tipo}/{id}`.
 */
export type TipoCatalogo =
  | 'marcas-repuesto'
  | 'marcas-vehiculo'
  | 'modelos'
  | 'categorias'
  | 'subcategorias'

export const TIPO_CATALOGO_LABEL: Record<TipoCatalogo, { singular: string; plural: string }> = {
  'marcas-repuesto': { singular: 'Marca de repuesto', plural: 'Marcas de repuesto' },
  'marcas-vehiculo': { singular: 'Marca de vehículo', plural: 'Marcas de vehículo' },
  modelos: { singular: 'Modelo', plural: 'Modelos' },
  categorias: { singular: 'Categoría', plural: 'Categorías' },
  subcategorias: { singular: 'Subcategoría', plural: 'Subcategorías' },
}

/** Campos comunes a toda fila de catálogo. */
export interface CatalogoBase {
  id: number
  nombre: string
  /** Inmutable una vez creado: es la clave de cruce con los clientes. */
  slug: string
  activo: boolean
  orden: number
  iconoUrl: string | null
  color: string | null
  destacada: boolean
  updatedAt: string | null
}

export type OrigenMarca = 'SISTEMA' | 'VENDEDOR' | 'MANTENEDOR'

export interface MarcaRepuesto extends CatalogoBase {
  paisOrigen: string | null
  calidadReferencial: string | null
  descripcionCalidad: string | null
  /** Logo heredado (favicon). Si hay `iconoUrl`, ese manda. */
  logoUrl: string | null
  fuenteUrl: string | null
  origen: OrigenMarca
  /** false cuando la creó un vendedor al cargar inventario y nadie la revisó aún. */
  revisada: boolean
}

export type MarcaVehiculo = CatalogoBase

export interface ModeloVehiculo extends CatalogoBase {
  marcaId: number
}

export interface Categoria extends CatalogoBase {
  descripcion: string | null
  /** Nombre de ícono lucide usado como fallback cuando no hay `iconoUrl`. */
  iconoNombre: string | null
  imagenUrl: string | null
  /** Agrupa las categorías técnicas en las familias que muestra el Market. */
  familia: string | null
}

export interface Subcategoria extends CatalogoBase {
  categoriaId: number
  imagenUrl: string | null
}

export type FilaCatalogo = MarcaRepuesto | MarcaVehiculo | ModeloVehiculo | Categoria | Subcategoria

/** Lo que el formulario envía al crear o editar. El backend ignora los campos que no apliquen al tipo. */
export interface CatalogoFormulario {
  nombre: string
  slug?: string
  orden?: number
  color?: string | null
  destacada?: boolean
  activo?: boolean
  // marcas de repuesto
  paisOrigen?: string | null
  calidadReferencial?: string | null
  descripcionCalidad?: string | null
  fuenteUrl?: string | null
  // categorías
  descripcion?: string | null
  iconoNombre?: string | null
  familia?: string | null
  // hijos
  marcaId?: number
  categoriaId?: number
}

export interface ReferenciasCatalogo {
  productos: number
  hijos: number
  compatibilidades: number
}

export interface FiltroCatalogo {
  q?: string
  activo?: boolean
  padreId?: number
  /** Solo marcas de repuesto: filas creadas por vendedores sin revisar. */
  pendientes?: boolean
}

export const TIPOS_CON_HIJOS: Partial<Record<TipoCatalogo, { hijo: TipoCatalogo; campoPadre: 'marcaId' | 'categoriaId' }>> = {
  'marcas-vehiculo': { hijo: 'modelos', campoPadre: 'marcaId' },
  categorias: { hijo: 'subcategorias', campoPadre: 'categoriaId' },
}

/** Qué columnas y campos tiene sentido mostrar por tipo. */
export const CAPACIDADES: Record<TipoCatalogo, { icono: boolean; imagen: boolean; color: boolean; destacada: boolean }> = {
  'marcas-repuesto': { icono: true, imagen: false, color: true, destacada: true },
  'marcas-vehiculo': { icono: true, imagen: false, color: true, destacada: true },
  modelos: { icono: false, imagen: false, color: false, destacada: false },
  categorias: { icono: true, imagen: true, color: true, destacada: true },
  subcategorias: { icono: false, imagen: true, color: false, destacada: false },
}
