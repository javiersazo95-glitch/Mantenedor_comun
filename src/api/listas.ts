import apiClient from './client'
import type { Lista, ListaOpcion, ListaOpcionFormulario } from '@/types/listas'

const BASE = '/mantenedor/listas'

export async function listarListas(): Promise<Lista[]> {
  const { data } = await apiClient.get<Lista[]>(BASE)
  return data
}

export async function obtenerLista(codigo: string): Promise<Lista> {
  const { data } = await apiClient.get<Lista>(`${BASE}/${codigo}`)
  return data
}

export async function listarOpciones(codigo: string, incluirInactivas = true): Promise<ListaOpcion[]> {
  const { data } = await apiClient.get<ListaOpcion[]>(`${BASE}/${codigo}/opciones`, { params: { incluirInactivas } })
  return data
}

export async function crearOpcion(codigo: string, cuerpo: ListaOpcionFormulario): Promise<ListaOpcion> {
  const { data } = await apiClient.post<ListaOpcion>(`${BASE}/${codigo}/opciones`, cuerpo)
  return data
}

export async function editarOpcion(codigo: string, id: number, cuerpo: ListaOpcionFormulario): Promise<ListaOpcion> {
  const { data } = await apiClient.put<ListaOpcion>(`${BASE}/${codigo}/opciones/${id}`, cuerpo)
  return data
}

export async function activarOpcion(codigo: string, id: number, activo: boolean): Promise<ListaOpcion> {
  const { data } = await apiClient.patch<ListaOpcion>(`${BASE}/${codigo}/opciones/${id}/activo`, { activo })
  return data
}

export async function reordenarOpciones(codigo: string, ids: number[]): Promise<void> {
  await apiClient.put(`${BASE}/${codigo}/orden`, { ids })
}

export async function eliminarOpcion(codigo: string, id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${codigo}/opciones/${id}`)
}
