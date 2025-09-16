document.addEventListener("DOMContentLoaded", async function () {
    // Pintar cuadrícula
    const gridOverlay = document.querySelector(".grid-overlay");
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
                // Actualizar coordenadas en cada fila
                actualizarCoordenadasEnTabla();
            });
            gridOverlay.appendChild(cell);
        }
    }

    // Llamar funciones del archivo API sin importar nada
    await window.apiPatrullas.cargarRondas();
    await window.apiPatrullas.cargarPuntosFichaje();
    await window.apiPatrullas.cargarPuertasPerimetro();
    
    // BOTON PARA GUARDAR LOS FICHAJES
    document.getElementById("btn-guardar-fichajes")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await guardarFichajes(); // ✅ funcion para el boton de guardar fichajes
    });
});

async function guardarFichajes() {
    const filas = document.querySelectorAll("#tabla-inspeccion tbody tr");
    const data = [];

    filas.forEach(fila => {
        const descripcion = fila.children[0].textContent;
        const hora = fila.children[1].querySelector("input").value;
        const estado = fila.children[2].querySelector("select").value;
        const observaciones = fila.children[3].querySelector("textarea").value;

        // Solo guardar si la fila está completamente llena (excepto observaciones)
        if (descripcion && hora && estado !== "Seleccione...") {
            data.push({ puntoFichaje: descripcion, hora, estado, observaciones });

        }
    });

    if (data.length === 0) return alert("⚠️ No hay filas válidas para guardar.");
    
    const coordenadas = obtenerCoordenadasSeleccionadas();
    const rondaSeleccionada = document.getElementById("rondas").value;

    const payload = {
        coordenadasPlano: coordenadas,
        rondaSeleccionada: rondaSeleccionada,
        fichajes: data
    };

    try {
        const res = await fetch(`${API_URL}/api/PartePatrullas/guardar-fichajes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("✅ Fichajes guardados correctamente");
            limpiarFormularioFichaje(); // ✅ LIMPIA TODO
        } else {
            alert("❌ Error al guardar fichajes");
        }
    } catch (err) {
        console.error("❌ Error en guardarFichajes:", err);
        alert("❌ Error de red");
    }
}


//FUNCION PARA EXTRAER LA COORDENADAS DEL PLANO
function obtenerCoordenadasSeleccionadas() {
    const seleccionadas = document.querySelectorAll(".grid-cell.selected");
    return Array.from(seleccionadas)
        .map(cell => cell.dataset.id)
        .join(",");
}

//***************************************** FUNCION DE LIMPIEZA DE LA PAGINA ********************************************/

function limpiarFormularioFichaje() {
    // Limpiar inputs de hora, selects y textareas
    document.querySelectorAll("#tabla-inspeccion tbody tr").forEach(fila => {
        const inputHora = fila.children[1].querySelector("input");
        const selectEstado = fila.children[2].querySelector("select");
        const textarea = fila.children[3].querySelector("textarea");

        if (inputHora) inputHora.value = "";
        if (selectEstado) selectEstado.selectedIndex = 0; // primera opción
        if (textarea) textarea.value = "";
    });

    // Limpiar coordenadas seleccionadas en el plano
    document.querySelectorAll(".grid-cell.selected").forEach(cell => {
        cell.classList.remove("selected");
        cell.textContent = "";
    });

    // Opcional: resetear select de rondas
    const selectRonda = document.getElementById("rondas");
    if (selectRonda) selectRonda.selectedIndex = 0;

    document.querySelectorAll(".celda-coordenadas").forEach(celda => {
    celda.textContent = "";
});


}

// AGREGAR CORDENADAS EN MI TABLA DE PUNTOS DE FICHAJE
function actualizarCoordenadasEnTabla() {
    const coordenadas = obtenerCoordenadasSeleccionadas();
    const celdas = document.querySelectorAll(".celda-coordenadas");

    celdas.forEach(celda => {
        celda.textContent = coordenadas; // Esto sí lo actualiza
    });

}

