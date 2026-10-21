import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import { useAuth } from './AuthContext'
import { mensajeDeError } from '@/api/client'

export function LoginPage() {
  const { login, autenticado, cargando } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const destino = (location.state as { desde?: string } | null)?.desde ?? '/'

  if (!cargando && autenticado) return <Navigate to={destino} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await login(email, password)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo iniciar sesión.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pantalla-centrada login">
      <form className="tarjeta login-tarjeta" onSubmit={onSubmit}>
        <div className="login-marca">
          <span className="login-icono">
            <Settings2 size={22} />
          </span>
          <div>
            <h1>Mantenedor común</h1>
            <p className="texto-suave">RepuesTop · configuración central</p>
          </div>
        </div>

        <label className="campo">
          <span>Correo</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="boton boton-primario" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
        <p className="texto-suave texto-pequeno">Solo cuentas SUPER_ADMIN del backoffice.</p>
      </form>
    </div>
  )
}
