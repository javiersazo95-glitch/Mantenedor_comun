import { keepPreviousData, useQuery } from '@tanstack/react-query'
import * as api from '@/api/auditoria'
import { queryKeys } from './queryKeys'
import type { FiltroAuditoria } from '@/types/auditoria'
import type { ParametrosPagina } from '@/types/comun'

export function useAuditoria(filtro: FiltroAuditoria, pagina: ParametrosPagina) {
  return useQuery({
    queryKey: queryKeys.auditoria(filtro, pagina),
    queryFn: () => api.listarAuditoria(filtro, pagina),
    placeholderData: keepPreviousData,
  })
}
