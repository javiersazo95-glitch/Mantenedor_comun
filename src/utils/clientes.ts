import { CLIENTES, type Cliente } from '@/types/comun'

/** `clientes` viaja como CSV (`APP,MARKET`) o `TODOS`. */
export function parsearClientes(csv: string | null | undefined): Cliente[] {
  if (!csv || csv.trim().toUpperCase() === 'TODOS') return ['TODOS']
  return csv
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter((c): c is Cliente => CLIENTES.includes(c as Cliente))
}

export function serializarClientes(clientes: Cliente[]): string {
  if (clientes.length === 0 || clientes.includes('TODOS')) return 'TODOS'
  return clientes.join(',')
}
