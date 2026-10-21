import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/parametros'
import { queryKeys } from './queryKeys'
import { showToast } from '@/components/Toast'
import { mensajeDeError } from '@/api/client'
import type { CambioParametro } from '@/types/parametros'
import type { ParametrosPagina } from '@/types/comun'

function useInvalidacion() {
  const qc = useQueryClient()
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['parametros'] }),
      qc.invalidateQueries({ queryKey: queryKeys.configVersion }),
      qc.invalidateQueries({ queryKey: ['bootstrap'] }),
    ])
  }
}

export function useParametros(grupo?: string) {
  return useQuery({ queryKey: queryKeys.parametros(grupo), queryFn: () => api.listarParametros(grupo) })
}

export function useParametro(clave: string) {
  return useQuery({ queryKey: queryKeys.parametro(clave), queryFn: () => api.obtenerParametro(clave) })
}

export function useHistorialParametro(clave: string, pagina: ParametrosPagina) {
  return useQuery({
    queryKey: queryKeys.parametroHistorial(clave, pagina),
    queryFn: () => api.historialParametro(clave, pagina),
    placeholderData: keepPreviousData,
  })
}

export function useCambiarParametro() {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: ({ clave, cambio }: { clave: string; cambio: CambioParametro }) => api.cambiarParametro(clave, cambio),
    onSuccess: async (_p, { cambio }) => {
      await invalidar()
      const programado = cambio.vigenteDesde && new Date(cambio.vigenteDesde).getTime() > Date.now()
      showToast(programado ? 'Cambio programado. Se aplicará en la fecha indicada.' : 'Parámetro actualizado.', 'exito')
    },
  })
}

export function useCancelarProgramado(clave: string) {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: (historialId: number) => api.cancelarProgramado(clave, historialId),
    onSuccess: async () => {
      await invalidar()
      showToast('Cambio programado cancelado.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })
}

export function useRestaurarDefault() {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: (clave: string) => api.restaurarDefault(clave),
    onSuccess: async () => {
      await invalidar()
      showToast('Valor por defecto restaurado.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })
}
