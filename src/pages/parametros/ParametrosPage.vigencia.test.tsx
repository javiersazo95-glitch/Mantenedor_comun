import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { CambioParametroModal } from './ParametrosPage'
import type { Parametro } from '@/types/parametros'

const mutateAsync = vi.fn().mockResolvedValue(undefined)
vi.mock('@/hooks/useParametros', () => ({
  useCambiarParametro: () => ({ mutateAsync, isPending: false }),
}))

const parametro: Parametro = {
  clave: 'comision.tasa.alta',
  grupo: 'COMISION',
  tipo: 'PERCENT',
  valor: '0.07',
  valorDefault: '0.07',
  descripcion: 'Comisión tramo alto',
  unidad: null,
  minimo: 0,
  maximo: 0.5,
  publico: true,
  editable: true,
  vigenteDesde: '2026-10-18T00:00:00Z',
  updatedAt: null,
  updatedBy: null,
}

function renderModal() {
  const qc = new QueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <CambioParametroModal parametro={parametro} onCerrar={() => {}} />
    </QueryClientProvider>,
  )
}

describe('CambioParametroModal', () => {
  it('muestra el porcentaje en formato humano y lo envía como fracción con motivo', async () => {
    renderModal()
    const input = screen.getByLabelText(/Nuevo valor/) as HTMLInputElement
    expect(input.value).toBe('7')
    fireEvent.change(input, { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'fin marcha blanca' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar ahora' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ clave: 'comision.tasa.alta', cambio: { valor: '0.1', motivo: 'fin marcha blanca', vigenteDesde: undefined } }))
  })

  it('exige motivo y rechaza una fecha programada en el pasado', async () => {
    mutateAsync.mockClear()
    renderModal()
    fireEvent.change(screen.getByLabelText(/Nuevo valor/), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar ahora' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/motivo/)

    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'prueba' } })
    fireEvent.click(screen.getByLabelText('Programar para una fecha futura'))
    fireEvent.change(screen.getByLabelText(/Vigente desde/), { target: { value: '2020-01-01T10:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Programar cambio' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/futura/)
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('rechaza un valor fuera del rango permitido antes de llamar al backend', async () => {
    mutateAsync.mockClear()
    renderModal()
    fireEvent.change(screen.getByLabelText(/Nuevo valor/), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar ahora' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/máximo/)
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
