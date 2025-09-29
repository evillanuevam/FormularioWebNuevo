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
    
            tablaGeneralBody.innerHTML = "";
            tablaResumenBody.innerHTML = "";
    
            if (response.status === 404) {
                mostrarMensajeTablaIncidencias("No hay registros disponibles.");
                return;
            }
    
            if (!response.ok) {
                const texto = await response.text();
                console.error("Respuesta del servidor no OK:", response.status, texto);
                mostrarMensajeTablaIncidencias("Error al cargar los datos.");
                return;
            }
    
            const datos = await response.json();
            const incidencias = datos.$values;
    
            if (!Array.isArray(incidencias) || incidencias.length === 0) {
                mostrarMensajeTablaIncidencias("No hay registros disponibles.");
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
            mostrarMensajeTablaIncidencias("Error al cargar los datos.");
        }
    }

    fechaInput.addEventListener("change", cargarIncidencias);
});

function mostrarMensajeTablaIncidencias(mensaje) {
    const tablaBody = document.getElementById("tabla-incidencias-body");
    if (tablaBody) {
        tablaBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">${mensaje}</td></tr>`;
    }
}


//FUNCIONES PARA EXPORTAR EXCEL Y PDF (probando desde el front- navegador del usuario)

function exportarExcel() {
    const fechaInput = document.getElementById("fechaSeleccionada");
    const fecha = fechaInput.value;

    if (!fecha) {
        alert("⚠️ Debes seleccionar una fecha antes de exportar.");
        fechaInput.focus();
        return;
    }

    const tabla = document.querySelector("#tabla-resumen-diario tbody");
    const filas = Array.from(tabla.querySelectorAll("tr"));

    filas.sort((a, b) => a.children[0].textContent.localeCompare(b.children[0].textContent));

    const fechaObj = new Date(fecha);
    const fechaFormateada = `${fechaObj.getDate().toString().padStart(2, "0")}-${(fechaObj.getMonth() + 1).toString().padStart(2, "0")}-${fechaObj.getFullYear()}`;
    
    const aeropuerto = document.getElementById("aeropuerto").value;

    const wb = XLSX.utils.book_new();
    const ws_data = [
        [`Aeropuerto: ${aeropuerto}`],
        [`Fecha del resumen: ${fechaFormateada}`],
        [],
        ["Hora", "Incidencia", "Nombre Vigilante", "Descripción", "Acción Tomada", "Verificación", "Observaciones", "Resumen Diario"]
    ];

    filas.forEach(tr => {
        const fila = Array.from(tr.children).map(td => td.textContent.trim());
        ws_data.push(fila);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Resumen Diario");
    XLSX.writeFile(wb, `Reporte_Incidencias_${fecha}.xlsx`);
    mostrarNotificacion("✅ Excel exportado con éxito");
}

function exportarPDF() {
    const fechaInput = document.getElementById("fechaSeleccionada");
    const fecha = fechaInput.value;

    if (!fecha) {
        alert("⚠️ Debes seleccionar una fecha antes de exportar.");
        fechaInput.focus();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const fechaObj = new Date(fecha);
    const fechaFormateada = `${fechaObj.getDate().toString().padStart(2, "0")}-${(fechaObj.getMonth() + 1).toString().padStart(2, "0")}-${fechaObj.getFullYear()}`;
    
    const aeropuerto = document.getElementById("aeropuerto").value;

    doc.setFontSize(12);
    doc.text(`Aeropuerto: ${aeropuerto}`, 14, 15);
    doc.text(`Fecha del resumen: ${fechaFormateada}`, 14, 22);

    const tabla = document.querySelector("#tabla-resumen-diario tbody");
    const filas = Array.from(tabla.querySelectorAll("tr"));

    filas.sort((a, b) => a.children[0].textContent.localeCompare(b.children[0].textContent));

    const headers = [["Hora", "Incidencia", "Nombre Vigilante", "Descripción", "Acción Tomada", "Verificación", "Observaciones", "Resumen Diario"]];
    const data = filas.map(tr => Array.from(tr.children).map(td => td.textContent.trim()));

    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 57, 107] },
        margin: { top: 10 }
    });
    
    doc.save(`Reporte_Incidencias_${fecha}.pdf`);
    mostrarNotificacion("✅ PDF exportado con éxito");
}

function mostrarNotificacion(mensaje) {
    const noti = document.getElementById("notificacion-exportacion");

    // Asegurarse de que esté al frente y visible
    noti.textContent = mensaje;
    noti.style.display = "block";
    noti.style.opacity = "1";
    noti.style.transform = "translateY(0)";
    noti.style.zIndex = "99999";
    noti.classList.add("mostrar");

    // Mostrarlo en consola por si algo lo pisa
    console.log("Mostrando notificación:", noti);

    setTimeout(() => {
        noti.classList.remove("mostrar");

        setTimeout(() => {
            noti.style.display = "none";
        }, 400); // Debe coincidir con el transition
    }, 4000); // Visible por 5 segundos
}