import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input, mostrarErrores } from '../../../shared/ui/Input'
import { Alerta } from '../../../shared/components/Alerta'
import type { UserCreate } from '../types/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const registrar = useMutation({
    mutationFn: (datos: UserCreate) => authApi.register(datos),
    onSuccess: () => navigate('/login', { state: { registrado: true } }),
    onError: (e) => setError(handleApiError(e)),
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      await registrar
        .mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        .catch(() => undefined) // el error ya se muestra con onError
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">Registrate para empezar a pedir.</p>

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
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3
                  ? 'Mínimo 3 caracteres'
                  : value.trim().length > 50
                    ? 'Máximo 50 caracteres'
                    : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) => (value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (!EMAIL_REGEX.test(value.trim()) ? 'Email inválido' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password') ? 'Las contraseñas no coinciden' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Repetir contraseña"
                type="password"
                autoComplete="new-password"
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
                Registrarme
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-stone-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-marca-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
