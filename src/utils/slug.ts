/**
 * Misma regla que `util/Slug.java` del backend: minúsculas, sin tildes, todo lo que no sea
 * letra o número pasa a guion. El backend lo recalcula; aquí solo se sugiere al escribir el nombre.
 */
export function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
