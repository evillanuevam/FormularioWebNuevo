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

    //BOTON PARA GUARDAR PUERTAS DE PERIMETRO
    document.getElementById("btn-guardar-puertas")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await guardarPuertasPerimetro(); // ✅ funcion para el boton de guardar puertas
});

});

async function guardarFichajes() {
    const filas = document.querySelectorAll("#tabla-inspeccion tbody tr");
    const data = [];

    const rondaSeleccionada = document.getElementById("rondas").value.trim();
    if (!rondaSeleccionada) {
        alert("⚠️ Debes seleccionar una ronda antes de guardar.");
        return;
    }

    filas.forEach(fila => {
        const descripcion = fila.children[0].textContent;
        const hora = fila.children[1].querySelector("input").value;
        const estado = fila.children[2].querySelector("select").value;
        const observaciones = fila.children[3].querySelector("textarea").value;

        if (descripcion && hora && estado !== "Seleccione...") {
            data.push({ puntoFichaje: descripcion, hora, estado, observaciones });
        }
    });

    if (data.length === 0) return alert("⚠️ No hay filas válidas para guardar.");

    const coordenadas = obtenerCoordenadasSeleccionadas();

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

//Funcion para leer los datos y enviarlos a Backend
async function guardarPuertasPerimetro() {
    const filas = document.querySelectorAll("#tabla-puertas tbody tr");
    const puertas = [];

    // Validar que se haya seleccionado una ronda
    const rondaSeleccionada = document.getElementById("rondas").value.trim();
    if (!rondaSeleccionada) {
        alert("⚠️ Debes seleccionar una ronda antes de guardar.");
        return;
    }

    filas.forEach((fila, i) => {
        const identificador = fila.children[0].textContent.trim();

        const estadoPuerta = fila.querySelector(`input[name="estado-${i}"]:checked`)?.value || "";
        const aperturaPuerta = fila.querySelector(`input[name="apertura-${i}"]:checked`)?.value || "";
        const tipoCerradura = fila.querySelector("select")?.value || "";
        const aperturaCerradura = fila.querySelector(`input[name="apertura-c-${i}"]:checked`)?.value || "";
        const estadoCerradura = fila.querySelector(`input[name="estado-c-${i}"]:checked`)?.value || "";
        const observaciones = fila.querySelector("textarea")?.value || "";

        // Validar que TODOS los campos obligatorios estén llenos
        const filaValida = (
            estadoPuerta &&
            aperturaPuerta &&
            tipoCerradura &&
            aperturaCerradura &&
            estadoCerradura
        );

        if (identificador && filaValida) {
            puertas.push({
                identificadorPuerta: identificador,
                estadoGeneralPuerta: estadoPuerta,
                aperturaCierrePuerta: aperturaPuerta,
                tipoCerradura: tipoCerradura,
                aperturaCierreCerradura: aperturaCerradura,
                estadoGeneralCerradura: estadoCerradura,
                observaciones: observaciones.trim()
            });
        }
    });

    if (puertas.length === 0) {
        alert("⚠️ No hay inspecciones completas para guardar.");
        return;
    }

    const coordenadas = obtenerCoordenadasSeleccionadas();

    const payload = {
        coordenadasPlano: coordenadas,
        rondaSeleccionada: rondaSeleccionada,
        puertas: puertas
    };

    try {
        const res = await fetch(`${API_URL}/api/PartePatrullas/guardar-puertas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("✅ Puertas guardadas correctamente");
            limpiarFormularioPuertas();
        } else {
            const err = await res.json();
            alert("❌ Error al guardar puertas:\n" + err.detalle);
        }
    } catch (error) {
        console.error("❌ Error en guardarPuertasPerimetro:", error);
        alert("❌ Error de red");
    }
}


//Limpiar tambien  puertas de perimetro
function limpiarFormularioPuertas() {
    const filas = document.querySelectorAll("#tabla-puertas tbody tr");
    filas.forEach((fila, i) => {
        // Limpiar radios
        fila.querySelectorAll(`input[name="estado-${i}"]`).forEach(r => r.checked = false);
        fila.querySelectorAll(`input[name="apertura-${i}"]`).forEach(r => r.checked = false);
        fila.querySelectorAll(`input[name="estado-c-${i}"]`).forEach(r => r.checked = false);
        fila.querySelectorAll(`input[name="apertura-c-${i}"]`).forEach(r => r.checked = false);

        // Limpiar select
        const select = fila.querySelector("select");
        if (select) select.selectedIndex = 0;

        // Limpiar textarea
        const textarea = fila.querySelector("textarea");
        if (textarea) textarea.value = "";
    });

    // ✅ Limpiar coordenadas seleccionadas
    document.querySelectorAll(".grid-cell.selected").forEach(cell => {
        cell.classList.remove("selected");
        cell.textContent = "";
    });

    // ✅ Limpiar texto de coordenadas en las filas
    document.querySelectorAll(".celda-coordenadas").forEach(celda => {
        celda.textContent = "";
    });

    // ✅ Opcional: resetear el select de rondas también aquí
    const selectRonda = document.getElementById("rondas");
    if (selectRonda) selectRonda.selectedIndex = 0;
}

document.addEventListener("DOMContentLoaded", () => {
    const imgPlano = document.getElementById("imagen-plano-perimetro");
    const { aeropuerto } = obtenerUsuarioDatos();

    if (!imgPlano || !aeropuerto) return;

    // Obtener la imagen más reciente del tipo "perimetro" para el aeropuerto
    fetch(`${API_URL}/api/Plano/obtener-nombre/${encodeURIComponent(aeropuerto)}`)
        .then(res => {
            if (!res.ok) throw new Error("No se encontró imagen");
            return res.json();
        })
        .then(data => {
            const urlImagen = `${API_URL}/planos/${data.nombre}?v=${new Date().getTime()}`;
            imgPlano.src = urlImagen;
            console.log("✅ Imagen de plano cargada:", data.nombre);
        })
        .catch(err => {
            console.warn("⚠️ No se pudo cargar el plano:", err.message);
        });
});


