# Don't run script again if users already exist
import os
import psycopg2
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

# Establish connection to Azure PostgreSQL
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    sslmode="require"
)
cursor = conn.cursor()

# List of users to create with maximum privileges
users = [
    ("sara", "Sara1234"),
    ("samuel", "Samuel1234"),
    ("david", "David1234"),
    ("nicolas", "Nicolas1234"),
]

for username, password in users:
    print(f"Creando usuario: {username}...")
    
    # Create user with CREATEDB y CREATEROLE
    cursor.execute(f"CREATE USER {username} WITH PASSWORD %s CREATEDB CREATEROLE;", (password,))
    
    # Allow user to connect to the database
    cursor.execute(f"GRANT CONNECT ON DATABASE {os.getenv('DB_NAME')} TO {username};")
    cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {os.getenv('DB_NAME')} TO {username};")
    
    # Grant usage and privileges on the public schema
    cursor.execute(f"GRANT USAGE ON SCHEMA public TO {username};")
    cursor.execute(f"GRANT ALL PRIVILEGES ON SCHEMA public TO {username};")
    
    # Allow user to create tables in the public schema
    cursor.execute(f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {username};")
    
    # Allow user to create sequences in the public schema
    cursor.execute(f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {username};")
    
    # Allow user to create functions in the public schema
    cursor.execute(f"GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO {username};")
    
    # Grant default privileges for future objects in the public schema
    cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO {username};")
    cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO {username};")
    cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO {username};")

conn.commit()
print("Users created successfully in the database.")
cursor.close()
conn.close()

