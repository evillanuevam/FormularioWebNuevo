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
            const boton = document.createElement("button");
            boton.textContent = "➕ Agregar al resumen";
            boton.className = "btn-eliminar";
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

        if (!aeropuerto || !fecha) return;

        try {
            const response = await fetch(`${API_URL}/api/Reportes/GetIncidenciasConResumen?aeropuerto=${encodeURIComponent(aeropuerto)}&fechaSeleccionada=${fecha}`);
            const datos = await response.json();

            tablaGeneralBody.innerHTML = "";
            tablaResumenBody.innerHTML = "";

            datos.forEach(i => {
                const fila = crearFila(i, true);
                tablaGeneralBody.appendChild(fila);

                if (i.enResumen) {
                    const filaResumen = crearFila(i, false);
                    tablaResumenBody.appendChild(filaResumen);
                }
            });
        } catch (error) {
            console.error("Error al cargar incidencias:", error);
        }
    }

    fechaInput.addEventListener("change", cargarIncidencias);
});

