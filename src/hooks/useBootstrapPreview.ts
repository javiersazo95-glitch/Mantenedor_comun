import { useQuery } from '@tanstack/react-query'
import * as api from '@/api/bootstrap'
import { queryKeys } from './queryKeys'
import type { Cliente } from '@/types/comun'

/** Lo que recibiría un cliente concreto ahora mismo. */
export function useBootstrapPreview(cliente: Exclude<Cliente, 'TODOS'>, habilitado = true) {
  return useQuery({
    queryKey: queryKeys.bootstrap(cliente),
    queryFn: () => api.obtenerBootstrap(cliente),
    enabled: habilitado,
    staleTime: 0,
  })
}

export function useConfigVersion() {
  return useQuery({
    queryKey: queryKeys.configVersion,
    queryFn: api.obtenerVersionConfig,
    staleTime: 10_000,
    refetchInterval: 60_000,
  })
}
