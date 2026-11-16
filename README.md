# 🍔 Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador de **Programación IV** — UTN.

**Alumno:** Ariel Grela

> 🚧 En desarrollo. Por ahora está el backend; el frontend viene en los próximos commits.

## Backend

Requisitos: Python 3.11 a 3.13.

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate   |   Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env      # en Linux/macOS: cp .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

Documentación de la API: http://localhost:8000/docs

Usuario admin del seed: `admin` / `Admin1234!`
