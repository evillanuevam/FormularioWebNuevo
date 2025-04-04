document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const usuarioId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();
    
    const tabla = document.getElementById("incidencias-list");
    const formulario = document.getElementById("formulario");
    const inputIncidencia = document.getElementById("nueva-incidencia");

    const resumenSelect = document.getElementById("resumen-diario");
    
    const cargarIncidencias = async () => {
        const res = await fetch(`/api/Administrar/incidencias?aeropuerto=${aeropuerto}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const datos = await res.json();
        tabla.innerHTML = "";
        datos.forEach(d => {
            tabla.innerHTML += `
                <tr>
                    <td>${d.nombreIncidencia}</td>
                    <td>${d.usuario?.nombre ?? "—"}</td>
                    <td><button data-id="${d.id}" class="btn-eliminar">🗑️</button></td>
                </tr>
            `;
        });
    };

    formulario.addEventListener("submit", async e => {
        e.preventDefault();
        const nueva = {
            nombreIncidencia: inputIncidencia.value,
            aeropuerto,
            resumenDiario: resumenSelect.value,
            usuarioId: parseInt(usuarioId)
        };
        await fetch("/api/Administrar/incidencias", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(nueva)
        });
        inputIncidencia.value = "";
        resumenSelect.value = "";
        cargarIncidencias();
    });

    tabla.addEventListener("click", async e => {
        if (e.target.matches(".btn-eliminar")) {
            const id = e.target.dataset.id;
            await fetch(`/api/Administrar/incidencias/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarIncidencias();
        }
    });

    cargarIncidencias();
});
