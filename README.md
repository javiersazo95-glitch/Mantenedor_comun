# Mantenedor común de RepuesTop

Aplicación web para SUPER_ADMIN desde la que se configura, sin tocar código ni desplegar, todo lo que
comparten la app móvil, el Market web, el panel vendedor y el backoffice:

- **Catálogos**: categorías y subcategorías, marcas de repuesto, marcas de vehículo y modelos. Activar,
  desactivar, reordenar, reasignar productos, subir íconos e imágenes, destacar.
- **Listas de opciones**: valores de los desplegables (condición, garantías, couriers, métodos de envío,
  bancos, motivos, combustibles…). Ocultar, renombrar, reordenar, ícono, color, metadata, clientes donde aplica.
- **Parámetros**: comisiones, tasas de pasarela, plazos y topes, con historial, motivo y vigencia programada.
- **Visibilidad por cliente**: feature flags para mostrar u ocultar componentes, secciones y menús en cada cliente,
  con vista previa de lo que recibe cada uno.
- **Auditoría**: quién cambió qué, cuándo, con el estado anterior y el siguiente.

El backend expone todo esto bajo `/api/v1/mantenedor/**` (solo SUPER_ADMIN) y entrega la configuración
a los clientes por `GET /api/v1/config/bootstrap?cliente=APP|MARKET|PANEL|BACKOFFICE`. El contrato está en
`RespuesTop-mono-repo/docs/arquitectura/contrato-mantenedor-bootstrap.md`.

## Stack

React 19, TypeScript estricto, Vite, TanStack Query 5, axios, react-router 7, lucide-react, CSS propio
(`src/styles`). Tests con Vitest + Testing Library. Despliegue en Vercel (`vercel.json`).

## Desarrollo

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8080
npm run dev            # http://localhost:5189, con proxy de /api/v1 al backend local
```

Scripts: `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm test`.

Login con una cuenta SUPER_ADMIN del backoffice (`POST /auth/backoffice/login`). Un operador con
credenciales válidas ve "Sin acceso".

## Estructura

```
src/api/         un archivo por dominio sobre el cliente axios (client.ts)
src/types/       tipos del contrato (bootstrap.ts es el espejo de BootstrapDTO.java)
src/hooks/       react-query por dominio; cada mutación invalida su dominio, la versión y el bootstrap
src/components/  DataTable (orden con flechas), FormModal, ConfirmDialog, Toggle, IconUploader, ColorField, JsonField…
src/pages/       Dashboard, catalogos/, listas/, parametros/, visibilidad/, auditoria/
src/auth/        AuthContext (token en sessionStorage), RequireSuperAdmin, LoginPage
src/utils/       format (parámetros), slug, validators, clientes, mover
scripts/         migrar-iconos.mjs (migración única de los SVG locales del Market a R2)
```

Convenciones: formularios montados con `key` por registro (sin sincronizar props en efectos); el `slug`
de un catálogo es inmutable porque es la clave de cruce con los clientes; nunca se muestra un 0 o una
tabla vacía ante un error de carga (se muestra el error con reintento).

## Migración de íconos a R2

Una sola vez, con el backend ya desplegado y un token SUPER_ADMIN:

```bash
MANTENEDOR_TOKEN=<jwt> node scripts/migrar-iconos.mjs --api https://api-dev.repuestop.cl --market ../Repuestop_Market
```

Con `--dry-run` solo muestra el emparejamiento. El reporte queda en `scripts/salida/`.

## Despliegue

Vercel con dominio `mantenedor.repuestop.cl` (y `dev-mantenedor.repuestop.cl`). Ambos orígenes deben estar en
el CORS del backend (`application-prod.properties` / `application-dev.properties`). La CSP de `vercel.json`
permite conectar solo a `api.repuestop.cl` y `api-dev.repuestop.cl`.
