import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea, mostrarErrores } from '../../../shared/ui/Input'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface CheckoutFormProps {
  onConfirmar: (datos: DatosCheckout) => Promise<void>
  deshabilitado?: boolean
}

export function CheckoutForm({ onConfirmar, deshabilitado = false }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      await onConfirmar({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
      })
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) =>
            value.trim().length < 5
              ? 'La dirección debe tener al menos 5 caracteres'
              : value.trim().length > 200
                ? 'Máximo 200 caracteres'
                : undefined,
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Ej: Av. Siempre Viva 742, Mendoza"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            placeholder="Ej: tocar timbre 2B, sin cebolla..."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || deshabilitado} cargando={isSubmitting}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
