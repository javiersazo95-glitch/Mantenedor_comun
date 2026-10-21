export interface RegistroAuditoria {
  id: number
  modulo: string
  accion: string
  detalle: string | null
  usuarioNombre: string | null
  usuarioEmail?: string | null
  estadoAnterior: Record<string, unknown> | null
  estadoSiguiente: Record<string, unknown> | null
  fecha: string
}

export interface FiltroAuditoria {
  accion?: string
  desde?: string
  hasta?: string
}
