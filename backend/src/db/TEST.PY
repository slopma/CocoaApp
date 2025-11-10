from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")
sb = create_client(url, key)

res = sb.table("rol_usuario").select("*").limit(1).execute()
print(res.data)
