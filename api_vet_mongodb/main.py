from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from database import coleccion_pacientes
from models import Mascota, ActualizarEstadoMascota

app = FastAPI(title="API Clínica Veterinaria Huellas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def serializar_mascota(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "nombre_mascota": doc["nombre_mascota"],
        "especie": doc["especie"],
        "motivo_consulta": doc["motivo_consulta"],
        "atendido": doc["atendido"],
        "imagen_url": doc["imagen_url"],
    }

@app.get("/pacientes")
async def listar_pacientes():
    pacientes = []
    async for doc in coleccion_pacientes.find():
        pacientes.append(serializar_mascota(doc))
    return pacientes

@app.post("/pacientes", status_code=201)
async def registrar_paciente(mascota: Mascota):
    resultado = await coleccion_pacientes.insert_one(mascota.model_dump())
    creado = await coleccion_pacientes.find_one({"_id": resultado.inserted_id})
    return serializar_mascota(creado)

@app.put("/pacientes/{id}")
async def actualizar_estado(id: str, datos: ActualizarEstadoMascota):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")
    resultado = await coleccion_pacientes.update_one(
        {"_id": ObjectId(id)}, {"$set": {"atendido": datos.atendido}}
    )
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    actualizado = await coleccion_pacientes.find_one({"_id": ObjectId(id)})
    return serializar_mascota(actualizado)

@app.delete("/pacientes/{id}")
async def eliminar_paciente(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")
    resultado = await coleccion_pacientes.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return {"mensaje": "Paciente eliminado"}