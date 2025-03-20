const API_URL = window.CONFIG.API_BASE_URL; // Obtener la URL de la API

// ✅ Función para capitalizar la primera letra en tiempo real en el campo "Otros"
function capitalizarOtros() {
    let otrosInput = document.getElementById("otros-material");

    if (otrosInput) {
        otrosInput.addEventListener("input", function () {
            let texto = otrosInput.value.trim();
            if (texto.length > 0) {
                otrosInput.value = texto.charAt(0).toUpperCase() + texto.slice(1);
            }
        });
    }
}

// ✅ Modificar `toggleOtrosInput` para incluir la capitalización en tiempo real
function toggleOtrosInput() {
    let otrosCheckbox = document.getElementById('otros');
    let otrosInput = document.getElementById('otros-material');

    if (otrosCheckbox.checked) {
        otrosInput.style.display = 'inline-block';
        otrosInput.focus();
        capitalizarOtros(); // Aplicar la función al campo "Otros"
    } else {
        otrosInput.style.display = 'none';
        otrosInput.value = ''; // Limpiar el campo si se deselecciona
    }
}

// ✅ Ejecutar la capitalización cuando cargue la página
document.addEventListener("DOMContentLoaded", function () {
    capitalizarOtros(); // Asegurar que se aplica al cargar
});

// ✅ Función para capitalizar frases en tiempo real
function capitalizarFrase(texto) {
    if (!texto) return texto;

    texto = texto.toLowerCase(); // Convertir todo a minúsculas
    let resultado = "";
    let inicioOracion = true;

    for (let i = 0; i < texto.length; i++) {
        if (inicioOracion && texto[i].match(/[a-zA-Z]/)) {
            resultado += texto[i].toUpperCase(); // Primera letra de cada oración en mayúscula
            inicioOracion = false;
        } else {
            resultado += texto[i];
        }

        if (".!?".includes(texto[i])) {
            inicioOracion = true; // Si es un punto, la siguiente letra debe ir en mayúscula
        }
    }
    return resultado;
}

// ✅ Aplicar la capitalización en tiempo real a los textarea
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("textarea[name='descripcion-servicio'], textarea[name='descripcion-accion'], textarea[name='observaciones']").forEach(textarea => {
        textarea.addEventListener("input", function () {
            let cursorPos = this.selectionStart; // Guardar posición del cursor
            this.value = capitalizarFrase(this.value);
            this.setSelectionRange(cursorPos, cursorPos); // Restaurar posición del cursor
        });
    });
});

// ✅ Cargar datos desde el backend al cargar la página ( SI NO SE QUIERE INFORMACION AL CARGA LA PAGINA CARGARSE ESTO)
document.addEventListener("DOMContentLoaded", async function () {
    const { tip, aeropuerto } = obtenerUsuarioDatos();
    if (!tip || !aeropuerto) {
        console.error("❌ TIP o Aeropuerto no encontrados.");
        return;
    }
    const aeropuertoCodificado = encodeURIComponent(aeropuerto);
    console.log(`🔹 TIP: ${tip}, Aeropuerto: ${aeropuerto}, Codificado: ${aeropuertoCodificado}`);

    try {
        const response = await fetch(`${API_URL}/api/ParteServicio/GetParteServicio?tip=${tip}&aeropuerto=${aeropuertoCodificado}`);
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        const data = await response.json();
        console.log("✅ Datos cargados desde API:", data);

        if (data.parteServicio) {
            document.getElementById("horaInicio").value = data.parteServicio.horaInicio || "";
            document.getElementById("horaFin").value = data.parteServicio.horaFin || "";
            document.getElementById("fechaSeleccionada").value = data.parteServicio.fechaSeleccionadaISO || ""; // 🔹 Mostrar la nueva fecha
        
            // 🔹 Agregar esta línea para asegurarte de que los materiales se marquen
            marcarMaterialControlado(data.parteServicio.materialControlado);
            // 🔹 Agrega aquí la llamada a seleccionarOpcion()
            seleccionarOpcion("normativa", data.parteServicio.leidoNormativa);
            seleccionarOpcion("accidentes", data.parteServicio.accidentesPuesto);
        }    

        if (data.descripciones && data.descripciones.length > 0) {
            console.log(`🔹 Cargando ${data.descripciones.length} descripciones desde el backend.`);
            data.descripciones.forEach(descripcion => agregarDescripcion(descripcion));
        }
    } catch (error) {
        console.error("⚠️ Error cargando los datos:", error);
    }
});


// ✅ Enviar el formulario
document.getElementById("formulario").addEventListener("submit", async function (event) {
    event.preventDefault();

    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value; // 🔹 Capturar correctamente la fecha
    console.log("📌 FechaSeleccionada antes de enviar:", fechaSeleccionada); // 🔍 Verificar en consola

    const parteServicio = {
        fechaRegistro: new Date().toISOString(), // ✅ Mantiene la fecha y hora del sistema
        fechaSeleccionada: fechaSeleccionada, // ✅ Guarda la fecha seleccionada sin hora
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
        materialControlado: obtenerMaterialControlado(),
        leidoNormativa: obtenerValorRadio("normativa"),
        accidentesPuesto: obtenerValorRadio("accidentes"),
        usuario: obtenerUsuarioDatos(),
        descripciones: obtenerDescripciones()
    };

    console.log("📤 Enviando datos al backend:", JSON.stringify(parteServicio, null, 2));

    try {
        const response = await fetch(`${API_URL}/api/ParteServicio/GuardarParteServicio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parteServicio),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || `Error HTTP ${response.status}`);

        alert("✅ Parte de servicio guardado con éxito.");
        location.reload();
    } catch (error) {
        console.error("⚠️ Error al guardar:", error);
    }
});


// ✅ Obtener datos del usuario desde el token y normalizar caracteres especiales
function obtenerUsuarioDatos() {
    const token = sessionStorage.getItem("token");
    if (!token) {
        console.error("❌ No hay token en sessionStorage.");
        return {};
    }
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log("🔹 Token decodificado:", decoded);
        
        let aeropuertoNormalizado = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();
        
        let tipNormalizado = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"].trim();

        return {
            tip: tipNormalizado,
            aeropuerto: aeropuertoNormalizado,
            nombre: decoded["Nombre"],
            apellido1: decoded["Apellido1"],
            apellido2: decoded["Apellido2"]
        };
    } catch (error) {
        console.error("❌ Error al decodificar el token:", error);
        return {};
    }
}

// ✅ Obtener valor de radio (Sí/No/No definido)
function obtenerValorRadio(nombre) {
    const radioSi = document.querySelector(`input[name='${nombre}'][value='Si']`);
    const radioNo = document.querySelector(`input[name='${nombre}'][value='No']`);

    if (radioSi && radioSi.checked) return "Sí";
    if (radioNo && radioNo.checked) return "No";
    return "No definido";
}

// ✅ Seleccionar opciones en los radios al cargar
function seleccionarOpcion(nombre, valor) {
    const radioSi = document.querySelector(`input[name='${nombre}'][value='Si']`);
    const radioNo = document.querySelector(`input[name='${nombre}'][value='No']`);

    if (valor === "Sí" && radioSi) {
        radioSi.checked = true;
    } else if (valor === "No" && radioNo) {
        radioNo.checked = true;
    }
    
}

// ✅ Convertir checkbox de incidencia en "Incidencia" o "No incidencia"
function obtenerValorIncidencia(checkbox) {
    return checkbox ? (checkbox.checked ? "Incidencia" : "No incidencia") : "No incidencia";
}

// ✅ Obtener descripciones del formulario
function obtenerDescripciones() {
    const descripciones = [];
    document.querySelectorAll("#descripcion-container .descripcion-item").forEach(item => {
        const observacionesInput = document.querySelector("textarea[name='observaciones']"); // 🔹 Asegurar que se toma correctamente
        descripciones.push({
            hora: item.querySelector("input[name='hora-inicio']")?.value || "00:00",
            descripcion: item.querySelector("textarea[name='descripcion-servicio']")?.value || "Sin descripción",
            accionTomada: item.querySelector("textarea[name='descripcion-accion']")?.value || "Sin acción",
            verificacion: item.querySelector("select[name='verificacion']")?.value || "No definido",
            esIncidencia: obtenerValorIncidencia(item.querySelector(".incidencia-checkbox")),
            observaciones: observacionesInput ? observacionesInput.value.trim() : "Sin observaciones",
            archivoRuta: null
        });
    });
    return descripciones;
}

// ✅ Marcar materiales controlados incluyendo "Otros" si tiene un valor válido
function marcarMaterialControlado(materiales) {
    if (!materiales) return;

    const lista = materiales.split(", ").map(m => m.trim()); // Asegurar que los valores estén limpios
    let otrosCheckbox = document.getElementById("otros");
    let otrosInput = document.getElementById("otros-material");

    // Lista de materiales estándar
    const materialesEstandar = ["Arma", "Linterna", "Llaves", "Walkies", "Vehículo", "Otros"];

    // Marcar los checkboxes que coincidan con la lista de materiales
    document.querySelectorAll("input[name='material']").forEach(checkbox => {
        checkbox.checked = lista.includes(checkbox.value);
    });

    // Filtrar materiales que NO estén en la lista estándar → Estos son "Otros"
    const materialesNoEstandar = lista.filter(m => !materialesEstandar.includes(m));

    if (materialesNoEstandar.length > 0) {
        otrosCheckbox.checked = true;
        otrosInput.style.display = 'inline-block';
        otrosInput.value = materialesNoEstandar.join(", "); // Mostrar los materiales personalizados
    } else {
        otrosCheckbox.checked = false;
        otrosInput.style.display = 'none';
        otrosInput.value = "";
    }
}

// ✅ Obtener materiales controlados incluyendo el campo de "Otros"
function obtenerMaterialControlado() {
    let materiales = Array.from(document.querySelectorAll("input[name='material']:checked"))
        .map(checkbox => checkbox.value);

    // Verificar si "Otros" está marcado y añadir su contenido
    let otrosCheckbox = document.getElementById("otros");
    let otrosInput = document.getElementById("otros-material");

    if (otrosCheckbox.checked && otrosInput.value.trim() !== "") {
        materiales = materiales.filter(m => m !== "Otros"); // Evitar duplicar "Otros"
        materiales.push(otrosInput.value.trim()); // Agregar el valor ingresado
    }

    return materiales.join(", ") || "No definido";
}

//************************************ MANEJO DE LA FECHA ***********************************************************/

// ✅ FECHA: Actualizar datos cuando se cambia de fecha
document.getElementById("fechaSeleccionada").addEventListener("change", async function () {
    const nuevaFecha = this.value;
    console.log(`📆 Nueva fecha seleccionada: ${nuevaFecha}`);

    await cargarParteServicio(nuevaFecha);
    await cargarDescripcionesPorFecha(nuevaFecha);
});

// ✅ Función para cargar datos del parte de servicio
async function cargarParteServicio() {
    const { tip, aeropuerto } = obtenerUsuarioDatos();
    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;

    if (!tip || !aeropuerto) {
        console.error("❌ TIP o Aeropuerto no encontrados.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/ParteServicio/GetParteServicio?tip=${tip}&aeropuerto=${encodeURIComponent(aeropuerto)}&fechaSeleccionada=${fechaSeleccionada}`);

        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        const data = await response.json();
        console.log("✅ Datos cargados desde API:", data);

        if (data.parteServicio) {
            document.getElementById("horaInicio").value = data.parteServicio.horaInicio || "";
            document.getElementById("horaFin").value = data.parteServicio.horaFin || "";
            document.getElementById("fechaSeleccionada").value = data.parteServicio.fechaSeleccionadaISO || "";

            marcarMaterialControlado(data.parteServicio.materialControlado);
            seleccionarOpcion("normativa", data.parteServicio.leidoNormativa);
            seleccionarOpcion("accidentes", data.parteServicio.accidentesPuesto);
        } else {
            //console.warn("⚠️ No hay parte de servicio para la fecha seleccionada.");
            resetearFormulario();
        }
    } catch (error) {
        console.error("❌ Error cargando los datos:", error);
    }
}

// ✅ Función para limpiar los campos si no hay datos
function resetearFormulario() {
    console.log("🧹 Limpiando formulario...");
    document.getElementById("horaInicio").value = "";
    document.getElementById("horaFin").value = "";
    document.querySelectorAll("input[type='checkbox']").forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll("input[type='radio']").forEach(radio => radio.checked = false);
}

//************************************ MANEJO DE LA TABLA ***********************************************************/

// ✅ Función para actualizar la tabla con nuevas descripciones
function actualizarDescripcionesEnTabla(descripciones) {
    console.log(`📌 Insertando ${descripciones.length} descripciones en la tabla...`);

    const tablaBody = document.getElementById("tabla-descripciones-body");
    if (!tablaBody) {
        console.error("⚠️ No se encontró el elemento 'tabla-descripciones-body' en el DOM.");
        return;
    }

    tablaBody.innerHTML = ""; 

    if (descripciones.length === 0) {
        mostrarMensajeTabla("No hay registros disponibles.");
        return;
    }

    const encabezados = ["Nombre", "Fecha", "Hora", "Descripción", "Acción Tomada", "Verificación", "Es Incidencia", "Observaciones"];

    descripciones.forEach(descripcion => {
        const fila = document.createElement("tr");
        if (descripcion.esIncidencia.trim().toLowerCase() === "incidencia") {
            fila.classList.add("incidencia");
        }

        const valores = [
            descripcion.nombre || "Sin nombre",
            formatFecha(descripcion.fechaDescripcion) || "Sin fecha",
            descripcion.horaDescripcion || "00:00",
            descripcion.descripcion || "Sin descripción",
            descripcion.accionTomada || "Sin acción",
            descripcion.verificacion || "No definido",
            descripcion.esIncidencia || "No incidencia",
            descripcion.observaciones || "Sin observaciones"
        ];

        fila.innerHTML = valores.map((valor, index) => `<td data-label="${encabezados[index]}">${valor}</td>`).join("");
        tablaBody.appendChild(fila);
    });
}

// ✅ Función para cargar descripciones de la fecha seleccionada
async function cargarDescripcionesPorFecha() {
    const { aeropuerto } = obtenerUsuarioDatos();
    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;

    if (!aeropuerto) {
        console.error("❌ Aeropuerto no encontrado en el token.");
        return;
    }
    try {
        const aeropuertoCodificado = encodeURIComponent(aeropuerto.trim());
        const fechaCodificada = encodeURIComponent(fechaSeleccionada.trim());
        let url = `${API_URL}/api/ParteServicio/GetDescripcionesDelDia?aeropuerto=${aeropuertoCodificado}&fechaSeleccionada=${fechaCodificada}`;

        console.log(`🔹 Solicitando datos de descripciones: ${url}`);
        
        const response = await fetch(url);

        // ✅ Manejo específico del error 404 sin lanzar excepción
        if (response.status === 404) {
            console.warn("⚠️ No hay registros para la fecha seleccionada.");
            mostrarMensajeTabla("No hay registros disponibles.");
            return;
        }

        // ✅ Si la respuesta no es exitosa, lanzar error manualmente
        if (!response.ok) {
            console.error(`❌ Error HTTP ${response.status}`);
            mostrarMensajeTabla("Error al cargar los datos.");
            return;
        }

        // ✅ Procesar la respuesta correctamente
        const data = await response.json();
        console.log("✅ Descripciones cargadas desde API:", data);

        // ✅ Si no hay valores en la respuesta, mostrar mensaje sin lanzar error
        if (!data || !data.$values || data.$values.length === 0) {
            console.warn("⚠️ La API devolvió una respuesta vacía.");
            mostrarMensajeTabla("No hay registros disponibles.");
            return;
        }

        // ✅ Actualizar la tabla si hay datos
        actualizarDescripcionesEnTabla(data.$values);

    } catch (error) {
        console.error("❌ Error al cargar los datos desde la API:", error);
        mostrarMensajeTabla("Error al cargar los datos.");
    }
}

// ✅ Función para mostrar un mensaje en la tabla si no hay datos
function mostrarMensajeTabla(mensaje) {
    const tablaBody = document.getElementById("tabla-descripciones-body");
    if (tablaBody) {
        tablaBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">${mensaje}</td></tr>`;
    }
}

// ✅ Formatear fecha
function formatFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
}

// ✅ Ejecutar la carga inicial
document.addEventListener("DOMContentLoaded", cargarDescripcionesPorFecha);
