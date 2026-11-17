import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input, mostrarErrores } from '../../../shared/ui/Input'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>
  onCancelar: () => void
}

export function StockForm({ producto, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      await onGuardar({ stock: Math.trunc(value.stock), disponible: value.disponible })
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
      <p className="text-sm text-stone-600">
        Producto: <b>{producto.nombre}</b> (stock actual: {producto.stock})
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isNaN(value) ? 'Ingresá el stock' : value < 0 ? 'No puede ser negativo' : undefined,
        }}
      >
        {(field) => (
          <Input
            label="Nuevo stock"
            type="number"
            min={0}
            step="1"
            value={Number.isNaN(field.state.value) ? '' : field.state.value}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            onBlur={field.handleBlur}
            error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-marca-600"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            <span className="text-sm">Disponible para la venta</span>
          </label>
        )}
      </form.Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
              Actualizar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
