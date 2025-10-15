import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar el archivo .env desde el directorio backend
backend_dir = Path(__file__).parent.parent.parent
load_dotenv(backend_dir / ".env")

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")

# Cliente único de Supabase para toda la app
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
