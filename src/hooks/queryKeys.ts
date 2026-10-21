import type { FiltroCatalogo, TipoCatalogo } from '@/types/catalogos'
import type { FiltroAuditoria } from '@/types/auditoria'
import type { Cliente, ParametrosPagina } from '@/types/comun'

export const queryKeys = {
  catalogo: (tipo: TipoCatalogo) => ['catalogo', tipo] as const,
  catalogoLista: (tipo: TipoCatalogo, filtro: FiltroCatalogo, pagina: ParametrosPagina) => ['catalogo', tipo, 'lista', filtro, pagina] as const,
  catalogoItem: (tipo: TipoCatalogo, id: number) => ['catalogo', tipo, 'item', id] as const,
  catalogoReferencias: (tipo: TipoCatalogo, id: number) => ['catalogo', tipo, 'referencias', id] as const,
  listas: ['listas'] as const,
  lista: (codigo: string) => ['listas', codigo] as const,
  listaOpciones: (codigo: string) => ['listas', codigo, 'opciones'] as const,
  parametros: (grupo?: string) => ['parametros', grupo ?? 'todos'] as const,
  parametro: (clave: string) => ['parametros', 'item', clave] as const,
  parametroHistorial: (clave: string, pagina: ParametrosPagina) => ['parametros', 'historial', clave, pagina] as const,
  flags: (cliente?: Cliente) => ['flags', cliente ?? 'todos'] as const,
  auditoria: (filtro: FiltroAuditoria, pagina: ParametrosPagina) => ['auditoria', filtro, pagina] as const,
  bootstrap: (cliente: Cliente) => ['bootstrap', cliente] as const,
  configVersion: ['config-version'] as const,
}
