import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea, mostrarErrores } from '../../../shared/ui/Input'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoCreate } from '../types/producto'

interface ProductoFormProps {
  inicial?: Producto | null
  categorias: Categoria[]
  onGuardar: (datos: ProductoCreate) => Promise<void>
  onCancelar: () => void
}

const validarNumero = (valor: number, nombre: string) => {
  if (Number.isNaN(valor)) return `Ingresá ${nombre}`
  if (valor < 0) return 'No puede ser negativo'
  return undefined
}

export function ProductoForm({ inicial, categorias, onGuardar, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial?.categoria_id ?? categorias[0]?.id ?? 0,
    },
    onSubmit: async ({ value }) => {
      await onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: Math.trunc(value.stock),
        disponible: value.disponible,
        categoria_id: value.categoria_id,
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
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarNumero(value, 'un precio') }}>
          {(field) => (
            <Input
              label="Precio ($)"
              type="number"
              min={0}
              step="0.01"
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
            />
          )}
        </form.Field>

        <form.Field name="stock" validators={{ onChange: ({ value }) => validarNumero(value, 'el stock') }}>
          {(field) => (
            <Input
              label="Stock"
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
      </div>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (!value ? 'Elegí una categoría' : undefined) }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            error={mostrarErrores(field.state.meta.errors, field.state.meta.isTouched)}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen"
            placeholder="https://..."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
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
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
