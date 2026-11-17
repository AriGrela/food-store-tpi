import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input, mostrarErrores } from '../../../shared/ui/Input'
import { Alerta } from '../../../shared/components/Alerta'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  // si venia de una ruta protegida vuelvo ahi despues del login
  const estado = location.state as { desde?: string; registrado?: boolean } | null
  const destino = estado?.desde ?? '/'

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) {
    return <Navigate to={destino} replace />
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-stone-500">Ingresá con tu usuario para hacer pedidos.</p>

        {estado?.registrado && (
          <div className="mt-4">
            <Alerta tipo="exito" mensaje="¡Cuenta creada! Ahora iniciá sesión." />
          </div>
        )}

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'Ingresá tu usuario' : undefined) }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu contraseña' : undefined) }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
              />
            )}
          </form.Field>

          <Alerta mensaje={error} />

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-stone-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-marca-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
