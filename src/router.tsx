import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from './auth/LoginPage'
import { RequireSuperAdmin } from './auth/RequireSuperAdmin'
import { AppShell } from './layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { CatalogoPage } from './pages/catalogos/CatalogoPage'
import { ListasPage } from './pages/listas/ListasPage'
import { ListaOpcionesPage } from './pages/listas/ListaOpcionesPage'
import { ParametrosPage } from './pages/parametros/ParametrosPage'
import { ParametroHistorialPage } from './pages/parametros/ParametroHistorialPage'
import { VisibilidadPage } from './pages/visibilidad/VisibilidadPage'
import { AuditoriaPage } from './pages/auditoria/AuditoriaPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireSuperAdmin>
        <AppShell />
      </RequireSuperAdmin>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'catalogos', element: <Navigate to="/catalogos/categorias" replace /> },
      { path: 'catalogos/marcas-repuesto', element: <CatalogoPage tipo="marcas-repuesto" /> },
      { path: 'catalogos/marcas-vehiculo', element: <CatalogoPage tipo="marcas-vehiculo" /> },
      { path: 'catalogos/marcas-vehiculo/:padreId/modelos', element: <CatalogoPage tipo="modelos" /> },
      { path: 'catalogos/categorias', element: <CatalogoPage tipo="categorias" /> },
      { path: 'catalogos/categorias/:padreId/subcategorias', element: <CatalogoPage tipo="subcategorias" /> },
      { path: 'listas', element: <ListasPage /> },
      { path: 'listas/:codigo', element: <ListaOpcionesPage /> },
      { path: 'parametros', element: <ParametrosPage /> },
      { path: 'parametros/:clave/historial', element: <ParametroHistorialPage /> },
      { path: 'visibilidad', element: <VisibilidadPage /> },
      { path: 'auditoria', element: <AuditoriaPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
