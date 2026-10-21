import apiClient from './client'
import type { TipoCatalogo } from '@/types/catalogos'

export type CampoIcono = 'icono' | 'imagen'

/** Destino de un ícono: una fila de catálogo o una opción de lista. */
export type DestinoIcono = { tipo: TipoCatalogo; id: number } | { tipo: 'lista-opcion'; id: number }

export async function subirIcono<T>(destino: DestinoIcono, campo: CampoIcono, archivo: File): Promise<T> {
  const form = new FormData()
  form.append('archivo', archivo)
  const { data } = await apiClient.post<T>(`/mantenedor/iconos/${destino.tipo}/${destino.id}`, form, {
    params: { campo },
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  })
  return data
}

export async function quitarIcono<T>(destino: DestinoIcono, campo: CampoIcono): Promise<T> {
  const { data } = await apiClient.delete<T>(`/mantenedor/iconos/${destino.tipo}/${destino.id}`, { params: { campo } })
  return data
}
