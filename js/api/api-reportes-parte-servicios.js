const API_URL = window.CONFIG.API_BASE_URL;

// ✅ Obtener datos del usuario desde el token
function obtenerUsuarioDatos() {
    const token = sessionStorage.getItem("token");
    if (!token) return {};
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        let aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();
        return { aeropuerto };
    } catch (error) {
        console.error("❌ Error al decodificar token:", error);
        return {};
    }
}

// ✅ Formatear fecha
function formatFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";
    const fecha = new Date(fechaISO);
    return `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;
}

// ✅ Mostrar mensaje si no hay datos
function mostrarMensajeTabla(mensaje) {
    const tablaBody = document.getElementById("tabla-descripciones-body");
    if (tablaBody) {
        tablaBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">${mensaje}</td></tr>`;
    }
}

// ✅ Actualizar la tabla
function actualizarDescripcionesEnTabla(descripciones) {
    const tablaBody = document.getElementById("tabla-descripciones-body");
    if (!tablaBody) return;

    tablaBody.innerHTML = "";

    if (descripciones.length === 0) {
        mostrarMensajeTabla("No hay registros disponibles.");
        return;
    }

    const encabezados = ["Nombre", "Fecha", "Hora", "Descripción", "Acción Tomada", "Verificación", "Es Incidencia", "Observaciones"];

    descripciones.forEach(descripcion => {
        const fila = document.createElement("tr");

        if (descripcion.esIncidencia?.trim().toLowerCase() !== "no incidencia") {
            fila.classList.add("incidencia");
        }       

        const valores = [
            descripcion.nombre || "Sin nombre",
            formatFecha(descripcion.fechaDescripcion),
            descripcion.horaDescripcion || "00:00",
            descripcion.descripcion || "Sin descripción",
            descripcion.accionTomada || "Sin acción",
            descripcion.verificacion || "No definido",
            descripcion.esIncidencia || "No incidencia",
            descripcion.observaciones || "Sin observaciones"
        ];

        fila.innerHTML = valores.map((valor, index) => `<td data-label="${encabezados[index]}">${valor}</td>`).join("");
        tablaBody.appendChild(fila);
    });
}

// ✅ Cargar descripciones al cambiar la fecha
async function cargarDescripcionesPorFecha() {
    const { aeropuerto } = obtenerUsuarioDatos();
    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;

    if (!aeropuerto) return;

    try {
        const url = `${API_URL}/api/ParteServicio/GetDescripcionesDelDia?aeropuerto=${encodeURIComponent(aeropuerto)}&fechaSeleccionada=${encodeURIComponent(fechaSeleccionada)}`;
        const response = await fetch(url);

        if (response.status === 404) {
            mostrarMensajeTabla("No hay registros disponibles.");
            return;
        }

        if (!response.ok) {
            mostrarMensajeTabla("Error al cargar los datos.");
            return;
        }

        const data = await response.json();

        if (!data || !data.$values || data.$values.length === 0) {
            mostrarMensajeTabla("No hay registros disponibles.");
            return;
        }

        actualizarDescripcionesEnTabla(data.$values);
    } catch (error) {
        console.error("❌ Error cargando descripciones:", error);
        mostrarMensajeTabla("Error al cargar los datos.");
    }
}

// ✅ Escuchar cambios de fecha
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fechaSeleccionada").addEventListener("change", cargarDescripcionesPorFecha);
    cargarDescripcionesPorFecha(); // carga inicial

    // Alternar tabla
    const tabla = document.getElementById("tabla-descripciones");
    const boton = document.getElementById("toggle-tabla");

    if (tabla && boton) {
        //tabla.style.display = "none"; // oculta por defecto, depende de los gustos
        boton.textContent = "Ocultar Tabla";
        boton.addEventListener("click", function (event) {
            event.preventDefault();
    
            if (tabla.style.display === "none") {
                tabla.style.display = "table";
                boton.textContent = "Ocultar Tabla";
            } else {
                tabla.style.display = "none";
                boton.textContent = "Mostrar Tabla";
            }
        });
    }
});