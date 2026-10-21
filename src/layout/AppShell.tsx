import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="contenido">
        <Topbar />
        <main className="pagina">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
