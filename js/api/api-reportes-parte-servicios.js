const API_URL = window.CONFIG.API_BASE_URL;

function formatFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";
    const fecha = new Date(fechaISO);
    return `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;
}

function mostrarMensajeTabla(mensaje) {
    const tablaBody = document.getElementById("tabla-descripciones-body");
    if (tablaBody) {
        tablaBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">${mensaje}</td></tr>`;
    }
}

function mostrarNotificacion(mensaje) {
    const noti = document.getElementById("notificacion-exportacion");
    noti.textContent = mensaje;
    noti.style.display = "block";
    noti.style.opacity = "1";
    noti.style.transform = "translateY(0)";
    noti.style.zIndex = "99999";
    noti.classList.add("mostrar");

    setTimeout(() => {
        noti.classList.remove("mostrar");
        setTimeout(() => {
            noti.style.display = "none";
        }, 400);
    }, 4000);
}

function actualizarTablaParteCompleto(registros) {
    const tablaBody = document.getElementById("tabla-descripciones-body");
    if (!tablaBody) return;

    tablaBody.innerHTML = "";

    if (registros.length === 0) {
        mostrarMensajeTabla("No hay registros disponibles.");
        return;
    }

    registros.forEach(d => {
        const fila = document.createElement("tr");

        if (d.esIncidencia?.trim().toLowerCase() !== "no incidencia") {
            fila.classList.add("incidencia");
        }

        const valores = [
            d.nombre || "Sin nombre",
            d.hora || "--:--",
            d.puestoVigilante || "Sin puesto",
            d.descripcion || "Sin descripción",
            d.accionTomada || "Sin acción",
            d.verificacion || "No definido",
            d.esIncidencia || "No incidencia",
            d.observaciones || "Sin observaciones"
        ];

        const encabezados = [
            "Nombre", "Hora Servicio", "Puesto Vigilante",
            "Descripción", "Acción Tomada", "Verificación", "Incidencia", "Observaciones"
        ];

        fila.innerHTML = valores.map((valor, i) => `<td data-label="${encabezados[i]}">${valor}</td>`).join("");
        tablaBody.appendChild(fila);
    });
}

async function cargarParteCompleto() {
    const { aeropuerto } = obtenerUsuarioDatos();
    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;

    if (!aeropuerto || !fechaSeleccionada) return;

    try {
        const fecha = new Date(fechaSeleccionada);
        const fechaFormateada = fecha.toISOString().split("T")[0];

        const url = `${API_URL}/api/Reportes/GetParteServicioCompleto?aeropuerto=${encodeURIComponent(aeropuerto)}&fechaSeleccionada=${encodeURIComponent(fechaFormateada)}`;
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${sessionStorage.token}`
            }
        });

        if (!response.ok) {
            mostrarMensajeTabla("Error al cargar los datos.");
            console.error("❌ Error de API:", await response.text());
            return;
        }

        const data = await response.json();
        const registros = Array.isArray(data?.$values) ? data.$values : [];

        if (registros.length === 0) {
            mostrarMensajeTabla("No hay registros disponibles.");
            return;
        }

        window._parteCompleto = registros;
        actualizarTablaParteCompleto(registros);

    } catch (error) {
        console.error("❌ Error cargando parte completo:", error);
        mostrarMensajeTabla("Error al cargar los datos.");
    }
}

function exportarExcel() {
    const filas = document.querySelectorAll("#tabla-descripciones tbody tr");
    if (filas.length === 0) return alert("No hay datos para exportar.");

    const headers = ["Nombre", "Hora Servicio", "Puesto Vigilante", "Descripción", "Acción Tomada", "Verificación", "Incidencia", "Observaciones"];
    const rows = Array.from(filas).map(row => Array.from(row.cells).map(td => td.textContent));

    const fecha = document.getElementById("fechaSeleccionada").value || "sin_fecha";
    const nombreArchivo = `Reporte resumen parte de servicio (${fecha.split("-").reverse().join("-")})`;

    exportarAExcel(["Reporte Resumido"], [headers, ...rows], nombreArchivo);
    mostrarNotificacion("✅ Exportación de resumen exitosa");
}

function exportarExcelCompleto() {
    if (!window._parteCompleto) return alert("No hay datos cargados.");

    const registros = window._parteCompleto;

    const headers = [
        "Nombre", "TIP", "Fecha", "Hora Inicio", "Hora Fin", "Material Controlado",
        "Leído Normativa", "Accidente Puesto", "Hora Servicio", "Puesto Vigilante",
        "Descripción", "Acción Tomada", "Verificación", "Incidencia", "Observaciones",
        "Vehículos (Hora)", "Matrícula", "Detalles Checklist", "Estado", "Observaciones Vehículo"
    ];

    const rows = [];

    registros.forEach(r => {
        if (r.vehiculos?.$values?.length > 0) {
            r.vehiculos.$values.forEach(v => {
                rows.push([
                    r.nombre, r.tip, formatFecha(r.fecha), r.horaInicio, r.horaFin, r.materialControlado,
                    r.leidoNormativa, r.accidentesPuesto, r.hora, r.puestoVigilante,
                    r.descripcion, r.accionTomada, r.verificacion, r.esIncidencia, r.observaciones,
                    v.hora, v.matricula, v.detallesChecklist, v.estadoRevision, v.observaciones
                ]);
            });
        } else {
            rows.push([
                r.nombre, r.tip, formatFecha(r.fecha), r.horaInicio, r.horaFin, r.materialControlado,
                r.leidoNormativa, r.accidentesPuesto, r.hora, r.puestoVigilante,
                r.descripcion, r.accionTomada, r.verificacion, r.esIncidencia, r.observaciones,
                "", "", "", "", ""
            ]);
        }
    });

    const fecha = document.getElementById("fechaSeleccionada").value || "sin_fecha";
    const nombreArchivo = `Reporte completo parte de servicio (${fecha.split("-").reverse().join("-")})`;

    exportarAExcel(["Reporte Completo"], [headers, ...rows], nombreArchivo);
    mostrarNotificacion("✅ Exportación completa exitosa");
}

function exportarAExcel(sheetNames, data, fileName) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetNames[0]);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}

function exportarPDF() {
    const fechaInput = document.getElementById("fechaSeleccionada");
    const aeropuerto = document.getElementById("aeropuerto").value;
    const fecha = fechaInput.value;

    if (!fecha || !aeropuerto) {
        alert("Debes seleccionar un aeropuerto y una fecha antes de exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Formato fecha dd-MM-yyyy
    const fechaObj = new Date(fecha);
    const fechaFormateada = `${fechaObj.getDate().toString().padStart(2, "0")}-${(fechaObj.getMonth() + 1).toString().padStart(2, "0")}-${fechaObj.getFullYear()}`;

    // Título
    doc.setFontSize(12);
    doc.text(`Aeropuerto: ${aeropuerto}`, 14, 15);
    doc.text(`Fecha del reporte: ${fechaFormateada}`, 14, 22);

    // Preparar datos desde tabla actual
    const tabla = document.querySelector("#tabla-descripciones tbody");
    const filas = Array.from(tabla.querySelectorAll("tr"));

    const headers = [["Nombre", "Hora Servicio", "Puesto Vigilante", "Descripción", "Acción Tomada", "Verificación", "Incidencia", "Observaciones"]];
    const data = filas.map(tr => Array.from(tr.children).map(td => td.textContent.trim()));

    // Tabla con estilo
    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 57, 107] }, // Azul oscuro
        alternateRowStyles: { fillColor: [240, 240, 240] }, // Gris claro
        margin: { top: 10 }
    });

    doc.save(`Reporte resumen parte de servicio (${fechaFormateada}).pdf`);
    mostrarNotificacion("✅ PDF exportado con éxito");
}


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fechaSeleccionada").addEventListener("change", cargarParteCompleto);

    const tabla = document.getElementById("tabla-descripciones");
    const boton = document.getElementById("toggle-tabla");

    if (tabla && boton) {
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
