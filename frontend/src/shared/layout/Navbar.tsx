import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-marca-100 text-marca-700' : 'text-stone-600 hover:bg-stone-100'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadCarrito = useCartStore((s) => s.cantidadTotal())
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const cerrarSesion = async () => {
    await logout()
    queryClient.clear() // borro la cache para no mostrar datos del usuario anterior
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 flex items-center gap-2 text-xl font-bold text-marca-600">
          <span>🍔</span> Food Store
        </Link>

        <NavLink to="/" end className={claseLink}>
          Catálogo
        </NavLink>
        <NavLink to="/carrito" className={claseLink}>
          Carrito
          {cantidadCarrito > 0 && (
            <span className="ml-1.5 rounded-full bg-marca-600 px-1.5 py-0.5 text-xs text-white">
              {cantidadCarrito}
            </span>
          )}
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={claseLink}>
            Mis pedidos
          </NavLink>
        )}
        {usuario?.role === 'admin' && (
          <NavLink to="/admin" className={claseLink}>
            Panel admin
          </NavLink>
        )}

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-stone-600">
                {usuario.full_name}{' '}
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs uppercase text-stone-500">
                  {usuario.role}
                </span>
              </span>
              <button
                onClick={() => void cerrarSesion()}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <Link
                to="/register"
                className="rounded-lg bg-marca-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-marca-700"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
