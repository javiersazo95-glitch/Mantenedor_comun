import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/flags'
import { queryKeys } from './queryKeys'
import { showToast } from '@/components/Toast'
import { mensajeDeError } from '@/api/client'
import type { FeatureFlagFormulario } from '@/types/flags'
import type { Cliente } from '@/types/comun'

function useInvalidacion() {
  const qc = useQueryClient()
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['flags'] }),
      qc.invalidateQueries({ queryKey: queryKeys.configVersion }),
      qc.invalidateQueries({ queryKey: ['bootstrap'] }),
    ])
  }
}

export function useFlags(cliente?: Cliente) {
  return useQuery({ queryKey: queryKeys.flags(cliente), queryFn: () => api.listarFlags(cliente) })
}

export function useCrearFlag() {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: (cuerpo: FeatureFlagFormulario) => api.crearFlag(cuerpo),
    onSuccess: async () => {
      await invalidar()
      showToast('Flag creado.', 'exito')
    },
  })
}

export function useEditarFlag() {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: ({ id, cuerpo }: { id: number; cuerpo: Partial<FeatureFlagFormulario> }) => api.editarFlag(id, cuerpo),
    onSuccess: async (_f, { cuerpo }) => {
      await invalidar()
      if (typeof cuerpo.habilitado === 'boolean') {
        showToast(cuerpo.habilitado ? 'Componente visible.' : 'Componente oculto.', 'exito')
      } else {
        showToast('Flag guardado.', 'exito')
      }
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })
}

export function useEliminarFlag() {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: (id: number) => api.eliminarFlag(id),
    onSuccess: async () => {
      await invalidar()
      showToast('Flag eliminado. El cliente usará su valor por defecto.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })
}
