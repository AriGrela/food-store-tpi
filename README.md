# 🍔 Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador de **Programación IV** — Tecnicatura Universitaria en Programación a Distancia (UTN).

**Alumno:** Ariel Grela

- 🔗 **Repositorio:** https://github.com/AriGrela/food-store-tpi
- 🎥 **Video de demostración:** 

Aplicación web completa para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

---

## 🧰 Tecnologías

| Parte | Stack |
|---|---|
| Backend | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL (o SQLite en desarrollo), JWT en cookie HttpOnly (python-jose), bcrypt (passlib) |
| Frontend | React 19 + TypeScript (strict), Vite 7, Tailwind CSS 4, TanStack Query, TanStack Form, TanStack Table, Zustand, Axios, React Router 7 |

## ✅ Requisitos

- **Python 3.11, 3.12 o 3.13** (SQLModel no funciona con 3.14)
- **Node.js 20.19 o superior**
- **pnpm 9 o superior** (si no lo tenés: `npm install -g pnpm`)
- **PostgreSQL 15+** _(opcional: para desarrollo alcanza con SQLite, que no requiere instalar nada)_

---

## ⚙️ Backend

### Instalación

```bash
cd backend

# crear y activar el entorno virtual
python -m venv venv
# Windows (PowerShell). Si dice que la ejecución de scripts está deshabilitada,
# correr antes: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### Variables de entorno

Copiar el ejemplo y, si hace falta, editarlo:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | `sqlite:///./foodstore.db` (desarrollo) o `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (el del frontend) | `http://localhost:5173` |

> Para usar PostgreSQL hay que crear antes la base vacía (`CREATE DATABASE foodstore_db;`) y poner la URL en `DATABASE_URL`. Las tablas se crean solas.

### Carga de datos iniciales (seed)

```bash
python -m app.db.seed
```

Crea el usuario administrador, 5 categorías y 12 productos con stock. Es **idempotente**: se puede correr varias veces sin duplicar datos.

### Ejecución

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

---

## 💻 Frontend

### Instalación y ejecución

```bash
cd frontend

# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env

pnpm install
pnpm build   # compila y verifica los tipos (TypeScript strict)
pnpm dev     # servidor de desarrollo
```

Abrir http://localhost:5173

### Variables de entorno

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> Importante: el backend tiene que estar corriendo y `FRONTEND_ORIGIN` del backend tiene que coincidir con la URL del frontend para que viaje la cookie de sesión.

---

## 👤 Usuario administrador (seed)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

Los clientes (rol `user`) se crean desde la pantalla de registro.

---

## 🏗️ Arquitectura

### Backend — capas por módulo

```
Router  →  Service  →  Unit of Work  →  Repository  →  Model
```

- **Router**: HTTP, valida con schemas, resuelve sesión/rol con `Depends`, traduce excepciones de dominio a `HTTPException`.
- **Service**: reglas de negocio. Abre `with self.uow as uow:` y devuelve el schema de salida dentro del bloque.
- **Unit of Work**: abre la sesión en `__enter__` y hace `commit` / `rollback` / `close` en `__exit__`. **Ningún service ni router llama a `session.commit()`**.
- **Repository**: consultas con `select`, hereda de `BaseRepository[T]`.

```
backend/
├── app/
│   ├── main.py              # FastAPI, CORS con credenciales, routers con prefijo /api/v1
│   ├── core/                # config, database, security, deps, unit_of_work, base_repository
│   ├── modules/
│   │   ├── auth/            # register, token (cookie HttpOnly), logout, me
│   │   ├── usuarios/        # modelo Usuario + gestión admin (activar / desactivar)
│   │   ├── categorias/      # CRUD con baja lógica
│   │   ├── productos/       # CRUD, stock, listado paginado con búsqueda y filtros
│   │   └── pedidos/         # creación transaccional, máquina de estados, resumen
│   └── db/seed.py
└── requirements.txt
```

### Reglas de negocio de pedidos

- **RN-01**: el pedido se crea en una sola transacción: valida productos (activos, disponibles, con stock, sin repetidos), descuenta stock y copia nombre y precio en cada línea. Si algo falla, no se guarda nada.
- **RN-02**: máquina de estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, y cancelación desde los dos primeros. Una transición inválida devuelve 400.
- **RN-03**: al cancelar se restituye el stock en la misma transacción.
- **RN-04**: el cliente solo ve y cancela sus pedidos (y solo en PENDIENTE); el admin ve todos.
- **RN-05**: las líneas y el total no cambian después de creado el pedido.
- **RN-06**: forma de pago `EFECTIVO` o `TRANSFERENCIA` y dirección de 5 a 200 caracteres.

### Frontend — organización por features

```
frontend/src/
├── shared/      # api (axiosInstance, handleApiError, queryClient), ui, components, layout
├── features/
│   ├── auth/        # LoginPage, RegisterPage, UnauthorizedPage
│   ├── categorias/  # AdminCategoriasPage, useCategorias
│   ├── productos/   # CatalogoPage, AdminProductosPage, ProductoCard, useProductos
│   ├── usuarios/    # AdminUsuariosPage, useUsuarios
│   └── pedidos/     # Carrito, Checkout, MisPedidos, AdminPedidos, AdminResumen
├── store/       # authStore y cartStore (Zustand + persist)
└── routes/      # AppRouter y ProtectedRoute
```

- **Estado del servidor** con TanStack Query (`useQuery` / `useMutation` + invalidación).
- **Estado del cliente** con Zustand: `authStore` (persiste solo los datos del usuario, nunca el token) y `cartStore` (carrito persistido).
- **Axios** con `withCredentials: true` e interceptor: ante un 401 o una cuenta desactivada limpia la sesión.
- **ProtectedRoute**: sin sesión redirige a `/login`, sin el rol a `/unauthorized`.

---

## 📋 Endpoints principales

| Método | Endpoint | Acceso |
|---|---|---|
| POST | `/auth/register` | Público |
| POST | `/auth/token` | Público |
| POST | `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/admin/usuarios` | admin |
| POST | `/admin/usuarios/{id}/activar` · `/desactivar` | admin |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos` (skip, limit, search, categoria_id, disponible) · `/productos/{id}` | Público |
| POST · PUT · DELETE | `/productos` · `/productos/{id}` | admin |
| PATCH | `/productos/{id}/stock` | admin |
| POST · GET | `/pedidos` | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

La documentación completa con schemas y códigos de respuesta está en `/docs`.
