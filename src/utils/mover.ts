/** Mueve un elemento de un índice a otro y devuelve una copia. Fuera de rango o sin cambio devuelve la misma lista. */
export function mover<T>(lista: T[], origen: number, destino: number): T[] {
  if (destino < 0 || destino >= lista.length || origen === destino) return lista
  const copia = [...lista]
  const [item] = copia.splice(origen, 1)
  copia.splice(destino, 0, item as T)
  return copia
}
