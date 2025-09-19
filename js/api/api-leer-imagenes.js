
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ JS de leer imágenes cargado");

    const formulario = document.getElementById("formulario-perimetro");
    const inputArchivo = document.getElementById("file-plano");
    const selectAeropuerto = document.getElementById("aeropuerto-perimetro");
    const vistaPrevia = document.getElementById("vista-previa-plano");

    if (!formulario || !inputArchivo || !selectAeropuerto || !vistaPrevia) {
        console.warn("⚠️ Elementos no encontrados.");
        return;
    }

    // Mostrar imagen ya guardada al cambiar el aeropuerto
    selectAeropuerto.addEventListener("change", () => {
        const codigo = selectAeropuerto.value;
        if (!codigo) {
            vistaPrevia.src = "";
            return;
        }

        cargarImagenSiExiste(codigo);
    });

    async function cargarImagenSiExiste(codigo) {
        try {
            const res = await fetch(`${API_URL}/api/Plano/obtener-nombre/${codigo}`);
            if (!res.ok) throw new Error("No existe imagen");

            const data = await res.json();
            const urlImagen = `${API_URL}/planos/${data.nombre}?v=${new Date().getTime()}`;
            vistaPrevia.src = urlImagen;
            console.log("✅ Imagen encontrada:", data.nombre);
        } catch (error) {
            vistaPrevia.src = "";
            console.warn("⚠️ No hay imagen para mostrar.");
        }
    }

    // Vista previa inmediata
    inputArchivo.addEventListener("change", () => {
        const archivo = inputArchivo.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = e => {
                vistaPrevia.src = e.target.result;
            };
            lector.readAsDataURL(archivo);
        }
    });

    // Subir imagen
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const archivo = inputArchivo.files[0];
        const aeropuertoCodigo = selectAeropuerto.value;

        if (!archivo || !aeropuertoCodigo) {
            alert("⚠️ Selecciona archivo y aeropuerto.");
            return;
        }

        const { tip } = obtenerUsuarioDatos();
        const formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("aeropuertoCodigo", aeropuertoCodigo);
        formData.append("tip", tip);


        try {
            const res = await fetch(`${API_URL}/api/Plano/subir-imagen`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                alert("✅ Imagen subida correctamente");

                vistaPrevia.src = `${API_URL}/planos/${data.nombreArchivo}?v=${new Date().getTime()}`;
                console.log("📸 Imagen subida como:", data.nombreArchivo);
            } else {
                const err = await res.text();
                alert("❌ Error:\n" + err);
            }
        } catch (err) {
            console.error("❌ Error de red:", err);
            alert("❌ Fallo al conectar con el servidor.");
        }
    });

    // ⚡ Cargar imagen automáticamente si ya hay un aeropuerto seleccionado
    if (selectAeropuerto.value) {
        cargarImagenSiExiste(selectAeropuerto.value);
    }
});
