export interface Lista {
  codigo: string
  nombre: string
  descripcion: string | null
  /**
   * true: el backend valida los valores contra un enum, así que desde el mantenedor solo se
   * puede cambiar etiqueta, orden, visibilidad, ícono y color, nunca agregar o eliminar valores.
   */
  sistema: boolean
  /** CSV de clientes (`APP,MARKET`) o `TODOS`. */
  clientes: string
  updatedAt?: string | null
  /** Cantidad de opciones (activas / total), si el backend la envía. */
  totalOpciones?: number
  opcionesActivas?: number
}

export interface ListaOpcion {
  id: number
  listaCodigo: string
  valor: string
  etiqueta: string
  descripcion: string | null
  orden: number
  activo: boolean
  esDefault: boolean
  iconoUrl: string | null
  color: string | null
  metadata: Record<string, unknown> | null
  clientes: string
  updatedAt?: string | null
}

export interface ListaOpcionFormulario {
  valor: string
  etiqueta: string
  descripcion?: string | null
  orden?: number
  activo?: boolean
  esDefault?: boolean
  color?: string | null
  metadata?: Record<string, unknown> | null
  clientes?: string
}
