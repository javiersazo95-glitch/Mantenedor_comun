export type TipoParametro = 'NUMBER' | 'PERCENT' | 'MONEY' | 'BOOLEAN' | 'STRING' | 'JSON'

export interface Parametro {
  clave: string
  grupo: string
  tipo: TipoParametro
  /** Valor vigente, siempre como texto. */
  valor: string
  /** El de application.properties o de la constante original. */
  valorDefault: string
  descripcion: string
  unidad: string | null
  minimo: number | null
  maximo: number | null
  /** true: se expone a los clientes en el bootstrap. */
  publico: boolean
  editable: boolean
  vigenteDesde: string
  updatedAt: string | null
  updatedBy: string | null
}

export type EstadoHistorial = 'APLICADO' | 'PROGRAMADO' | 'CANCELADO'

export interface ParametroHistorial {
  id: number
  clave: string
  valorAnterior: string | null
  valorNuevo: string
  vigenteDesde: string
  estado: EstadoHistorial
  usuarioNombre: string | null
  motivo: string | null
  fecha: string
}

export interface CambioParametro {
  valor: string
  motivo: string
  /** ISO 8601. Si se omite o es pasado, el cambio aplica de inmediato. */
  vigenteDesde?: string
}

/** Orden de presentación en la pantalla de parámetros. */
export const ORDEN_GRUPOS = ['COMISION', 'PEDIDO', 'RETIRO', 'INVENTARIO', 'MEDIACION', 'ANUNCIOS', 'TRIBUTARIO', 'LEGAL', 'CATALOGO']

export const GRUPO_LABEL: Record<string, string> = {
  COMISION: 'Comisiones y pasarela',
  PEDIDO: 'Plazos de pedidos',
  RETIRO: 'Retiros y cobros',
  TRIBUTARIO: 'Tributario',
  LEGAL: 'Legal',
  INVENTARIO: 'Inventario',
  MEDIACION: 'Mediación',
  CATALOGO: 'Catálogo y configuración',
  ANUNCIOS: 'Anuncios',
}
