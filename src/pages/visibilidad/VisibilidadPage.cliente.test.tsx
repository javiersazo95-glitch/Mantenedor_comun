import { fireEvent, render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { VisibilidadPage } from './VisibilidadPage'
import type { FeatureFlag } from '@/types/flags'

const flags: FeatureFlag[] = [
  { id: 1, clave: 'market.home.testimonios', cliente: 'MARKET', habilitado: true, grupo: 'home', descripcion: 'Testimonios del home', metadata: null, updatedAt: null, updatedBy: null },
  { id: 2, clave: 'panel.nav.historial', cliente: 'PANEL', habilitado: false, grupo: 'navegacion', descripcion: 'Historial de cargas', metadata: null, updatedAt: null, updatedBy: null },
  { id: 3, clave: 'global.mantenimiento', cliente: 'TODOS', habilitado: false, grupo: 'global', descripcion: 'Banner de mantenimiento', metadata: { mensaje: 'Volvemos a las 9' }, updatedAt: null, updatedBy: null },
]

const editar = vi.fn()

vi.mock('@/hooks/useFlags', () => ({
  useFlags: () => ({ data: flags, isLoading: false, isError: false, error: null, refetch: vi.fn() }),
  useEditarFlag: () => ({ mutate: editar, isPending: false }),
  useCrearFlag: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useEliminarFlag: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/useBootstrapPreview', () => ({
  useBootstrapPreview: () => ({ data: undefined, isError: false, isFetching: false, refetch: vi.fn() }),
}))

function renderPagina() {
  const qc = new QueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <VisibilidadPage />
    </QueryClientProvider>,
  )
}

describe('VisibilidadPage: pestañas por cliente', () => {
  it('muestra los flags del cliente elegido más los globales', () => {
    renderPagina()
    // Pestaña inicial: Market.
    expect(screen.getByText('market.home.testimonios')).toBeInTheDocument()
    expect(screen.getByText('global.mantenimiento')).toBeInTheDocument()
    expect(screen.queryByText('panel.nav.historial')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Panel vendedor' }))
    expect(screen.getByText('panel.nav.historial')).toBeInTheDocument()
    expect(screen.queryByText('market.home.testimonios')).not.toBeInTheDocument()
  })

  it('el interruptor envía el cambio de habilitado con el id del flag', () => {
    renderPagina()
    const fila = screen.getByText('market.home.testimonios').closest('.fila') as HTMLElement
    fireEvent.click(within(fila).getByRole('switch'))
    expect(editar).toHaveBeenCalledWith({ id: 1, cuerpo: { habilitado: false } })
  })

  it('marca como global los flags de TODOS cuando se mira un cliente concreto', () => {
    renderPagina()
    const fila = screen.getByText('global.mantenimiento').closest('.fila') as HTMLElement
    expect(within(fila).getByText('global')).toBeInTheDocument()
  })
})
