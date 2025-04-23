// ✅ utils/configuracion.js
const API_URL = window.CONFIG.API_BASE_URL;
const token = sessionStorage.getItem("token");
const decoded = JSON.parse(atob(token.split(".")[1]));
const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();

// ===================================== INCIDENCIAS =============================================
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

//=============== CARGAR LA PRIMERA PESTAÑA INCIDENCIAS, PUESTOS, ELIMINAR O LO QUE SEA ==========================

document.addEventListener("DOMContentLoaded", function () {
    let hash = window.location.hash.substring(1); // quita el "#"

    // Obtener el primer tab-button disponible si no hay hash
    if (!hash) {
        const primerBoton = document.querySelector(".tab-button");
        if (primerBoton) {
            hash = primerBoton.getAttribute("data-tab");
            window.location.hash = `#${hash}`;
        }
    }

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Desactivar todas las pestañas
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Activar la pestaña y contenido correspondiente
    const targetButton = document.querySelector(`.tab-button[data-tab="${hash}"]`);
    const targetContent = document.getElementById(hash);

    if (targetButton && targetContent) {
        targetButton.classList.add('active');
        targetContent.classList.add('active');

        // 👇 Ejecutar carga según el hash (solo si aplica)
        if (hash === "incidencias") cargarIncidencias?.();
        if (hash === "puestos") leerPuestos?.();
        if (hash === "eliminar") cargarUsuarios?.(); // AGREGADO 
    }
});

// ======================================== ELIMINAR USUARIO (DESACTIVAR) ========================================
async function cargarUsuarios() {
    const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();

    try {
        const res = await fetch(`${API_URL}/api/auth/usuarios-activos?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        const lista = data.$values || data || [];


        const contenedor = document.getElementById("lista-usuarios");
        contenedor.innerHTML = "";

        if (lista.length === 0) {
            contenedor.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay usuarios activos.</td></tr>`;
            return;
        }

        lista.forEach(u => {
            const desactivable = u.rol !== "Administrador"; // 👈 Solo si NO es administrador
            contenedor.innerHTML += `
                <tr>
                    <td>${u.tip}</td>
                    <td>${u.nombre}</td>
                    <td>${u.apellidos}</td>
                    <td>${u.rol}</td>
                    <td>
                        <button 
                            data-tip="${u.tip}" 
                            class="btn-eliminar btn-eliminar-usuario ${!desactivable ? 'btn-administrador' : ''}" 
                            ${!desactivable ? 'title="No se puede desactivar un Administrador"' : ''}
                        >
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        

    } catch (err) {
        console.error("❌ Error al cargar usuarios:", err);
    }
}

document.addEventListener("click", async function (e) {
    const boton = e.target.closest(".btn-eliminar-usuario");
    if (!boton) return;

    const fila = boton.closest("tr");
    const tip = boton.dataset.tip;
    const nombre = fila?.children[1]?.textContent ?? "el usuario";
    const rol = fila?.children[3]?.textContent ?? "";

    if (rol === "Administrador") {
        alert("❌ No se puede desactivar un usuario Administrador.");
        return;
    }

    if (!confirm(`¿Seguro que deseas eliminar (desactivar) a ${nombre}?`)) return;

    try {
        const res = await fetch(`${API_URL}/api/auth/desactivar/${tip}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Error al desactivar usuario");

        alert("✅ Usuario desactivado correctamente.");
        await cargarUsuarios();

    } catch (err) {
        console.error("❌ Error al desactivar usuario:", err);
    }
});

const inputBuscarTIP = document.getElementById("buscar-tip");
inputBuscarTIP?.addEventListener("input", () => {
    const filtro = inputBuscarTIP.value.toLowerCase();
    const filas = document.querySelectorAll("#lista-usuarios tr");

    filas.forEach(fila => {
        const tip = fila.children[0]?.textContent.toLowerCase();
        fila.style.display = tip.includes(filtro) ? "" : "none";
    });
});

document.addEventListener("click", function (e) {
    const botonAdmin = e.target.closest(".btn-administrador");
    if (botonAdmin) {
        alert("❌ No se puede desactivar un usuario Administrador.");
    }
});



