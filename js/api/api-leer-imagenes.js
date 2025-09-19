//========================================= LEER IMAGENES PERIMETRO ==============================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ JS de leer imágenes cargado");

    const formulario = document.getElementById("formulario-perimetro");
    const inputArchivo = document.getElementById("file-plano");
    const selectAeropuerto = document.getElementById("aeropuerto-perimetro");
    const vistaPrevia = document.getElementById("vista-previa-plano");

    if (!formulario || !inputArchivo || !selectAeropuerto || !vistaPrevia) {
        console.warn("⚠️ Elementos de formulario de plano no encontrados en el DOM.");
        return;
    }

    // Fecha de hoy en formato YYYYMMDD
    const obtenerFechaHoy = () => {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, "0");
        const dd = String(hoy.getDate()).padStart(2, "0");
        return `${yyyy}${mm}${dd}`;
    };

    // Mostrar imagen al cambiar aeropuerto
    const mostrarImagenActual = () => {
        const codigo = selectAeropuerto.value;
        if (!codigo) {
            vistaPrevia.src = "";
            return;
        }

        const fecha = obtenerFechaHoy();
        const posiblesExtensiones = [".jpg", ".jpeg", ".png"];
        const baseURL = `${API_URL}/planos/`;

        let encontrada = false;

        posiblesExtensiones.forEach(ext => {
            const url = `${baseURL}${codigo}_perimetro_${fecha}${ext}`;

            fetch(url, { method: "HEAD" })
                .then(res => {
                    if (res.ok && !encontrada) {
                        vistaPrevia.src = url;
                        encontrada = true;
                    }
                })
                .catch(() => {
                    // Silenciar errores 404
                });
        });

    };

    // Mostrar imagen ya existente al cargar la página
    selectAeropuerto.addEventListener("change", mostrarImagenActual);

    // Mostrar vista previa inmediata
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

    // Subida de imagen
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const archivo = inputArchivo.files[0];
        const aeropuertoCodigo = selectAeropuerto.value;

        if (!archivo || !aeropuertoCodigo) {
            alert("⚠️ Completa todos los campos.");
            return;
        }

        const formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("aeropuertoCodigo", aeropuertoCodigo);

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

                // Actualizar vista previa con nombre correcto
                vistaPrevia.src = `${API_URL}/planos/${data.nombreArchivo}`;
                console.log("Nombre guardado:", data.nombreArchivo);
            } else {
                const err = await res.text();
                alert("❌ Error al subir la imagen:\n" + err);
            }
        } catch (error) {
            console.error("❌ Error de red:", error);
            alert("❌ Error al conectar con el servidor");
        }
    });

    // Mostrar imagen directamente al cargar la página (si ya hay aeropuerto seleccionado)
    if (selectAeropuerto.value) {
        mostrarImagenActual();
    }
});
