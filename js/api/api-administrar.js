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
    const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();
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

//========================================== Proveedores ===================================================
const formularioProveedores = document.getElementById("formulario-proveedores");
const proveedoresList = document.getElementById("proveedores-list");

formularioProveedores?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const aeropuerto = document.getElementById("aeropuerto-proveedores").value;
    const proveedor = document.getElementById("nueva-proveedor").value.trim();

    if (!proveedor) return alert("⚠️ Ingrese un proveedor válido");

    try {
        const response = await fetch(`${API_URL}/api/Administrar/guardar-proveedor?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(proveedor)
        });

        const data = await response.json();

        if (!response.ok) {
            alert("❌ " + (data?.mensaje || "Error al guardar el proveedor"));
            return;
        }

        alert("✅ Proveedor guardado correctamente.");
        document.getElementById("nueva-proveedor").value = "";
        await leerProveedores();
    } catch (err) {
        console.error("❌ No se pudo guardar el proveedor:", err);
    }
});

async function leerProveedores() {
    const { aeropuerto } = obtenerUsuarioDatos();
    if (!aeropuerto) return;

    try {
        const res = await fetch(`${API_URL}/api/Administrar/leer-proveedores?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const lista = data.$values || [];
        proveedoresList.innerHTML = "";

        if (lista.length === 0) {
            proveedoresList.innerHTML = `<tr><td colspan="3" style="text-align:center;">No hay proveedores registrados.</td></tr>`;
            return;
        }

        lista.forEach(p => {
            proveedoresList.innerHTML += `
                <tr>
                    <td>${p.nombreProveedor}</td>
                    <td>${p.usuario?.nombre ?? "—"}</td>
                    <td>
                        <button data-id="${p.id}" class="btn-eliminar eliminar-proveedor">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("❌ Error al leer proveedores:", err);
    }
}

document.addEventListener("click", async function (e) {
    if (e.target.closest(".eliminar-proveedor")) {
        const id = e.target.closest("button").dataset.id;
        const confirmar = confirm("❌¿Seguro que deseas eliminar este proveedor?");
        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/api/Administrar/eliminar-proveedor/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("❌ Error al eliminar proveedor");

            alert("✅ Proveedor eliminado correctamente.");
            await leerProveedores();
        } catch (err) {
            console.error(err);
        }
    }
});

document.querySelector("[data-tab='proveedores']")?.addEventListener("click", leerProveedores);


//=============== CARGAR LA PRIMERA PESTAÑA INCIDENCIAS, PUESTOS, ELIMINAR O LO QUE SEA ==========================

document.addEventListener("DOMContentLoaded", function () {
    let hash = window.location.hash.substring(1); // 

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

        // Ejecutar carga según el hash (solo si aplica)
        if (hash === "incidencias") cargarIncidencias?.();
        if (hash === "puestos") leerPuestos?.();
        if (hash === "eliminar") cargarUsuarios?.(); 
        if (hash === "rondas") leerRondas?.();
        if (hash === "fichajes") leerFichajes?.();
        if (hash === "puertas") leerPuertas?.();
        if (hash === "proveedores") leerProveedores?.();
    }

    // ✅ Llenar automáticamente los <select> de aeropuerto si existen
    const aeropuertoTexto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();
    const selectsAero = [
        "aeropuerto-puestos",
        "aeropuerto-proveedores",
        "aeropuerto-rondas",
        "aeropuerto-fichajes",
        "aeropuerto-puertas"
    ];

    selectsAero.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = `<option value="${aeropuertoTexto}" selected>${aeropuertoTexto}</option>`;
        }
    });
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


/** ========================== ADMINISTAR PARTE DE PATRULLAS =========================== */

// =============================== RONDAS =====================================
const formRondas = document.getElementById("formulario-rondas");
const inputRonda = document.getElementById("nueva-ronda");
const listaRondas = document.getElementById("rondas-list");

formRondas?.addEventListener("submit", async e => {
    e.preventDefault();
    const nueva = {
        descripcion: inputRonda.value.trim(),
        aeropuerto
    };
    try {
        const res = await fetch(`${API_URL}/api/Administrar/guardar-ronda`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(nueva)
        });
        if (!res.ok) throw new Error("Error al guardar ronda");

        // Mostrar alerta de éxito
        alert("✅ Ronda guardada correctamente.");

        inputRonda.value = "";
        await leerRondas();

    } catch (err) {
        console.error("❌ Error al guardar ronda:", err);
        alert("❌ No se pudo guardar la ronda.");
    }
});

async function leerRondas() {
    try {
        const res = await fetch(`${API_URL}/api/Administrar/leer-rondas?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const lista = data.$values || data || [];
        listaRondas.innerHTML = "";

        if (lista.length === 0) {
            listaRondas.innerHTML = `<tr><td colspan="3">No hay registros.</td></tr>`;
            return;
        }

        lista.forEach(r => {
            listaRondas.innerHTML += `
                <tr>
                    <td>${r.descripcion}</td>
                    <td>${r.usuario?.nombre ?? "—"}</td>
                    <td><button data-id="${r.id}" class="btn-eliminar eliminar-ronda"><i class="fa fa-trash"></i></button></td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("❌ Error al leer rondas:", err);
    }
}

document.addEventListener("click", async e => {
    if (e.target.closest(".eliminar-ronda")) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("❌ ¿Eliminar esta ronda?")) return;
        try {
            const res = await fetch(`${API_URL}/api/Administrar/eliminar-ronda/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            await leerRondas();
        } catch (err) {
            console.error("❌ Error al eliminar ronda:", err);
        }
    }
});

document.querySelector("[data-tab='rondas']")?.addEventListener("click", leerRondas);

// ============================ FICHAJES ====================================
const formFichajes = document.getElementById("formulario-fichajes");
const inputFichaje = document.getElementById("nueva-fichaje");
const listaFichajes = document.getElementById("fichajes-list");

formFichajes?.addEventListener("submit", async e => {
    e.preventDefault();
    const nueva = {
        descripcion: inputFichaje.value.trim(),
        aeropuerto
    };
    try {
        const res = await fetch(`${API_URL}/api/Administrar/guardar-fichaje`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(nueva)
        });
        if (!res.ok) throw new Error("Error al guardar fichaje");

        // ✅ Mostrar alerta de éxito
        alert("✅ Punto de fichaje guardada correctamente.");

        inputFichaje.value = "";
        await leerFichajes();
    } catch (err) {
        console.error("❌ Error al guardar fichaje:", err);
    }
});

async function leerFichajes() {
    try {
        const res = await fetch(`${API_URL}/api/Administrar/leer-fichajes?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const lista = data.$values || data || [];
        listaFichajes.innerHTML = "";

        if (lista.length === 0) {
            listaFichajes.innerHTML = `<tr><td colspan="3">No hay registros.</td></tr>`;
            return;
        }

        lista.forEach(f => {
            listaFichajes.innerHTML += `
                <tr>
                    <td>${f.descripcion}</td>
                    <td>${f.usuario?.nombre ?? "—"}</td>
                    <td><button data-id="${f.id}" class="btn-eliminar eliminar-fichaje"><i class="fa fa-trash"></i></button></td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("❌ Error al leer fichajes:", err);
    }
}

document.addEventListener("click", async e => {
    if (e.target.closest(".eliminar-fichaje")) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("❌ ¿Eliminar este punto de fichaje?")) return;
        try {
            const res = await fetch(`${API_URL}/api/Administrar/eliminar-fichaje/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            await leerFichajes();
        } catch (err) {
            console.error("❌ Error al eliminar fichaje:", err);
        }
    }
});

document.querySelector("[data-tab='fichajes']")?.addEventListener("click", leerFichajes);

// ============================ PUERTAS ====================================
const formPuertas = document.getElementById("formulario-puertas");
const inputPuerta = document.getElementById("nueva-puerta");
const listaPuertas = document.getElementById("puertas-list");

formPuertas?.addEventListener("submit", async e => {
    e.preventDefault();
    const nueva = {
        identificador: inputPuerta.value.trim(),
        aeropuerto
    };
    try {
        const res = await fetch(`${API_URL}/api/Administrar/guardar-puerta`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(nueva)
        });
        if (!res.ok) throw new Error("Error al guardar puerta");

        // ✅ Mostrar alerta de éxito
        alert("✅ Puerta de perimetro guardada correctamente.");
        inputPuerta.value = "";

        await leerPuertas();
    } catch (err) {
        console.error("❌ Error al guardar puerta:", err);
    }
});

async function leerPuertas() {
    try {
        const res = await fetch(`${API_URL}/api/Administrar/leer-puertas?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const lista = data.$values || data || [];
        listaPuertas.innerHTML = "";

        if (lista.length === 0) {
            listaPuertas.innerHTML = `<tr><td colspan="3">No hay registros.</td></tr>`;
            return;
        }

        lista.forEach(p => {
            listaPuertas.innerHTML += `
                <tr>
                    <td>${p.identificador}</td>
                    <td>${p.usuario?.nombre ?? "—"}</td>
                    <td><button data-id="${p.id}" class="btn-eliminar eliminar-puerta"><i class="fa fa-trash"></i></button></td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("❌ Error al leer puertas:", err);
    }
}

document.addEventListener("click", async e => {
    if (e.target.closest(".eliminar-puerta")) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("❌ ¿Eliminar esta puerta de perímetro?")) return;
        try {
            const res = await fetch(`${API_URL}/api/Administrar/eliminar-puerta/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            await leerPuertas();
        } catch (err) {
            console.error("❌ Error al eliminar puerta:", err);
        }
    }
});

document.querySelector("[data-tab='puertas']")?.addEventListener("click", leerPuertas);

