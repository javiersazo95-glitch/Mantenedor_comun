/** Clientes que consumen la configuración. `TODOS` aplica a los cuatro. */
export type Cliente = 'APP' | 'MARKET' | 'PANEL' | 'BACKOFFICE' | 'TODOS'

export const CLIENTES: Cliente[] = ['TODOS', 'APP', 'MARKET', 'PANEL', 'BACKOFFICE']

export const CLIENTE_LABEL: Record<Cliente, string> = {
  TODOS: 'Todos los clientes',
  APP: 'App móvil',
  MARKET: 'Market web',
  PANEL: 'Panel vendedor',
  BACKOFFICE: 'Backoffice',
}

/** Forma del `PageResponseDTO<T>` del backend (dto/admin/PageResponseDTO.java). */
export interface PaginaDTO<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface ParametrosPagina {
  page?: number
  size?: number
  sort?: string
}

export const PAGINA_VACIA: PaginaDTO<never> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 25,
}
