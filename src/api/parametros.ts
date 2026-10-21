import apiClient from './client'
import type { CambioParametro, Parametro, ParametroHistorial } from '@/types/parametros'
import type { PaginaDTO, ParametrosPagina } from '@/types/comun'

const BASE = '/mantenedor/parametros'

export async function listarParametros(grupo?: string): Promise<Parametro[]> {
  const { data } = await apiClient.get<Parametro[]>(BASE, { params: { grupo: grupo || undefined } })
  return data
}

export async function obtenerParametro(clave: string): Promise<Parametro> {
  const { data } = await apiClient.get<Parametro>(`${BASE}/${clave}`)
  return data
}

export async function cambiarParametro(clave: string, cambio: CambioParametro): Promise<Parametro> {
  const { data } = await apiClient.put<Parametro>(`${BASE}/${clave}`, cambio)
  return data
}

export async function historialParametro(clave: string, pagina: ParametrosPagina): Promise<PaginaDTO<ParametroHistorial>> {
  const { data } = await apiClient.get<PaginaDTO<ParametroHistorial>>(`${BASE}/${clave}/historial`, {
    params: { page: pagina.page ?? 0, size: pagina.size ?? 25 },
  })
  return data
}

export async function cancelarProgramado(clave: string, historialId: number): Promise<void> {
  await apiClient.delete(`${BASE}/${clave}/programados/${historialId}`)
}

export async function restaurarDefault(clave: string): Promise<Parametro> {
  const { data } = await apiClient.post<Parametro>(`${BASE}/${clave}/restaurar-default`)
  return data
}
