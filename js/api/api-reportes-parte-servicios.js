const API_URL = window.CONFIG.API_BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fechaSeleccionada").addEventListener("change", cargarParteCompleto);
});

async function cargarParteCompleto() {
    const { aeropuerto } = obtenerUsuarioDatos();
    const fecha = document.getElementById("fechaSeleccionada").value;

    if (!fecha || !aeropuerto) return;

    try {
        const url = `${API_URL}/api/Reportes/GetParteServicioCompleto?aeropuerto=${encodeURIComponent(aeropuerto)}&fechaSeleccionada=${encodeURIComponent(fecha)}`;
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${sessionStorage.token}`
            }
        });

        if (!response.ok) {
            console.error("Error al obtener el parte:", await response.text());
            return;
        }

        const parte = await response.json();

        // Mostrar datos del encabezado
        document.getElementById("nombre-vigilante").value = parte.Nombre;
        // Puedes crear otros campos ocultos o visibles si lo necesitas

        // Renderizar tabla de descripciones
        const body = document.getElementById("tabla-descripciones-body");
        body.innerHTML = "";

        parte.Descripciones.forEach(d => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${parte.Nombre}</td>
                <td>${parte.Fecha}</td>
                <td>${d.Hora}</td>
                <td>${d.PuestoVigilante || 'Sin puesto'}</td>
                <td>${d.Descripcion}</td>
                <td>${d.AccionTomada}</td>
                <td>${d.Verificacion}</td>
                <td>${d.EsIncidencia}</td>
                <td>${d.Observaciones}</td>
            `;
            body.appendChild(fila);
        });
    } catch (error) {
        console.error("❌ Error al cargar parte:", error);
    }
}
