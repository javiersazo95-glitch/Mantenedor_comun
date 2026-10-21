import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RequireSuperAdmin } from './RequireSuperAdmin'
import type { Usuario } from '@/types/auth'

const mockAuth = vi.fn()
vi.mock('./AuthContext', () => ({ useAuth: () => mockAuth() }))

function usuario(rol: Usuario['rol']): Usuario {
  return { id: 1, email: 'ana@repuestop.cl', nombre: 'Ana', iniciales: 'AN', rol }
}

function renderConRuta() {
  return render(
    <MemoryRouter initialEntries={['/parametros']}>
      <Routes>
        <Route path="/login" element={<p>pantalla de login</p>} />
        <Route
          path="/parametros"
          element={
            <RequireSuperAdmin>
              <p>contenido protegido</p>
            </RequireSuperAdmin>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireSuperAdmin', () => {
  it('muestra el contenido a un SUPER_ADMIN', () => {
    mockAuth.mockReturnValue({ autenticado: true, cargando: false, esSuperAdmin: true, usuario: usuario('SUPER_ADMIN'), logout: vi.fn() })
    renderConRuta()
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })

  it('muestra "Sin acceso" a un operador autenticado', () => {
    mockAuth.mockReturnValue({ autenticado: true, cargando: false, esSuperAdmin: false, usuario: usuario('OPERADOR'), logout: vi.fn() })
    renderConRuta()
    expect(screen.getByRole('alert')).toHaveTextContent('Sin acceso')
    expect(screen.queryByText('contenido protegido')).not.toBeInTheDocument()
  })

  it('redirige al login si no hay sesión', () => {
    mockAuth.mockReturnValue({ autenticado: false, cargando: false, esSuperAdmin: false, usuario: null, logout: vi.fn() })
    renderConRuta()
    expect(screen.getByText('pantalla de login')).toBeInTheDocument()
  })

  it('no decide mientras la sesión se restaura', () => {
    mockAuth.mockReturnValue({ autenticado: false, cargando: true, esSuperAdmin: false, usuario: null, logout: vi.fn() })
    renderConRuta()
    expect(screen.getByText(/Cargando sesión/)).toBeInTheDocument()
  })
})
