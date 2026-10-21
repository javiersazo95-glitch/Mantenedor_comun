import apiClient from './client'
import type { FeatureFlag, FeatureFlagFormulario } from '@/types/flags'
import type { Cliente } from '@/types/comun'

const BASE = '/mantenedor/flags'

export async function listarFlags(cliente?: Cliente): Promise<FeatureFlag[]> {
  const { data } = await apiClient.get<FeatureFlag[]>(BASE, { params: { cliente: cliente || undefined } })
  return data
}

export async function crearFlag(cuerpo: FeatureFlagFormulario): Promise<FeatureFlag> {
  const { data } = await apiClient.post<FeatureFlag>(BASE, cuerpo)
  return data
}

export async function editarFlag(id: number, cuerpo: Partial<FeatureFlagFormulario>): Promise<FeatureFlag> {
  const { data } = await apiClient.put<FeatureFlag>(`${BASE}/${id}`, cuerpo)
  return data
}

export async function eliminarFlag(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`)
}
