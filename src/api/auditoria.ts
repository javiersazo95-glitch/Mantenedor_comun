import apiClient from './client'
import type { FiltroAuditoria, RegistroAuditoria } from '@/types/auditoria'
import type { PaginaDTO, ParametrosPagina } from '@/types/comun'

export async function listarAuditoria(filtro: FiltroAuditoria, pagina: ParametrosPagina): Promise<PaginaDTO<RegistroAuditoria>> {
  const { data } = await apiClient.get<PaginaDTO<RegistroAuditoria>>('/mantenedor/auditoria', {
    params: {
      accion: filtro.accion || undefined,
      desde: filtro.desde || undefined,
      hasta: filtro.hasta || undefined,
      page: pagina.page ?? 0,
      size: pagina.size ?? 25,
    },
  })
  return data
}
