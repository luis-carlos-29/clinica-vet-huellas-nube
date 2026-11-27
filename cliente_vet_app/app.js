const API_URL = "https://clinica-vet-huellas-nube.onrender.com/pacientes";

let todosLosRegistros = [];
let filtroActual = "todos";

const seccionFormulario = document.getElementById("seccion-formulario");
const seccionCatalogo = document.getElementById("seccion-catalogo");
const formMascota = document.getElementById("form-mascota");
const gridPacientes = document.getElementById("grid-pacientes");
const tituloVista = document.getElementById("titulo-vista");
const botonesFiltro = document.querySelectorAll(".btn-filtro");

function alternarFormulario(mostrar) {
  const controles = formMascota.querySelectorAll("input, select, button");
  if (mostrar) {
    seccionFormulario.classList.remove("oculto");
    seccionCatalogo.classList.add("oculto");
    controles.forEach(el => el.disabled = false);
  } else {
    formMascota.reset();
    seccionFormulario.classList.add("oculto");
    seccionCatalogo.classList.remove("oculto");
    controles.forEach(el => el.disabled = true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  alternarFormulario(false);
  cargarPacientes();
});

document.getElementById("btn-abrir-form").addEventListener("click", () => alternarFormulario(true));
document.getElementById("btn-cancelar").addEventListener("click", () => alternarFormulario(false));

async function cargarPacientes() {
  try {
    const res = await fetch(API_URL);
    todosLosRegistros = await res.json();
    aplicarFiltroYRenderizar();
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
  }
}

botonesFiltro.forEach(boton => {
  boton.addEventListener("click", () => {
    alternarFormulario(false);
    botonesFiltro.forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    filtroActual = boton.dataset.filtro;
    aplicarFiltroYRenderizar();
  });
});

function aplicarFiltroYRenderizar() {
  let filtrados = todosLosRegistros;
  if (filtroActual === "por_atender") {
    filtrados = todosLosRegistros.filter(p => p.atendido === false);
    tituloVista.textContent = "Pacientes Por Atender";
  } else if (filtroActual === "atendidos") {
    filtrados = todosLosRegistros.filter(p => p.atendido === true);
    tituloVista.textContent = "Pacientes Atendidos";
  } else {
    tituloVista.textContent = "Sala de Espera (Todos los Pacientes)";
  }
  renderizarTarjetas(filtrados);
}

function renderizarTarjetas(lista) {
  gridPacientes.innerHTML = "";
  lista.forEach(item => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    tarjeta.innerHTML = `
      <img src="${item.imagen_url}" alt="${item.nombre_mascota}" onerror="this.src='https://via.placeholder.com/300x180?text=Sin+Imagen'">
      <div class="tarjeta-cuerpo">
        <span class="badge ${item.atendido ? 'badge-atendido' : 'badge-pendiente'}">
          ${item.atendido ? 'Atendido' : 'Por Atender'}
        </span>
        <h3>${item.nombre_mascota} (${item.especie})</h3>
        <p><strong>Motivo:</strong> ${item.motivo_consulta}</p>
        <div class="tarjeta-acciones">
          <button class="btn-estado" onclick="cambiarEstado('${item.id}', ${!item.atendido})">
            ${item.atendido ? 'Mover a Espera' : 'Marcar Atendido'}
          </button>
          <button class="btn-eliminar" onclick="eliminarPaciente('${item.id}')">Eliminar</button>
        </div>
      </div>
    `;
    gridPacientes.appendChild(tarjeta);
  });
}

formMascota.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevoPaciente = {
    nombre_mascota: document.getElementById("nombre-mascota").value.trim(),
    especie: document.getElementById("especie").value,
    motivo_consulta: document.getElementById("motivo-consulta").value.trim(),
    imagen_url: document.getElementById("imagen-url").value.trim(),
    atendido: document.getElementById("atendido").checked
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoPaciente)
    });
    if (res.ok) {
      alternarFormulario(false);
      await cargarPacientes();
    }
  } catch (error) {
    console.error("Error al guardar:", error);
  }
});

async function cambiarEstado(id, nuevoEstado) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ atendido: nuevoEstado })
  });
  await cargarPacientes();
}

async function eliminarPaciente(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  await cargarPacientes();
}