// ✅ utils/configuracion.js
const API_URL = window.CONFIG.API_BASE_URL;
const token = sessionStorage.getItem("token");
const decoded = JSON.parse(atob(token.split(".")[1]));
const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();

// ================================== INCIDENCIAS =============================================
const tabla = document.getElementById("incidencias-list");
const formularioIncidencias = document.getElementById("formulario-incidencias");
const inputIncidencia = document.getElementById("nueva-incidencia");
const resumenSelect = document.getElementById("resumen-diario");

const cargarIncidencias = async () => {
    try {
        const res = await fetch(`${API_URL}/api/Administrar/leer-incidencias?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const datos = await res.json();
        const lista = datos.$values || datos || [];

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
                    <td><button data-id="${d.id}" class="btn-eliminar"><i class="fa fa-trash"></i></button></td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("❌ Error al cargar incidencias:", err);
        tabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">Error al cargar datos.</td></tr>`;
    }
};

formularioIncidencias?.addEventListener("submit", async e => {
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

        const data = await res.json();

        if (!res.ok) {
            alert("❌ " + (data?.mensaje || "Error al guardar incidencia"));
            return;
        }

        alert("✅ Incidencia guardada correctamente.");
        inputIncidencia.value = "";
        resumenSelect.value = "";
        await cargarIncidencias();
    } catch (err) {
        console.error("❌ Error al guardar incidencia:", err);
    }
});

tabla?.addEventListener("click", async e => {
    if (e.target.closest(".btn-eliminar")) {
        const boton = e.target.closest(".btn-eliminar");
        const id = boton.dataset.id;

        const confirmar = confirm("❌¿Seguro que desea eliminar esta incidencia?");
        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/api/Administrar/eliminar-incidencia/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al eliminar incidencia");

            alert("✅ Incidencia eliminada correctamente.");
            await cargarIncidencias();
        } catch (err) {
            console.error("❌ Error al eliminar incidencia:", err);
        }
    }
});

// Ejecutar solo cuando se seleccione la pestaña de incidencias
const tabIncidencias = document.querySelector("[data-tab='incidencias']");
tabIncidencias?.addEventListener("click", cargarIncidencias);

// =============================== PUESTOS =================================================
const formularioPuestos = document.getElementById("formulario-puestos");
const puestosList = document.getElementById("puestos-list");

formularioPuestos?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const aeropuerto = document.getElementById("aeropuerto-puestos").value;
    const puesto = document.getElementById("nueva-puesto").value.trim();

    if (!puesto) return alert("⚠️ Ingrese un puesto válido");

    try {
        const response = await fetch(`${API_URL}/api/Administrar/guardar-puesto?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(puesto)
        });

        const data = await response.json();

        if (!response.ok) {
            alert("❌ " + (data?.mensaje || "Error al guardar el puesto"));
            return;
        }

        alert("✅ Puesto guardado correctamente.");
        document.getElementById("nueva-puesto").value = "";
        await leerPuestos();
    } catch (err) {
        console.error(err);
        alert("⚠️ No se pudo guardar el puesto");
    }
});

async function leerPuestos() {
    const { aeropuerto } = obtenerUsuarioDatos();
    if (!aeropuerto) return;

    try {
        const res = await fetch(`${API_URL}/api/Administrar/leer-puestos?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        const lista = data.$values || []; // 👈 Extrae el array real
        puestosList.innerHTML = "";

        if (data.length === 0) {
            puestosList.innerHTML = `<tr><td colspan="3" style="text-align:center;">No hay puestos registrados.</td></tr>`;
            return;
        }

        lista.forEach(p => {
            puestosList.innerHTML += `
                <tr>
                    <td>${p.nombrePuesto}</td>
                    <td>${p.usuario?.nombre ?? "—"}</td>
                    <td>
                        <button data-id="${p.id}" class="btn-eliminar eliminar-puesto">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("❌ Error al leer puestos:", err);
    }
}

document.addEventListener("click", async function (e) {
    if (e.target.closest(".eliminar-puesto")) {
        const id = e.target.closest("button").dataset.id;
        const confirmar = confirm("❌¿Seguro que deseas eliminar este puesto?");
        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/api/Administrar/eliminar-puesto/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("❌ Error al eliminar puesto");

            alert("✅ Puesto eliminado correctamente.");
            await leerPuestos();
        } catch (err) {
            console.error(err);
        }
    }
});

const tabPuestos = document.querySelector("[data-tab='puestos']");
tabPuestos?.addEventListener("click", leerPuestos);
