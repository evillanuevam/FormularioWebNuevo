// ✅ Cargar la URL desde config-api-url.js
const API_URL = window.CONFIG.API_BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();

    const tabla = document.getElementById("incidencias-list");
    const formularioIncidencias = document.getElementById("formulario-incidencias");
    const inputIncidencia = document.getElementById("nueva-incidencia");
    const resumenSelect = document.getElementById("resumen-diario");

    // ✅ Cargar incidencias
    const cargarIncidencias = async () => {
        try {
            const res = await fetch(`${API_URL}/api/Administrar/leer-incidencias?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const datos = await res.json();
            console.log("👀 Respuesta recibida desde backend:", datos);
    
            const lista = datos.$values || []; // Aquí es lo correcto
    
            tabla.innerHTML = "";
    
            if (lista.length === 0) {
                tabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay registros disponibles.</td></tr>`;
                return;
            }
    
            lista.forEach(d => {
                tabla.innerHTML += `
                    <tr>
                        <td>${d.nombreIncidencia}</td>
                        <td>${d.resumenDiario}</td>
                        <td>${d.usuario?.nombre ?? "—"}</td>
                        <td><button data-id="${d.id}" class="btn-eliminar"><i class="fa fa-trash"></button></td>
                    </tr>
                `;
            });
    
        } catch (err) {
            console.error("❌ Error al cargar incidencias:", err);
            tabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">Error al cargar datos.</td></tr>`;
        }
    };
    

    // ✅ Guardar incidencia
    formularioIncidencias.addEventListener("submit", async e => {
        e.preventDefault();
    
        const nueva = {
            nombreIncidencia: inputIncidencia.value.trim(),
            aeropuerto,
            resumenDiario: resumenSelect.value
        };
    
        try {
            const res = await fetch(`${API_URL}/api/Administrar/guardar-incidencia`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(nueva)
            });
    
            const data = await res.json(); // ✅ Intenta siempre leer JSON
    
            if (!res.ok) {
                // ❌ Si hay error, mostrar mensaje del backend si existe
                const mensaje = data?.mensaje || "Error al guardar incidencia";
                alert("❌ " + mensaje);
                throw new Error(mensaje);
            }
    
            alert("✅ Incidencia guardada correctamente.");
            inputIncidencia.value = "";
            resumenSelect.value = "";
            await cargarIncidencias();
        } catch (err) {
            console.error("❌ Error al guardar incidencia:", err);
        }
    });

    // ✅ Eliminar incidencia con confirmación
    tabla.addEventListener("click", async e => {
        if (e.target.closest(".btn-eliminar")) {
            const boton = e.target.closest(".btn-eliminar");
            const id = boton.dataset.id;

            // Mostrar mensaje de confirmación
            const confirmar = confirm("¿Seguro que desea eliminar esta incidencia?");
            if (!confirmar) return;

            try {
                const res = await fetch(`${API_URL}/api/Administrar/eliminar-incidencia/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Error al eliminar incidencia");

                await cargarIncidencias(); // Recargar tabla
            } catch (err) {
                console.error("❌ Error al eliminar incidencia:", err);
            }
        }
    });

    cargarIncidencias();
});
