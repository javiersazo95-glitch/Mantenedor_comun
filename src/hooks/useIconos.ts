import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/iconos'
import { showToast } from '@/components/Toast'
import { mensajeDeError } from '@/api/client'
import { queryKeys } from './queryKeys'
import type { CampoIcono, DestinoIcono } from '@/api/iconos'

/** Sube o quita el ícono/imagen de una fila de catálogo o de una opción de lista. */
export function useIconos(destino: DestinoIcono | null) {
  const qc = useQueryClient()

  async function invalidar() {
    if (!destino) return
    if (destino.tipo === 'lista-opcion') await qc.invalidateQueries({ queryKey: queryKeys.listas })
    else await qc.invalidateQueries({ queryKey: queryKeys.catalogo(destino.tipo) })
    await qc.invalidateQueries({ queryKey: queryKeys.configVersion })
    await qc.invalidateQueries({ queryKey: ['bootstrap'] })
  }

  const subir = useMutation({
    mutationFn: ({ campo, archivo }: { campo: CampoIcono; archivo: File }) => {
      if (!destino) throw new Error('Guarda el registro antes de subir un ícono.')
      return api.subirIcono(destino, campo, archivo)
    },
    onSuccess: async () => {
      await invalidar()
      showToast('Archivo subido.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error, 'No se pudo subir el archivo.'), 'error'),
  })

  const quitar = useMutation({
    mutationFn: ({ campo }: { campo: CampoIcono }) => {
      if (!destino) throw new Error('Sin registro.')
      return api.quitarIcono(destino, campo)
    },
    onSuccess: async () => {
      await invalidar()
      showToast('Archivo quitado. Los clientes vuelven a su ícono por defecto.', 'exito')
    },
    onError: (error) => showToast(mensajeDeError(error), 'error'),
  })

  return { subir, quitar, ocupado: subir.isPending || quitar.isPending }
}
