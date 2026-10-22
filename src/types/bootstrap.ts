/**
 * Espejo en TypeScript de `BootstrapDTO.java`. Ver
 * `RespuesTop-mono-repo/docs/arquitectura/contrato-mantenedor-bootstrap.md`.
 */
export interface BootstrapOpcionLista {
  valor: string
  etiqueta: string
  descripcion: string | null
  orden: number
  esDefault: boolean
  iconoUrl: string | null
  color: string | null
  metadata: Record<string, unknown> | null
}

export interface BootstrapSubcategoria {
  id: number
  nombre: string
  slug: string
  orden: number
  imagenUrl: string | null
}

export interface BootstrapCategoria {
  id: number
  nombre: string
  slug: string
  familia: string | null
  orden: number
  iconoUrl: string | null
  iconoNombre: string | null
  color: string | null
  imagenUrl: string | null
  subcategorias: BootstrapSubcategoria[]
}

export interface BootstrapMarcaVehiculo {
  id: number
  nombre: string
  slug: string
  orden: number
  iconoUrl: string | null
  color: string | null
  destacada: boolean
}

export interface BootstrapMarcaRepuesto {
  id: number
  nombre: string
  slug: string
  orden: number
  iconoUrl: string | null
  color: string | null
  calidadReferencial: string | null
}

export interface BootstrapDTO {
  version: number
  cliente: string
  generadoEn: string
  parametros: Record<string, string>
  parametrosTipos: Record<string, string>
  flags: Record<string, boolean>
  flagsMetadata: Record<string, Record<string, unknown>>
  listas: Record<string, BootstrapOpcionLista[]>
  /** Metadata de la LISTA completa (p. ej. `permiteTextoLibre` de GARANTIA_PRODUCTO). */
  listasMetadata: Record<string, Record<string, unknown>>
  categorias: BootstrapCategoria[]
  marcasVehiculo: BootstrapMarcaVehiculo[]
  marcasRepuestoDestacadas: BootstrapMarcaRepuesto[]
}
