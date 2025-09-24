// js/patrullas-otras-zonas.js
// sin tildes

document.addEventListener("DOMContentLoaded", async function () {
    // build grid
    const gridOverlay = document.querySelector(".grid-overlay");
    if (gridOverlay) {
        const filas = 7;
        const columnas = 15;
        const letras = "ABCDEFGHIJKLMNO".split("");
        for (let f = 1; f <= filas; f++) {
            for (let c = 0; c < columnas; c++) {
                const cell = document.createElement("div");
                const id = `${f}${letras[c]}`;
                cell.classList.add("grid-cell");
                cell.dataset.id = id;
                cell.addEventListener("click", function () {
                    this.classList.toggle("selected");
                    this.textContent = this.classList.contains("selected") ? id : "";
                    actualizarCoordenadasEnTabla();
                });
                gridOverlay.appendChild(cell);
            }
        }
    }

    // load otras zonas image
    await cargarPlanoOtrasZonas();
});

// --- coordenadas helpers (mismos nombres que en perimetro) ---

function obtenerCoordenadasSeleccionadas() {
    const seleccionadas = document.querySelectorAll(".grid-cell.selected");
    return Array.from(seleccionadas).map(x => x.dataset.id).join(",");
}

function actualizarCoordenadasEnTabla() {
    const coords = obtenerCoordenadasSeleccionadas();
    document.querySelectorAll(".celda-coordenadas").forEach(td => {
        td.textContent = coords;
    });
}

// --- carga de imagen para tipo otrasZonas ---

async function cargarPlanoOtrasZonas() {
    const img = document.getElementById("imagen-plano-otras-zonas") || document.querySelector(".plano img");
    if (!img) return;

    if (typeof obtenerUsuarioDatos !== "function") return;
    const { aeropuerto } = obtenerUsuarioDatos() || {};
    if (!aeropuerto) return;

    // endpoint que ya tienes en tu backend
    try {
        const res = await fetch(`${API_URL}/api/Plano/obtener-nombre-otras-zonas/${encodeURIComponent(aeropuerto)}`);
        if (res.ok) {
            const data = await res.json(); // { nombre }
            if (data && data.nombre) {
                img.src = `${API_URL}/planos/${data.nombre}?v=${Date.now()}`;
                console.log("Imagen otras zonas cargada:", data.nombre);
                return;
            }
        }
    } catch (err) {
        console.warn("No se pudo cargar plano otras zonas:", err.message);
    }

    // opcional: si mas adelante usas /api/Planos/actual con tipoPlano
    // lo puedes dejar como plan B
}


// opcional: exponer helpers para reuso
window.otrasZonas = {
    obtenerCoordenadasSeleccionadas,
    actualizarCoordenadasEnTabla
};
