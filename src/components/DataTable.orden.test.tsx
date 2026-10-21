import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type Columna } from './DataTable'
import { mover } from '@/utils/mover'

interface Fila {
  id: number
  nombre: string
}

const columnas: Columna<Fila>[] = [{ clave: 'nombre', titulo: 'Nombre', render: (f) => f.nombre }]
const filas: Fila[] = [
  { id: 1, nombre: 'Frenos' },
  { id: 2, nombre: 'Motor' },
  { id: 3, nombre: 'Suspensión' },
]

describe('DataTable: reordenar con botones', () => {
  it('deshabilita subir en la primera fila y bajar en la última', () => {
    render(<DataTable columnas={columnas} filas={filas} claveFila={(f) => f.id} onReordenar={() => {}} />)
    const subir = screen.getAllByLabelText('Subir')
    const bajar = screen.getAllByLabelText('Bajar')
    expect(subir[0]).toBeDisabled()
    expect(bajar[bajar.length - 1]).toBeDisabled()
    expect(subir[1]).toBeEnabled()
  })

  it('informa origen y destino al bajar una fila', () => {
    const onReordenar = vi.fn()
    render(<DataTable columnas={columnas} filas={filas} claveFila={(f) => f.id} onReordenar={onReordenar} />)
    fireEvent.click(screen.getAllByLabelText('Bajar')[0]!)
    expect(onReordenar).toHaveBeenCalledWith(0, 1)
  })

  it('muestra el estado vacío cuando no hay filas y no está cargando', () => {
    render(<DataTable columnas={columnas} filas={[]} claveFila={(f) => f.id} vacio="Nada por aquí" />)
    expect(screen.getByText('Nada por aquí')).toBeInTheDocument()
  })

  it('la paginación deshabilita anterior en la página 0 y siguiente en la última', () => {
    const onPagina = vi.fn()
    render(
      <DataTable
        columnas={columnas}
        filas={filas}
        claveFila={(f) => f.id}
        paginacion={{ pagina: 0, totalPaginas: 1, totalElementos: 3, tamano: 25, onPagina }}
      />,
    )
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
  })
})

describe('mover', () => {
  it('mueve un elemento y conserva el resto', () => {
    expect(mover([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4])
    expect(mover([1, 2, 3, 4], 3, 0)).toEqual([4, 1, 2, 3])
  })

  it('devuelve la misma lista si el destino está fuera de rango', () => {
    const lista = [1, 2, 3]
    expect(mover(lista, 0, -1)).toBe(lista)
    expect(mover(lista, 2, 3)).toBe(lista)
    expect(mover(lista, 1, 1)).toBe(lista)
  })
})
