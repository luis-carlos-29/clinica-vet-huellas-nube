from pydantic import BaseModel, Field

class Mascota(BaseModel):
    nombre_mascota: str = Field(..., min_length=2)
    especie: str = Field(..., min_length=2)
    motivo_consulta: str = Field(..., min_length=4)
    atendido: bool = False
    imagen_url: str = Field(..., description="URL pública de la imagen")

class ActualizarEstadoMascota(BaseModel):
    atendido: bool