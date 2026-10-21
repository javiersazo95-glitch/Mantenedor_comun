import apiClient from './client'
import type { CatalogoFormulario, FilaCatalogo, FiltroCatalogo, ReferenciasCatalogo, TipoCatalogo } from '@/types/catalogos'
import type { PaginaDTO, ParametrosPagina } from '@/types/comun'

const BASE = '/mantenedor/catalogos'

export async function listarCatalogo<T extends FilaCatalogo = FilaCatalogo>(
  tipo: TipoCatalogo,
  filtro: FiltroCatalogo,
  pagina: ParametrosPagina,
): Promise<PaginaDTO<T>> {
  const { data } = await apiClient.get<PaginaDTO<T>>(`${BASE}/${tipo}`, {
    params: {
      q: filtro.q || undefined,
      activo: filtro.activo,
      padreId: filtro.padreId,
      pendientes: filtro.pendientes || undefined,
      page: pagina.page ?? 0,
      size: pagina.size ?? 25,
      sort: pagina.sort ?? 'orden,asc',
    },
  })
  return data
}

export async function obtenerCatalogo<T extends FilaCatalogo = FilaCatalogo>(tipo: TipoCatalogo, id: number): Promise<T> {
  const { data } = await apiClient.get<T>(`${BASE}/${tipo}/${id}`)
  return data
}

export async function crearCatalogo<T extends FilaCatalogo = FilaCatalogo>(tipo: TipoCatalogo, cuerpo: CatalogoFormulario): Promise<T> {
  const { data } = await apiClient.post<T>(`${BASE}/${tipo}`, cuerpo)
  return data
}

export async function editarCatalogo<T extends FilaCatalogo = FilaCatalogo>(tipo: TipoCatalogo, id: number, cuerpo: CatalogoFormulario): Promise<T> {
  const { data } = await apiClient.put<T>(`${BASE}/${tipo}/${id}`, cuerpo)
  return data
}

export async function activarCatalogo<T extends FilaCatalogo = FilaCatalogo>(tipo: TipoCatalogo, id: number, activo: boolean): Promise<T> {
  const { data } = await apiClient.patch<T>(`${BASE}/${tipo}/${id}/activo`, { activo })
  return data
}

export async function reordenarCatalogo(tipo: TipoCatalogo, ids: number[]): Promise<void> {
  await apiClient.put(`${BASE}/${tipo}/orden`, { ids })
}

export async function referenciasCatalogo(tipo: TipoCatalogo, id: number): Promise<ReferenciasCatalogo> {
  const { data } = await apiClient.get<ReferenciasCatalogo>(`${BASE}/${tipo}/${id}/referencias`)
  return data
}

export async function reasignarCatalogo(tipo: TipoCatalogo, id: number, destinoId: number): Promise<void> {
  await apiClient.post(`${BASE}/${tipo}/${id}/reasignar`, { destinoId })
}

export async function eliminarCatalogo(tipo: TipoCatalogo, id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${tipo}/${id}`)
}

/** Marca que un vendedor creó al cargar inventario y que el administrador ya revisó. */
export async function revisarMarcaRepuesto<T extends FilaCatalogo = FilaCatalogo>(id: number): Promise<T> {
  const { data } = await apiClient.patch<T>(`${BASE}/marcas-repuesto/${id}/revisar`)
  return data
}
