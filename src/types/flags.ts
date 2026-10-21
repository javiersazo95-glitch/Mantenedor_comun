import type { Cliente } from './comun'

export interface FeatureFlag {
  id: number
  clave: string
  cliente: Cliente
  habilitado: boolean
  grupo: string
  descripcion: string
  metadata: Record<string, unknown> | null
  updatedAt: string | null
  updatedBy: string | null
}

export interface FeatureFlagFormulario {
  clave: string
  cliente: Cliente
  habilitado: boolean
  grupo: string
  descripcion: string
  metadata?: Record<string, unknown> | null
}

/** Prefijo de la clave → cliente al que pertenece por convención. */
export function clienteDeClave(clave: string): Cliente {
  if (clave.startsWith('app.')) return 'APP'
  if (clave.startsWith('market.')) return 'MARKET'
  if (clave.startsWith('panel.')) return 'PANEL'
  if (clave.startsWith('backoffice.')) return 'BACKOFFICE'
  return 'TODOS'
}
