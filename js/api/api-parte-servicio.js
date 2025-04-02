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


// ✅ Validar que las horas de descripción estén dentro del rango del turno
function validarHorasDescripcionEnRango() {
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const hoy = new Date().toISOString().split("T")[0];

    if (!horaInicio || !horaFin) return true;

    const inicio = new Date(`${hoy}T${horaInicio}`);
    const fin = new Date(`${hoy}T${horaFin}`);

    let esValido = true;

    const horasDescripcion = document.querySelectorAll("input[name='hora-inicio']");

    horasDescripcion.forEach(input => {
        const horaValor = input.value;
        if (!horaValor) return;

        const horaDesc = new Date(`${hoy}T${horaValor}`);
        if (horaDesc < inicio || horaDesc > fin) {
            input.classList.add("hora-fuera-rango");
            esValido = false;
        } else {
            input.classList.remove("hora-fuera-rango");
        }
    });

    if (!esValido) {
        alert("⚠️ Hay horas fuera del rango del turno. Corrígelas antes de enviar.");
    }

    return esValido;
}

// ✅ Validación en tiempo real al escribir hora
document.addEventListener("input", function (event) {
    if (event.target && event.target.matches("input[name='hora-inicio']")) {
        const horaInput = event.target;
        const hora = horaInput.value;
        const horaInicio = document.getElementById("horaInicio").value;
        const horaFin = document.getElementById("horaFin").value;

        if (!hora || !horaInicio || !horaFin) return;

        const [hDesc, mDesc] = hora.split(":").map(Number);
        const [hIni, mIni] = horaInicio.split(":").map(Number);
        const [hFin, mFin] = horaFin.split(":").map(Number);

        const minutosDesc = hDesc * 60 + mDesc;
        const minutosIni = hIni * 60 + mIni;
        const minutosFin = hFin * 60 + mFin;

        if (minutosDesc < minutosIni || minutosDesc > minutosFin) {
            horaInput.style.border = "2px solid red";
            horaInput.style.backgroundColor = "#ffe5e5";
            horaInput.title = "⛔ Esta hora está fuera del horario del turno.";
        } else {
            horaInput.style.border = "";
            horaInput.style.backgroundColor = "";
            horaInput.title = "";
        }
    }
});


// ✅ Enviar el formulario
document.getElementById("formulario").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validarHorasDescripcionEnRango()) return; // 🔒 Detener si hay errores

    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;
    console.log("📌 FechaSeleccionada antes de enviar:", fechaSeleccionada);

    const parteServicio = {
        fechaRegistro: new Date().toISOString(),
        fechaSeleccionada: fechaSeleccionada,
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
        materialControlado: obtenerMaterialControlado(),
        leidoNormativa: obtenerValorRadio("normativa"),
        accidentesPuesto: obtenerValorRadio("accidentes"),
        usuario: obtenerUsuarioDatos(),
        descripciones: obtenerDescripciones(),
        vehiculos: obtenerVehiculos() // ✅ agrega esta línea
    };

    console.log("📤 Enviando datos al backend:", JSON.stringify(parteServicio, null, 2));

    try {
        const response = await fetch(`${API_URL}/api/ParteServicio/GuardarParteServicio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parteServicio),
        });
        
        let data;
        try {
            data = await response.json(); // Intenta parsear JSON
        } catch (err) {
            const text = await response.text(); // Si no es JSON, obtenemos el texto (HTML de error)
            console.error("❌ Respuesta no es JSON. HTML recibido:", text);
            throw new Error("El servidor respondió con un error que no es JSON.");
        }
        
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

// ✅ Obtener vehiculos del formulario
function obtenerVehiculos() {
    const contenedor = document.getElementById("contenedor-tabla-vehiculos");
    if (!contenedor || contenedor.style.display === "none") return [];

    const filas = document.querySelectorAll("#tabla-inspeccion-vehiculos tbody tr");
    const vehiculos = [];

    filas.forEach(fila => {
        const horaInput = fila.querySelector("input[name='horaVehiculo[]']");
        const matriculaInput = fila.querySelector("input[name='matriculaVehiculo[]']");
        const detallesInput = fila.querySelector("textarea[name='detalles']");
        const estadoSelect = fila.querySelector("select[name='revisionVehiculo[]']");
        const observacionesInput = fila.querySelector("textarea[name='observacionesVehiculo[]']");

        // Validar campos obligatorios
        if (
            horaInput?.value &&
            matriculaInput?.value.trim() !== "" &&
            detallesInput?.value.trim() !== "" &&
            estadoSelect?.value.trim() !== ""
        ) {
            vehiculos.push({
                hora: horaInput.value,
                matricula: matriculaInput.value.trim(),
                detallesChecklist: detallesInput.value.trim(),
                estadoRevision: estadoSelect.value.trim(),
                observaciones: observacionesInput?.value.trim() || "Sin observaciones"
            });
        }
    });

    return vehiculos;
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

