// ✅ Variable global correcta desde tu config-api-url.js
const API_URL = window.CONFIG.API_BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const usuarioId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();

    const tabla = document.getElementById("incidencias-list");
    const formulario = document.getElementById("formulario");
    const inputIncidencia = document.getElementById("nueva-incidencia");
    const resumenSelect = document.getElementById("resumen-diario");

    // ✅ Cargar incidencias desde backend
    const cargarIncidencias = async () => {
        try {
            const res = await fetch(`${API_URL}/api/Administrar/incidencias?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Error al obtener incidencias");

            const datos = await res.json();
            tabla.innerHTML = "";

            datos.forEach(d => {
                tabla.innerHTML += `
                    <tr>
                        <td>${d.nombreIncidencia}</td>
                        <td>${d.resumenDiario}</td>
                        <td>${d.usuario?.nombre ?? "—"}</td>
                        <td><button data-id="${d.id}" class="btn-eliminar">🗑️</button></td>
                    </tr>
                `;
            });
        } catch (err) {
            console.error("❌ Error al cargar incidencias:", err);
        }
    };

    // ✅ Guardar nueva incidencia
    formulario.addEventListener("submit", async e => {
        e.preventDefault();

        const nueva = {
            nombreIncidencia: inputIncidencia.value,
            aeropuerto,
            resumenDiario: resumenSelect.value,
            usuarioId: parseInt(usuarioId)
        };

        try {
            const res = await fetch(`${API_URL}/api/Administrar/incidencias`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(nueva)
            });

            if (!res.ok) throw new Error("Error al guardar incidencia");

            inputIncidencia.value = "";
            resumenSelect.value = "";
            cargarIncidencias();
        } catch (err) {
            console.error("❌ Error al guardar incidencia:", err);
        }
    });

    // ✅ Eliminar incidencia
    tabla.addEventListener("click", async e => {
        if (e.target.matches(".btn-eliminar")) {
            const id = e.target.dataset.id;

            try {
                const res = await fetch(`${API_URL}/api/Administrar/incidencias/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Error al eliminar incidencia");

                cargarIncidencias();
            } catch (err) {
                console.error("❌ Error al eliminar:", err);
            }
        }
    });

    cargarIncidencias();
});
