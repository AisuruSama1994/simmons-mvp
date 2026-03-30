#!/bin/bash

# ========================================
# SCRIPT DE INICIALIZACIÓN - SIMMONS MVP
# Crea la estructura completa del proyecto
# ========================================

set -e  # Exit on error

echo "🥐 Creando estructura de proyecto Simmons..."
echo ""

# ---- CREAR CARPETAS PRINCIPALES ----
echo "📁 Creando carpetas..."

mkdir -p simmons-mvp/{backend,frontend}

# Frontend
mkdir -p simmons-mvp/frontend/{src,src/components,src/pages,src/services,src/hooks,src/types,src/utils,src/styles,public}

# Backend
mkdir -p simmons-mvp/backend/{app,app/models,app/schemas,app/routes,app/services,app/utils,app/middlewares,database,alembic/versions}

# Raíz
mkdir -p simmons-mvp/{docs,config}

echo "✅ Carpetas creadas"
echo ""

# ---- CREAR ARCHIVOS BACKEND ----
echo "🔧 Generando archivos backend..."

# Backend - Python files
touch simmons-mvp/backend/app/__init__.py
touch simmons-mvp/backend/app/main.py
touch simmons-mvp/backend/app/database.py
touch simmons-mvp/backend/app/config.py
touch simmons-mvp/backend/app/models/__init__.py
touch simmons-mvp/backend/app/schemas/__init__.py
touch simmons-mvp/backend/app/routes/__init__.py
touch simmons-mvp/backend/app/services/__init__.py
touch simmons-mvp/backend/app/utils/__init__.py
touch simmons-mvp/backend/app/middlewares/__init__.py

# Backend - Config files
touch simmons-mvp/backend/requirements.txt
touch simmons-mvp/backend/.env.example
touch simmons-mvp/backend/Dockerfile
touch simmons-mvp/backend/.dockerignore
touch simmons-mvp/backend/.gitignore
touch simmons-mvp/backend/alembic.ini
touch simmons-mvp/backend/alembic/__init__.py

echo "✅ Archivos backend creados"
echo ""

# ---- CREAR ARCHIVOS FRONTEND ----
echo "🎨 Generando archivos frontend..."

touch simmons-mvp/frontend/public/.gitkeep
touch simmons-mvp/frontend/src/main.tsx
touch simmons-mvp/frontend/src/App.tsx
touch simmons-mvp/frontend/src/index.html
touch simmons-mvp/frontend/src/styles/globals.css
touch simmons-mvp/frontend/vite.config.ts
touch simmons-mvp/frontend/tailwind.config.ts
touch simmons-mvp/frontend/tsconfig.json
touch simmons-mvp/frontend/tsconfig.node.json
touch simmons-mvp/frontend/package.json
touch simmons-mvp/frontend/.env.example
touch simmons-mvp/frontend/.gitignore
touch simmons-mvp/frontend/postcss.config.js

echo "✅ Archivos frontend creados"
echo ""

# ---- CREAR ARCHIVOS RAÍZ ----
echo "📄 Generando archivos de configuración raíz..."

touch simmons-mvp/{docker-compose.yml,.gitignore,README.md,LICENSE}
touch simmons-mvp/docs/{ARCHITECTURE.md,API.md,DATABASE.md,DEPLOYMENT.md}

echo "✅ Archivos raíz creados"
echo ""

# ---- MOSTRAR ESTRUCTURA ----
echo "🌳 Estructura generada:"
echo ""

cat << 'EOF'
simmons-mvp/
│
├── 📁 frontend/                (Vite + React + TS)
│   ├── 📁 src/
│   │   ├── 📁 components/      (Componentes React)
│   │   ├── 📁 pages/           (Páginas principales)
│   │   ├── 📁 hooks/           (Custom hooks)
│   │   ├── 📁 services/        (API calls)
│   │   ├── 📁 types/           (TypeScript types)
│   │   ├── 📁 utils/           (Utilidades)
│   │   ├── 📁 styles/          (CSS)
│   │   ├── main.tsx            (Entry point)
│   │   ├── App.tsx             (App component)
│   │   └── index.html
│   │
│   ├── 📁 public/              (Archivos estáticos)
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   └── postcss.config.js
│
├── 📁 backend/                 (FastAPI + SQLAlchemy)
│   ├── 📁 app/
│   │   ├── 📁 models/          (SQLAlchemy models)
│   │   ├── 📁 schemas/         (Pydantic schemas)
│   │   ├── 📁 routes/          (API endpoints)
│   │   ├── 📁 services/        (Business logic)
│   │   ├── 📁 utils/           (Utilidades)
│   │   ├── 📁 middlewares/     (Custom middlewares)
│   │   ├── main.py             (FastAPI app)
│   │   ├── database.py         (BD connection)
│   │   ├── config.py           (Config)
│   │   └── __init__.py
│   │
│   ├── 📁 database/
│   │   ├── schema.sql          (DB schema)
│   │   └── seed_data.sql       (Datos ejemplo)
│   │
│   ├── 📁 alembic/             (Migraciones)
│   │   └── 📁 versions/
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── alembic.ini
│
├── 📁 docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── 📁 config/                  (Configuración compartida)
│
├── docker-compose.yml
├── README.md
├── .gitignore
└── LICENSE
