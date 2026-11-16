"""
Carga datos iniciales: usuario admin, categorias y productos.
Es idempotente: si se corre varias veces no duplica nada.

Uso (desde la carpeta backend):  python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def img(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w=600&q=80"


ADMIN = {
    "username": "admin",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas al molde y a la piedra"),
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Ensaladas", "Opciones frescas y livianas"),
    ("Postres", "Algo dulce para terminar"),
    ("Bebidas", "Gaseosas, jugos y aguas"),
]

# (categoria, nombre, descripcion, precio, stock, imagen)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20, img("1513104890138-7c749659a591")),
    ("Pizzas", "Pizza Especial", "Muzzarella, jamón, morrones y huevo", 12500, 15, img("1585238342024-78d387f4a707")),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y cheddar", 8200, 25, img("1568901346375-23c9450c58cd")),
    ("Hamburguesas", "Hamburguesa Doble", "Doble carne, doble cheddar y panceta", 10900, 18, img("1550547660-d9450f859349")),
    ("Hamburguesas", "Papas Fritas", "Porción grande de papas fritas", 4500, 30, img("1573080496219-bb080dd4f877")),
    ("Ensaladas", "Ensalada César", "Lechuga, pollo, croutons y parmesano", 7800, 12, img("1546069901-ba9599a7e63c")),
    ("Ensaladas", "Ensalada Veggie", "Mix de verdes, palta, tomate y semillas", 7200, 10, img("1512621776951-a57141f2eefd")),
    ("Postres", "Helado Artesanal", "Pote de 1/4 kg, dos gustos", 4800, 20, img("1563805042-7684c019e1cb")),
    ("Postres", "Tiramisú", "Porción de tiramisú casero", 5200, 8, img("1571877227200-a0d98ea607e9")),
    ("Bebidas", "Gaseosa Cola 500ml", "Botella de 500ml bien fría", 2200, 50, img("1554866585-cd94860890b7")),
    ("Bebidas", "Jugo de Naranja", "Jugo exprimido natural 400ml", 3000, 15, img("1600271886742-f049cd451bba")),
    ("Bebidas", "Agua Mineral 500ml", "Agua sin gas", 1500, 40, None),
]


def seed() -> None:
    create_all_tables()

    with Session(engine) as session:
        # --- admin ---
        admin = session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
        if admin is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print("Usuario admin creado")
        else:
            print("El usuario admin ya existía")

        # --- categorias ---
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                print(f"Categoría creada: {nombre}")
            categorias[nombre] = categoria

        # --- productos ---
        for cat, nombre, descripcion, precio, stock, imagen in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat].id or 0,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=imagen,
                    )
                )
                print(f"Producto creado: {nombre}")

        session.commit()

    print("Seed terminado")


if __name__ == "__main__":
    seed()
