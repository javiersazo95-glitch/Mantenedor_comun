import { useQueryClient } from '@tanstack/react-query'
import { LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { useConfigVersion } from '@/hooks/useBootstrapPreview'
import { useToast } from '@/components/Toast'

export function Topbar() {
  const { usuario, logout } = useAuth()
  const queryClient = useQueryClient()
  const { data: version, isFetching } = useConfigVersion()
  const { mostrar } = useToast()

  async function refrescar() {
    await queryClient.invalidateQueries()
    mostrar('Datos actualizados.')
  }

  return (
    <header className="topbar">
      <span className="topbar-version" title="Versión de la configuración publicada. Sube con cada cambio y es lo que los clientes usan para saber que deben refrescar.">
        Versión de configuración: <strong className="mono">{version ?? '…'}</strong>
        <button type="button" className="boton boton-fantasma boton-icono" onClick={() => void refrescar()} aria-label="Refrescar datos" disabled={isFetching}>
          <RefreshCw size={15} />
        </button>
      </span>
      <span className="topbar-usuario">
        <span className="avatar" aria-hidden>
          {usuario?.iniciales}
        </span>
        <span>
          <strong>{usuario?.nombre}</strong>
          <br />
          <span className="texto-suave texto-pequeno">{usuario?.email}</span>
        </span>
        <button type="button" className="boton boton-fantasma boton-icono" onClick={() => void logout()} aria-label="Cerrar sesión" title="Cerrar sesión">
          <LogOut size={16} />
        </button>
      </span>
    </header>
  )
}
