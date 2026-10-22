import apiClient from './client'
import type { Lista, ListaOpcion, ListaOpcionFormulario } from '@/types/listas'

const BASE = '/mantenedor/listas'

export async function listarListas(): Promise<Lista[]> {
  const { data } = await apiClient.get<Lista[]>(BASE)
  return data
}

/**
 * El backend no expone `GET /listas/{codigo}`: la lista se toma del listado completo
 * (son ~15 listas, así que no vale un endpoint aparte).
 */
export async function obtenerLista(codigo: string): Promise<Lista> {
  const listas = await listarListas()
  const lista = listas.find((l) => l.codigo === codigo)
  if (!lista) throw new Error(`La lista ${codigo} no existe.`)
  return lista
}

export async function listarOpciones(codigo: string, incluirInactivas = true): Promise<ListaOpcion[]> {
  const { data } = await apiClient.get<ListaOpcion[]>(`${BASE}/${codigo}/opciones`, { params: { incluirInactivas } })
  return data
}

export async function crearOpcion(codigo: string, cuerpo: ListaOpcionFormulario): Promise<ListaOpcion> {
  const { data } = await apiClient.post<ListaOpcion>(`${BASE}/${codigo}/opciones`, cuerpo)
  return data
}

export async function editarOpcion(_codigo: string, id: number, cuerpo: ListaOpcionFormulario): Promise<ListaOpcion> {
  const { data } = await apiClient.put<ListaOpcion>(`${BASE}/opciones/${id}`, cuerpo)
  return data
}

export async function activarOpcion(_codigo: string, id: number, activo: boolean): Promise<ListaOpcion> {
  const { data } = await apiClient.patch<ListaOpcion>(`${BASE}/opciones/${id}/activo`, { activo })
  return data
}

export async function reordenarOpciones(codigo: string, ids: number[]): Promise<void> {
  await apiClient.put(`${BASE}/${codigo}/orden`, { ids })
}

export async function eliminarOpcion(_codigo: string, id: number): Promise<void> {
  await apiClient.delete(`${BASE}/opciones/${id}`)
}
