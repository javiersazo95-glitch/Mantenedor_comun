#!/usr/bin/env node
/**
 * Migración única de los íconos locales a R2 a través del mantenedor.
 *
 * Lee los SVG de marcas de vehículo que hoy viven en `Repuestop_Market/public/brand-logos/`,
 * los empareja por slug con las marcas del backend y los sube con
 * `POST /api/v1/mantenedor/iconos/marcas-vehiculo/{id}`. Hace lo mismo con las imágenes de
 * categoría y subcategoría declaradas en `Repuestop_Market/src/data/categoriesFallback.js`
 * (o `categories.js` si aún no se renombró).
 *
 * Los archivos locales no se borran: siguen siendo el fallback de los clientes.
 *
 * Uso:
 *   MANTENEDOR_TOKEN=<jwt SUPER_ADMIN> node scripts/migrar-iconos.mjs [--api http://localhost:8080] [--market ../Repuestop_Market] [--solo marcas|categorias] [--dry-run]
 *
 * Escribe un reporte en scripts/salida/reporte-migracion-iconos.json con los emparejados,
 * los no encontrados (para resolver a mano en el mantenedor) y los errores.
 */
import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function arg(nombre, porDefecto) {
  const i = process.argv.indexOf(`--${nombre}`)
  if (i === -1) return porDefecto
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : true
}

const API = String(arg('api', process.env.VITE_API_URL ?? 'http://localhost:8080')).replace(/\/+$/, '')
const MARKET = path.resolve(__dirname, '..', String(arg('market', '../Repuestop_Market')))
const SOLO = arg('solo', null)
const DRY_RUN = arg('dry-run', false) === true
const TOKEN = process.env.MANTENEDOR_TOKEN

if (!TOKEN && !DRY_RUN) {
  console.error('Falta MANTENEDOR_TOKEN (JWT de un SUPER_ADMIN). Usa --dry-run para solo ver el emparejamiento.')
  process.exit(1)
}

const reporte = { api: API, market: MARKET, dryRun: DRY_RUN, marcasVehiculo: { subidas: [], sinMarca: [], errores: [] }, categorias: { subidas: [], sinCategoria: [], errores: [] } }

function slugificar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function api(ruta, opciones = {}) {
  const res = await fetch(`${API}/api/v1${ruta}`, {
    ...opciones,
    headers: { Authorization: `Bearer ${TOKEN}`, 'X-Client': 'mantenedor', ...(opciones.headers ?? {}) },
  })
  if (!res.ok) {
    const texto = await res.text().catch(() => '')
    throw new Error(`${res.status} ${ruta}: ${texto.slice(0, 200)}`)
  }
  return res.status === 204 ? null : res.json()
}

async function listarTodo(tipo, extra = '') {
  const data = await api(`/mantenedor/catalogos/${tipo}?page=0&size=500&sort=nombre,asc${extra}`)
  return data.content ?? []
}

function tipoMime(archivo) {
  const ext = path.extname(archivo).toLowerCase()
  return ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : null
}

async function subir(tipo, id, campo, rutaArchivo) {
  const mime = tipoMime(rutaArchivo)
  if (!mime) throw new Error(`Tipo no soportado: ${rutaArchivo}`)
  const { size } = await stat(rutaArchivo)
  if (size > 512 * 1024) throw new Error(`Supera 512 KB (${Math.round(size / 1024)} KB): ${rutaArchivo}`)
  if (DRY_RUN) return { dryRun: true }
  const form = new FormData()
  form.append('archivo', new Blob([await readFile(rutaArchivo)], { type: mime }), path.basename(rutaArchivo))
  return api(`/mantenedor/iconos/${tipo}/${id}?campo=${campo}`, { method: 'POST', body: form })
}

/** Alias de slugs de archivo → slug de marca (mismos que `src/data/vehicleBrands.js` del Market). */
async function cargarAliasMarcas() {
  const alias = { kiamotors: 'kia', susuki: 'suzuki', vw: 'volkswagen', skodaauto: 'skoda' }
  try {
    const mod = await import(pathToFileURL(path.join(MARKET, 'src', 'data', 'vehicleBrands.js')).href)
    Object.assign(alias, mod.BRAND_SLUG_ALIASES ?? {})
  } catch {
    // Si el módulo no se puede importar (JSX, imports de assets) se usan los alias conocidos.
  }
  return alias
}

async function migrarMarcasVehiculo() {
  const carpeta = path.join(MARKET, 'public', 'brand-logos')
  const archivos = (await readdir(carpeta)).filter((f) => /\.(svg|png|webp)$/i.test(f))
  const marcas = DRY_RUN && !TOKEN ? [] : await listarTodo('marcas-vehiculo')
  const porSlug = new Map(marcas.map((m) => [m.slug ?? slugificar(m.nombre), m]))
  const alias = await cargarAliasMarcas()

  for (const archivo of archivos) {
    const base = path.basename(archivo, path.extname(archivo)).toLowerCase()
    const slug = alias[base] ?? base
    const marca = porSlug.get(slug) ?? porSlug.get(slugificar(slug))
    if (!marca) {
      reporte.marcasVehiculo.sinMarca.push(archivo)
      continue
    }
    if (marca.iconoUrl && !DRY_RUN) {
      reporte.marcasVehiculo.subidas.push({ archivo, marca: marca.nombre, omitido: 'ya tiene ícono' })
      continue
    }
    try {
      await subir('marcas-vehiculo', marca.id, 'icono', path.join(carpeta, archivo))
      reporte.marcasVehiculo.subidas.push({ archivo, marca: marca.nombre, id: marca.id })
      console.log(`✓ marca ${marca.nombre} ← ${archivo}`)
    } catch (err) {
      reporte.marcasVehiculo.errores.push({ archivo, marca: marca.nombre, error: String(err.message ?? err) })
      console.error(`✗ ${archivo}: ${err.message}`)
    }
  }
}

/** Extrae pares nombre → ruta de imagen del archivo de categorías del Market sin ejecutar su código. */
async function leerImagenesCategorias() {
  const candidatos = ['categoriesFallback.js', 'categories.js'].map((f) => path.join(MARKET, 'src', 'data', f))
  let fuente = null
  for (const c of candidatos) {
    try {
      fuente = await readFile(c, 'utf8')
      break
    } catch {
      // probar el siguiente
    }
  }
  if (!fuente) throw new Error('No se encontró categories.js ni categoriesFallback.js en el Market')

  const categorias = []
  // Bloques { id: 'x', nombre: 'Y', ..., image: '/category-parts/...', subcategoryImages: { 'Sub': '/...' } }
  const bloque = /nombre:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'(?:[\s\S]*?subcategoryImages:\s*\{([\s\S]*?)\})?/g
  let m
  while ((m = bloque.exec(fuente))) {
    const [, nombre, image, subs] = m
    const subcategorias = []
    if (subs) {
      const par = /'([^']+)':\s*'([^']+)'/g
      let s
      while ((s = par.exec(subs))) subcategorias.push({ nombre: s[1], image: s[2] })
    }
    categorias.push({ nombre, image, subcategorias })
  }
  return categorias
}

async function migrarCategorias() {
  const locales = await leerImagenesCategorias()
  const remotas = DRY_RUN && !TOKEN ? [] : await listarTodo('categorias')
  const porSlug = new Map(remotas.map((c) => [c.slug ?? slugificar(c.nombre), c]))

  for (const local of locales) {
    const cat = porSlug.get(slugificar(local.nombre))
    if (!cat) {
      reporte.categorias.sinCategoria.push(local.nombre)
      continue
    }
    const rutaImagen = path.join(MARKET, 'public', local.image.replace(/^\//, ''))
    try {
      if (!cat.imagenUrl) {
        await subir('categorias', cat.id, 'imagen', rutaImagen)
        reporte.categorias.subidas.push({ categoria: cat.nombre, archivo: local.image })
        console.log(`✓ categoría ${cat.nombre} ← ${local.image}`)
      }
    } catch (err) {
      reporte.categorias.errores.push({ categoria: cat.nombre, archivo: local.image, error: String(err.message ?? err) })
    }

    if (local.subcategorias.length === 0) continue
    const subs = DRY_RUN && !TOKEN ? [] : await listarTodo('subcategorias', `&padreId=${cat.id}`)
    const subPorSlug = new Map(subs.map((s) => [s.slug ?? slugificar(s.nombre), s]))
    for (const sl of local.subcategorias) {
      const sub = subPorSlug.get(slugificar(sl.nombre))
      if (!sub) {
        reporte.categorias.sinCategoria.push(`${cat.nombre} > ${sl.nombre}`)
        continue
      }
      if (sub.imagenUrl) continue
      try {
        await subir('subcategorias', sub.id, 'imagen', path.join(MARKET, 'public', sl.image.replace(/^\//, '')))
        reporte.categorias.subidas.push({ categoria: cat.nombre, subcategoria: sub.nombre, archivo: sl.image })
        console.log(`✓ subcategoría ${cat.nombre} > ${sub.nombre} ← ${sl.image}`)
      } catch (err) {
        reporte.categorias.errores.push({ categoria: cat.nombre, subcategoria: sub.nombre, archivo: sl.image, error: String(err.message ?? err) })
      }
    }
  }
}

async function main() {
  if (!SOLO || SOLO === 'marcas') await migrarMarcasVehiculo()
  if (!SOLO || SOLO === 'categorias') await migrarCategorias()
  const salida = path.join(__dirname, 'salida')
  await mkdir(salida, { recursive: true })
  const archivo = path.join(salida, 'reporte-migracion-iconos.json')
  await writeFile(archivo, JSON.stringify(reporte, null, 2), 'utf8')
  console.log(`\nReporte: ${archivo}`)
  console.log(
    `Marcas: ${reporte.marcasVehiculo.subidas.length} subidas, ${reporte.marcasVehiculo.sinMarca.length} sin marca, ${reporte.marcasVehiculo.errores.length} errores. ` +
      `Categorías: ${reporte.categorias.subidas.length} subidas, ${reporte.categorias.sinCategoria.length} sin categoría, ${reporte.categorias.errores.length} errores.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
