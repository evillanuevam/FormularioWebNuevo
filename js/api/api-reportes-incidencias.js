const API_URL = window.CONFIG.API_BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
    const aeropuertoSelect = document.getElementById("aeropuerto");
    const fechaInput = document.getElementById("fechaSeleccionada");
    const tablaGeneralBody = document.getElementById("tabla-incidencias-body");
    const tablaResumenBody = document.getElementById("tabla-resumen-body");

    function crearFila(incidencia, agregarBoton = true) {
        const fila = document.createElement("tr");

        const columnas = [
            incidencia.hora || "00:00",
            incidencia.tipoIncidencia || "Sin tipo",
            incidencia.vigilante || "Desconocido",
            incidencia.descripcion || "Sin descripción",
            incidencia.accionTomada || "Sin acción",
            incidencia.verificacion || "No verificado",
            incidencia.observaciones || "Sin observaciones",
            incidencia.enResumen ? "Sí" : "No"
        ];

        fila.innerHTML = columnas.map(c => `<td>${c}</td>`).join("");

        if (agregarBoton) {
            const tdBoton = document.createElement("td");
            tdBoton.classList.add("accion"); //agregando nombre al <td> para el css
            const boton = document.createElement("button");
            boton.textContent = "➕ Agregar al resumen";
            boton.className = "btn-agregar";
            boton.onclick = () => {
                const nuevaFila = crearFila(incidencia, false);
                tablaResumenBody.appendChild(nuevaFila);
                boton.disabled = true;
                boton.textContent = "Agregado";
            };
            tdBoton.appendChild(boton);
            fila.appendChild(tdBoton);
        }

        return fila;
    }

    async function cargarIncidencias() {
        const aeropuerto = aeropuertoSelect.value;
        const fecha = fechaInput.value;
        const token = sessionStorage.token;

        if (!aeropuerto || !fecha || !token) {
            console.warn("Faltan datos para la solicitud (aeropuerto, fecha o token)");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/Reportes/GetIncidenciasConResumen?aeropuerto=${encodeURIComponent(aeropuerto)}&fechaSeleccionada=${fecha}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const texto = await response.text();
                console.error("Respuesta del servidor no OK:", response.status, texto);
                throw new Error(`Error ${response.status}: ${texto}`);
            }

            const datos = await response.json();

            if (!tablaGeneralBody || !tablaResumenBody) {
                console.error("Las tablas no están definidas en el HTML.");
                return;
            }
            
            tablaGeneralBody.innerHTML = "";
            tablaResumenBody.innerHTML = "";
            

            const incidencias = datos.$values; // 👈 extraemos el array real

            if (!Array.isArray(incidencias)) {
                console.error("La respuesta del servidor no contiene un array válido:", datos);
                return;
            }
            
            incidencias.forEach(i => {
                if (i.enResumen) {
                    const filaResumen = crearFila(i, false);
                    tablaResumenBody.appendChild(filaResumen);
                } else {
                    const fila = crearFila(i, true);
                    tablaGeneralBody.appendChild(fila);
                }
            });
            
            
        } catch (error) {
            console.error("Error al cargar incidencias:", error);
        }
    }

    fechaInput.addEventListener("change", cargarIncidencias);
});
