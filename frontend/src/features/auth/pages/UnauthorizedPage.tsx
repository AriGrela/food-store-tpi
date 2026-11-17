import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="text-5xl">🚫</div>
      <h1 className="mt-4 text-2xl font-bold">Sin permiso</h1>
      <p className="mt-2 text-stone-600">No tenés permisos para ver esta página.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-marca-600 px-4 py-2 font-medium text-white hover:bg-marca-700"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
