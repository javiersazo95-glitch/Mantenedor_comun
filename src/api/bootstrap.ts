import apiClient from './client'
import type { BootstrapDTO } from '@/types/bootstrap'
import type { Cliente } from '@/types/comun'

/** Lo que verá cada cliente. Es el endpoint público; se usa aquí para la "vista previa". */
export async function obtenerBootstrap(cliente: Exclude<Cliente, 'TODOS'>): Promise<BootstrapDTO> {
  const { data } = await apiClient.get<BootstrapDTO>('/config/bootstrap', {
    params: { cliente },
    // Sin caché del navegador: la vista previa debe mostrar el estado real tras cada cambio.
    headers: { 'Cache-Control': 'no-cache' },
  })
  return data
}

export async function obtenerVersionConfig(): Promise<number> {
  const { data } = await apiClient.get<{ version: number }>('/config/version', { headers: { 'Cache-Control': 'no-cache' } })
  return data.version
}
