import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/catalogos'
import { queryKeys } from './queryKeys'
import { showToast } from '@/components/Toast'
import { mensajeDeError } from '@/api/client'
import type { CatalogoFormulario, FilaCatalogo, FiltroCatalogo, TipoCatalogo } from '@/types/catalogos'
import type { ParametrosPagina } from '@/types/comun'

/**
 * Tras cualquier escritura se invalida todo el tipo (listas, ítems, referencias) y la versión de
 * configuración que muestra la barra superior. Es más simple y seguro que invalidar clave por clave.
 */
function useInvalidacion(tipo: TipoCatalogo) {
  const qc = useQueryClient()
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.catalogo(tipo) }),
      qc.invalidateQueries({ queryKey: queryKeys.configVersion }),
      qc.invalidateQueries({ queryKey: ['bootstrap'] }),
    ])
  }
}

export function useCatalogoLista<T extends FilaCatalogo = FilaCatalogo>(tipo: TipoCatalogo, filtro: FiltroCatalogo, pagina: ParametrosPagina) {
  return useQuery({
    queryKey: queryKeys.catalogoLista(tipo, filtro, pagina),
    queryFn: () => api.listarCatalogo<T>(tipo, filtro, pagina),
    placeholderData: keepPreviousData,
  })
}

export function useCatalogoItem<T extends FilaCatalogo = FilaCatalogo>(tipo: TipoCatalogo, id: number | null) {
  return useQuery({
    queryKey: queryKeys.catalogoItem(tipo, id ?? 0),
    queryFn: () => api.obtenerCatalogo<T>(tipo, id as number),
    enabled: id !== null,
  })
}

export function useReferencias(tipo: TipoCatalogo, id: number | null) {
  return useQuery({
    queryKey: queryKeys.catalogoReferencias(tipo, id ?? 0),
    queryFn: () => api.referenciasCatalogo(tipo, id as number),
    enabled: id !== null,
  })
}

export function useGuardarCatalogo(tipo: TipoCatalogo) {
  const invalidar = useInvalidacion(tipo)
  return useMutation({
    mutationFn: ({ id, cuerpo }: { id: number | null; cuerpo: CatalogoFormulario }) =>
      id === null ? api.crearCatalogo(tipo, cuerpo) : api.editarCatalogo(tipo, id, cuerpo),
    onSuccess: async (_fila, { id }) => {
      await invalidar()
      showToast(id === null ? 'Registro creado.' : 'Cambios guardados.', 'exito')
    },
  })
}

export function useActivarCatalogo(tipo: TipoCatalogo) {
  const invalidar = useInvalidacion(tipo)
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => api.activarCatalogo(tipo, id, activo),
    onSuccess: async (_fila, { activo }) => {
      await invalidar()
      showToast(activo ? 'Activado: vuelve a mostrarse en los clientes.' : 'Desactivado: deja de mostrarse en los clientes.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })
}

export function useReordenarCatalogo(tipo: TipoCatalogo) {
  const invalidar = useInvalidacion(tipo)
  return useMutation({
    mutationFn: (ids: number[]) => api.reordenarCatalogo(tipo, ids),
    onSuccess: invalidar,
    onError: (error) => showToast(mensajeDeError(error, 'No se pudo guardar el orden.'), 'error'),
  })
}

export function useReasignarCatalogo(tipo: TipoCatalogo) {
  const invalidar = useInvalidacion(tipo)
  return useMutation({
    mutationFn: ({ id, destinoId }: { id: number; destinoId: number }) => api.reasignarCatalogo(tipo, id, destinoId),
    onSuccess: async () => {
      await invalidar()
      showToast('Productos reasignados.', 'exito')
    },
  })
}

export function useEliminarCatalogo(tipo: TipoCatalogo) {
  const invalidar = useInvalidacion(tipo)
  return useMutation({
    mutationFn: (id: number) => api.eliminarCatalogo(tipo, id),
    onSuccess: async () => {
      await invalidar()
      showToast('Registro eliminado.', 'exito')
    },
  })
}

export function useRevisarMarca() {
  const invalidar = useInvalidacion('marcas-repuesto')
  return useMutation({
    mutationFn: (id: number) => api.revisarMarcaRepuesto(id),
    onSuccess: async () => {
      await invalidar()
      showToast('Marca marcada como revisada.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })
}
