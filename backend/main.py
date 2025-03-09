from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Dict, Any
import os
from config.database import DatabaseConfig

load_dotenv()

app = FastAPI(title="API de Pollos Chanchos")

# Configuración de base de datos
db_config = DatabaseConfig("supabase")  # Aquí podemos cambiar el proveedor fácilmente

# Verificación de variables de entorno
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Las variables de entorno SUPABASE_URL y SUPABASE_KEY son requeridas")

try:
    supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Error al conectar con Supabase: {str(e)}")
    raise

@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}

@app.get("/pollos")
async def obtener_pollos():
    try:
        table_name = db_config.get_table_name()
        response = supabase.table(table_name).select("*").execute()
        return response.data
    except Exception as e:
        return {"error": str(e), "mensaje": "Error al acceder a la tabla"}

@app.post("/pollos")
async def crear_pollo(datos: Dict[str, Any]):
    try:
        table_name = db_config.get_table_name()
        response = supabase.table(table_name).insert(datos).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/datos/{tabla}")
async def obtener_datos(tabla: str):
    try:
        response = supabase.table(tabla).select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/procesar")
async def procesar_datos(datos: Dict[str, Any]):
    """
    Endpoint para procesar datos con lógica personalizada o IA
    """
    try:
        # Aquí irá tu lógica de procesamiento
        resultado = datos  # Modificar según necesidades
        
        # Ejemplo de guardado en Supabase
        tabla = datos.get("tabla", "resultados")
        response = supabase.table(tabla).insert(resultado).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
