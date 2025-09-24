document.addEventListener("DOMContentLoaded", () => {
    console.log("JS otras zonas cargado");

    const form = document.getElementById("formulario-otras-zonas");
    const inputArchivo = document.getElementById("file-otras-zonas");
    const selectAeropuerto = document.getElementById("aeropuerto-otras-zonas");
    const vistaPrevia = document.getElementById("vista-previa-otras-zonas");

    if (!form || !inputArchivo || !selectAeropuerto || !vistaPrevia) {
        console.warn("Elementos de Otras Zonas no encontrados");
        return;
    }

    // si ya hay aeropuerto seleccionado (auth.js lo puso), intenta cargar la imagen
    if (selectAeropuerto.value) {
        cargarImagenSiExisteOZ(selectAeropuerto.value);
    }

    // vista previa local
    inputArchivo.addEventListener("change", () => {
        const archivo = inputArchivo.files?.[0];
        if (!archivo) { vistaPrevia.src = ""; return; }
        const lector = new FileReader();
        lector.onload = e => { vistaPrevia.src = e.target.result; };
        lector.readAsDataURL(archivo);
    });

    // cargar imagen al cambiar aeropuerto
    selectAeropuerto.addEventListener("change", () => {
        const codigo = selectAeropuerto.value;
        if (!codigo) { vistaPrevia.src = ""; return; }
        cargarImagenSiExisteOZ(codigo);
    });

    // submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const archivo = inputArchivo.files?.[0];
        const aeropuertoCodigo = selectAeropuerto.value;
        if (!archivo || !aeropuertoCodigo) {
            alert("Seleccione archivo y aeropuerto.");
            return;
        }

        const { tip } = obtenerUsuarioDatos();
        const formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("aeropuertoCodigo", aeropuertoCodigo);
        formData.append("tip", tip);

        try {
            const res = await fetch(`${API_URL}/api/Plano/subir-imagen-otras-zonas`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const err = await res.text();
                alert("Error:\n" + err);
                return;
            }

            const data = await res.json();
            vistaPrevia.src = `${API_URL}/planos/${data.nombreArchivo}?v=${Date.now()}`;
            alert("✅ Imagen de otras zonas subida correctamente."); 
        } catch (err) {
            console.error("Error de red:", err);
            alert("Fallo al conectar con el servidor.");
        }
    });

    async function cargarImagenSiExisteOZ(codigo) {
        try {
            const res = await fetch(`${API_URL}/api/Plano/obtener-nombre-otras-zonas/${encodeURIComponent(codigo)}`);
            if (!res.ok) throw new Error("No existe imagen");

            const data = await res.json();
            vistaPrevia.src = `${API_URL}/planos/${data.nombre}?v=${Date.now()}`;
            console.log("Imagen otras zonas encontrada:", data.nombre);
        } catch {
            vistaPrevia.src = "";
            console.warn("No hay imagen de otras zonas para mostrar.");
        }
    }
});
