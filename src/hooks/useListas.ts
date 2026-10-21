import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/listas'
import { queryKeys } from './queryKeys'
import { showToast } from '@/components/Toast'
import { mensajeDeError } from '@/api/client'
import type { ListaOpcionFormulario } from '@/types/listas'

function useInvalidacion() {
  const qc = useQueryClient()
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.listas }),
      qc.invalidateQueries({ queryKey: queryKeys.configVersion }),
      qc.invalidateQueries({ queryKey: ['bootstrap'] }),
    ])
  }
}

export function useListas() {
  return useQuery({ queryKey: queryKeys.listas, queryFn: api.listarListas })
}

export function useLista(codigo: string) {
  return useQuery({ queryKey: queryKeys.lista(codigo), queryFn: () => api.obtenerLista(codigo) })
}

export function useListaOpciones(codigo: string) {
  return useQuery({ queryKey: queryKeys.listaOpciones(codigo), queryFn: () => api.listarOpciones(codigo, true) })
}

export function useGuardarOpcion(codigo: string) {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: ({ id, cuerpo }: { id: number | null; cuerpo: ListaOpcionFormulario }) =>
      id === null ? api.crearOpcion(codigo, cuerpo) : api.editarOpcion(codigo, id, cuerpo),
    onSuccess: async (_o, { id }) => {
      await invalidar()
      showToast(id === null ? 'Opción agregada.' : 'Opción guardada.', 'exito')
    },
  })
}

export function useActivarOpcion(codigo: string) {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => api.activarOpcion(codigo, id, activo),
    onSuccess: async (_o, { activo }) => {
      await invalidar()
      showToast(activo ? 'Opción visible otra vez.' : 'Opción oculta en los desplegables.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })
}

export function useReordenarOpciones(codigo: string) {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: (ids: number[]) => api.reordenarOpciones(codigo, ids),
    onSuccess: invalidar,
    onError: (error) => showToast(mensajeDeError(error, 'No se pudo guardar el orden.'), 'error'),
  })
}

export function useEliminarOpcion(codigo: string) {
  const invalidar = useInvalidacion()
  return useMutation({
    mutationFn: (id: number) => api.eliminarOpcion(codigo, id),
    onSuccess: async () => {
      await invalidar()
      showToast('Opción eliminada.', 'exito')
    },
  })
}
