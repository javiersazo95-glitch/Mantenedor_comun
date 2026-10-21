import { Navigate, useLocation } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

/**
 * Guarda de ruta. Todo el mantenedor exige SUPER_ADMIN: un operador de backoffice que entre con
 * credenciales válidas ve "Sin acceso" en vez de las pantallas. La autorización real la hace el
 * backend en `/api/v1/mantenedor/**`; esto solo evita mostrar una UI que devolvería 403.
 */
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { autenticado, cargando, esSuperAdmin, usuario, logout } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="pantalla-centrada">
        <p className="texto-suave">Cargando sesión…</p>
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (!esSuperAdmin) {
    return (
      <div className="pantalla-centrada">
        <div className="tarjeta tarjeta-aviso" role="alert">
          <ShieldOff size={28} />
          <h1>Sin acceso</h1>
          <p>
            La cuenta <strong>{usuario?.email}</strong> no tiene el rol SUPER_ADMIN. El mantenedor común solo
            está disponible para los socios.
          </p>
          <button type="button" className="boton boton-secundario" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
