import { NavLink } from 'react-router-dom'
import { Car, Eye, History, LayoutDashboard, ListChecks, Package, Settings2, SlidersHorizontal, Tags } from 'lucide-react'

const SECCIONES = [
  {
    titulo: 'General',
    items: [{ a: '/', etiqueta: 'Inicio', icono: LayoutDashboard, exacto: true }],
  },
  {
    titulo: 'Catálogos',
    items: [
      { a: '/catalogos/categorias', etiqueta: 'Categorías', icono: Tags },
      { a: '/catalogos/marcas-repuesto', etiqueta: 'Marcas de repuesto', icono: Package },
      { a: '/catalogos/marcas-vehiculo', etiqueta: 'Marcas de vehículo', icono: Car },
    ],
  },
  {
    titulo: 'Configuración',
    items: [
      { a: '/listas', etiqueta: 'Listas de opciones', icono: ListChecks },
      { a: '/parametros', etiqueta: 'Parámetros', icono: SlidersHorizontal },
      { a: '/visibilidad', etiqueta: 'Visibilidad por cliente', icono: Eye },
    ],
  },
  {
    titulo: 'Control',
    items: [{ a: '/auditoria', etiqueta: 'Auditoría', icono: History }],
  },
]

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <div className="sidebar-marca">
        <Settings2 size={22} />
        <div>
          Mantenedor común
          <small>RepuesTop</small>
        </div>
      </div>
      {SECCIONES.map((s) => (
        <div className="sidebar-seccion" key={s.titulo}>
          <div className="sidebar-seccion-titulo">{s.titulo}</div>
          {s.items.map((item) => (
            <NavLink
              key={item.a}
              to={item.a}
              end={'exacto' in item && item.exacto}
              className={({ isActive }) => `sidebar-link${isActive ? ' activo' : ''}`}
            >
              <item.icono size={17} />
              {item.etiqueta}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="sidebar-pie">Los cambios se reflejan en app, market, panel y backoffice en menos de un minuto.</div>
    </nav>
  )
}
