//variables globales
const API_URL = window.CONFIG.API_BASE_URL; // Obtener la URL de la API
let hayVehiculosIncompletos = false; //tiene que ser let, porque const no permite reasignacion
let hayProveedoresIncompletos = false;

// Modificar `toggleOtrosInput` para incluir la capitalización en tiempo real
function toggleOtrosInput() {
    let otrosCheckbox = document.getElementById('otros');
    let otrosInput = document.getElementById('otros-material');

    if (otrosCheckbox.checked) {
        otrosInput.style.display = 'inline-block';
        otrosInput.focus();
    } else {
        otrosInput.style.display = 'none';
        otrosInput.value = ''; // Limpiar el campo si se deselecciona
    }
}

// Cargar datos desde el backend al cargar la página ( SI NO SE QUIERE INFORMACION AL CARGA LA PAGINA CARGARSE ESTO) es necesario para mostrar informacion de descripcion del tip
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
        
            // Agregar esta línea para asegurarte de que los materiales se marquen
            marcarMaterialControlado(data.parteServicio.materialControlado);
            // Agrega aquí la llamada a seleccionarOpcion()
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

// Validar que las horas de descripción estén dentro del rango del turno
function validarHorasDescripcionEnRango() {
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;

    if (!horaInicio || !horaFin || !fechaSeleccionada) return true;

    const inicio = new Date(`${fechaSeleccionada}T${horaInicio}`);
    let fin = new Date(`${fechaSeleccionada}T${horaFin}`);

    const cruzaMedianoche = horaFin <= horaInicio;
    if (cruzaMedianoche) fin.setDate(fin.getDate() + 1);

    let esValido = true;

    const horasDescripcion = document.querySelectorAll("input[name='hora-inicio']");
    horasDescripcion.forEach(input => {
        const horaValor = input.value;
        if (!horaValor) return;

        let fechaHoraDesc = new Date(`${fechaSeleccionada}T${horaValor}`);

        if (cruzaMedianoche && fechaHoraDesc < inicio) {
            fechaHoraDesc.setDate(fechaHoraDesc.getDate() + 1);
        }

        if (fechaHoraDesc < inicio || fechaHoraDesc > fin) {
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


//validar que la hora de la inspeccion de proveedores este dentro del rango de  hora del turno.
function validarHorasProveedoresEnRango() {
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFin = document.getElementById("horaFin").value;
    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;

    if (!horaInicio || !horaFin || !fechaSeleccionada) return true;

    const inicio = new Date(`${fechaSeleccionada}T${horaInicio}`);
    let fin = new Date(`${fechaSeleccionada}T${horaFin}`);

    const cruzaMedianoche = horaFin <= horaInicio;
    if (cruzaMedianoche) fin.setDate(fin.getDate() + 1);

    let esValido = true;

    const horasProveedor = document.querySelectorAll("input[name='horaProveedor[]']");
    horasProveedor.forEach(input => {
        const horaValor = input.value;
        if (!horaValor) return;

        let fechaHora = new Date(`${fechaSeleccionada}T${horaValor}`);
        if (cruzaMedianoche && fechaHora < inicio) {
            fechaHora.setDate(fechaHora.getDate() + 1);
        }

        if (fechaHora < inicio || fechaHora > fin) {
            input.classList.add("hora-fuera-rango");
            esValido = false;
        } else {
            input.classList.remove("hora-fuera-rango");
        }
    });

    if (!esValido) {
        alert("⚠️ Hay horas de proveedores fuera del rango del turno. Corrígelas antes de enviar.");
    }

    return esValido;
}


// ✅ Validación en tiempo real al escribir hora (ahora incluye proveedores)
document.addEventListener("input", function (event) {
    if (event.target && event.target.matches("input[name='hora-inicio'], input[name='horaVehiculo[]'], input[name='horaProveedor[]']")) {
        const horaInput = event.target;
        const hora = horaInput.value;
        const horaInicio = document.getElementById("horaInicio").value;
        const horaFin = document.getElementById("horaFin").value;
        const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;

        if (!hora || !horaInicio || !horaFin || !fechaSeleccionada) return;

        const inicio = new Date(`${fechaSeleccionada}T${horaInicio}`);
        let fin = new Date(`${fechaSeleccionada}T${horaFin}`);
        let actual = new Date(`${fechaSeleccionada}T${hora}`);

        const cruzaMedianoche = horaFin < horaInicio;
        if (cruzaMedianoche) {
            if (actual < inicio) actual.setDate(actual.getDate() + 1);
            fin.setDate(fin.getDate() + 1);
        }

        if (actual < inicio || actual > fin) {
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


// ✅ Enviar el formulario ( PRINCIPAL PARA ENVIAR DATOS A LA BASE DE DATOS)
document.getElementById("formulario").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validarHorasDescripcionEnRango()) return; // 🔒 Detener si hay errores
    if (!validarHorasProveedoresEnRango()) return;


    const fechaSeleccionada = document.getElementById("fechaSeleccionada").value;
    console.log("📌 FechaSeleccionada antes de enviar:", fechaSeleccionada);

    // ⏳ Obtener vehículos ANTES de construir el objeto final
    const vehiculos = obtenerVehiculos();

    // ⚠️ Verificar si hay vehículos incompletos y no se guardará ninguno
    if (hayVehiculosIncompletos && vehiculos.length === 0) {
        alert("⚠️ Tabla de vehículos incompleta. Ingrese todos los campos obligatorios o elimine la fila.");
        return;
    }

    const proveedores = obtenerProveedores();

    if (hayProveedoresIncompletos && proveedores.length === 0) {
        alert("⚠️ Tabla de proveedores incompleta. Ingrese todos los campos obligatorios o elimine la fila.");
        return;
    }

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
        vehiculos: vehiculos, // ya lo obtuviste arriba
        proveedores: obtenerProveedores() // 👈 ✅ asegúrate de que esta línea esté incluida
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
        const observacionesInput = document.querySelector("textarea[name='observaciones']");

        const checkbox = item.querySelector(".incidencia-checkbox");
        const tipoIncidenciaSelect = item.querySelector(".tipo-incidencia-select");

        let valorIncidencia = "No incidencia";

        if (checkbox && checkbox.checked) {
            if (!tipoIncidenciaSelect || !tipoIncidenciaSelect.value) {
                alert("⚠️ Marcaste una incidencia pero no seleccionaste el tipo. Corrige antes de continuar.");
                throw new Error("Tipo de incidencia no seleccionado.");
            }
            valorIncidencia = tipoIncidenciaSelect.value;
        }

        descripciones.push({
            hora: item.querySelector("input[name='hora-inicio']")?.value || "00:00",
            puestoVigilante: item.querySelector("select[name='puesto']")?.value || "No definido",
            descripcion: item.querySelector("textarea[name='descripcion-servicio']")?.value || "Sin descripción",
            accionTomada: item.querySelector("textarea[name='descripcion-accion']")?.value || "Sin acción",
            verificacion: item.querySelector("select[name='verificacion']")?.value || "No definido",
            esIncidencia: valorIncidencia,
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

// ✅ Obtener vehiculos del formulario
function obtenerVehiculos() {
    const contenedor = document.getElementById("contenedor-tabla-vehiculos");
    if (!contenedor || contenedor.style.display === "none") return [];

    const filas = document.querySelectorAll("#tabla-inspeccion-vehiculos tbody tr");
    const vehiculos = [];
    hayVehiculosIncompletos = false; // Reiniciar estado

    filas.forEach(fila => {
        // Quitar cualquier marca anterior de error
        fila.style.border = "";
        fila.style.backgroundColor = "";

        const horaInput = fila.querySelector("input[name='horaVehiculo[]']");
        const matriculaInput = fila.querySelector("input[name='matriculaVehiculo[]']");
        const detallesInput = fila.querySelector("textarea[name='detalles']");
        const estadoSelect = fila.querySelector("select[name='revisionVehiculo[]']");
        const observacionesInput = fila.querySelector("textarea[name='observacionesVehiculo[]']");

        const hora = horaInput?.value;
        const matricula = matriculaInput?.value.trim();
        const detalles = detallesInput?.value.trim();
        const estado = estadoSelect?.value.trim();
        const observaciones = observacionesInput?.value.trim() || "Sin observaciones";

        const esCompleto = hora && matricula && detalles && estado;

        if (esCompleto) {
            vehiculos.push({
                hora: hora.length === 5 ? `${hora}:00` : hora,
                matricula,
                detallesChecklist: detalles,
                estadoRevision: estado,
                observaciones
            });
        } else {
            hayVehiculosIncompletos = true;
            // 🔴 Marcar fila en rojo
            fila.style.border = "2px solid red";
            fila.style.backgroundColor = "#ffe5e5";
        }
    });

    return vehiculos;
}

//funcion para obtener vehiculos.
function obtenerProveedores() {
    const contenedor = document.getElementById("contenedor-tabla-proveedores");
    if (!contenedor || contenedor.style.display === "none") return [];

    const filas = document.querySelectorAll("#tabla-inspeccion-proveedores tbody tr");
    const proveedores = [];
    hayProveedoresIncompletos = false; // Reiniciar estado

    filas.forEach(fila => {
        fila.style.border = "";
        fila.style.backgroundColor = "";

        const horaInput = fila.querySelector("input[name='horaProveedor[]']");
        const nombreInput = fila.querySelector("select[name='nombreProveedor[]']");
        const fechaExpiracionInput = fila.querySelector("input[name='fechaExpiracionProveedor[]']");
        const estadoSelect = fila.querySelector("select[name='estadoProveedor[]']");
        const observacionesInput = fila.querySelector("textarea[name='observacionesProveedor[]']");

        const hora = horaInput?.value;
        const nombreProveedor = nombreInput?.value?.trim();
        const fechaExpiracion = fechaExpiracionInput?.value;
        const estado = estadoSelect?.value?.trim();
        const observaciones = observacionesInput?.value?.trim() || "Sin observaciones";

        const esCompleto = hora && nombreProveedor && fechaExpiracion && estado;

        if (esCompleto) {
            proveedores.push({
                hora: hora.length === 5 ? `${hora}:00` : hora,
                nombreProveedor,
                fechaExpiracionProveedor: fechaExpiracion,
                estado,
                observaciones
            });
        } else {
            hayProveedoresIncompletos = true;
            fila.style.border = "2px solid red";
            fila.style.backgroundColor = "#ffe5e5";
        }
    });

    return proveedores;
}



//******************************* DESPLEGABLE INCIDENCIA***************************************/

//mostrar el desplegable al dar check en en recuadro de incidencia.
document.addEventListener("change", async function (event) {
    if (event.target.classList.contains("incidencia-checkbox")) {
        const checkbox = event.target;
        const contenedor = checkbox.closest(".descripcion-item");
        const tipoContainer = contenedor.querySelector(".tipo-incidencia-container");
        const select = contenedor.querySelector(".tipo-incidencia-select");

        if (checkbox.checked) {
            const tipos = await obtenerTiposIncidenciaDesdeAPI();
        
            select.innerHTML = `<option value="" disabled selected>Seleccionar Incidencia</option>`;
            tipos.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo;
                option.textContent = tipo;
                select.appendChild(option);
            });
        
            select.required = true;
            tipoContainer.style.display = "block";
        
            // ✅ Activar clase para ampliar textarea
            contenedor.classList.add("incidencia-activa");
        
        } else {
            tipoContainer.style.display = "none";
            select.innerHTML = "";
            select.required = false;
        
            // ✅ Quitar clase si se desmarca
            contenedor.classList.remove("incidencia-activa");
        }
        
    }
});

async function obtenerTiposIncidenciaDesdeAPI() {
    const { aeropuerto, rol } = obtenerUsuarioDatos();
    if (!aeropuerto) return [];

    try {
        const response = await fetch(`${API_URL}/api/Administrar/leer-incidencias?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Error al obtener incidencias");

        const data = await response.json();
        const lista = data.$values || [];
        const incidencias = lista.map(i => i.nombreIncidencia);

        // ✅ Si es administrador, agregamos la opción especial
        if (rol === "Administrador") {
            incidencias.push("➕ Añadir más incidencias");
        }

        return incidencias;
    } catch (err) {
        console.error("❌ Error al obtener tipos de incidencia:", err);
        return [];
    }
}

document.addEventListener("change", function (event) {
    if (event.target.classList.contains("tipo-incidencia-select")) {
        if (event.target.value === "➕ Añadir más incidencias") {
            window.location.href = "adm-parte-servicio.html#incidencias";
        }
    }

});


//********************************* DESPLEGABLE PUESTOS DE VIGILANTE **************************************//
async function obtenerPuestosVigilanteDesdeAPI() {
    const { aeropuerto } = obtenerUsuarioDatos();
    if (!aeropuerto) return [];

    try {
        const response = await fetch(`${API_URL}/api/Administrar/leer-puestos?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Error al obtener puestos");

        const data = await response.json();
        console.log("✅ Puestos vigilante desde backend:", data);

        const lista = data.$values || [];
        return lista.map(p => p.nombrePuesto);
    } catch (err) {
        console.error("❌ Error al obtener puestos:", err);
        return [];
    }
}

// ✅ Llenar todos los select de puestos existentes (incluye el que viene por defecto en el HTML)
async function llenarSelectsPuestos() {
    const puestos = await obtenerPuestosVigilanteDesdeAPI();
    const { rol } = obtenerUsuarioDatos();

    document.querySelectorAll("select.puesto-select").forEach(select => {
        select.innerHTML = `<option value="" disabled selected>Puesto Vigilante</option>`;
        
        puestos.forEach(puesto => {
            const option = document.createElement("option");
            option.value = puesto;
            option.textContent = puesto;
            select.appendChild(option);
        });

        // opción solo para admin
        if (rol === "Administrador") {
            const opcionExtra = document.createElement("option");
            opcionExtra.value = "añadir-puesto";
            opcionExtra.textContent = "➕ Añadir más puestos";
            select.appendChild(opcionExtra);
        }
    });
}

// cuando se eleige la opcion de añador puestos, para redirigir
document.addEventListener("change", function (event) {
    if (event.target.classList.contains("puesto-select") && event.target.value === "añadir-puesto") {
        window.location.href = "adm-parte-servicio.html#puestos";
    }
});

// ✅ Ejecutar automáticamente al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    llenarSelectsPuestos();
});

//******************************* DESPLEGABLE INSPECCION DE PROVEEDORES **************************************/

// ============================ DESPLEGABLE PROVEEDORES ===============================

async function obtenerProveedoresDesdeAPI() {
    const { aeropuerto } = obtenerUsuarioDatos();
    if (!aeropuerto) return [];

    try {
        const response = await fetch(`${API_URL}/api/Administrar/leer-proveedores?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Error al obtener proveedores");

        const data = await response.json();
        const lista = data.$values || [];
        return lista.map(p => p.nombreProveedor);
    } catch (err) {
        console.error("❌ Error al obtener proveedores:", err);
        return [];
    }
}

async function llenarSelectsProveedores(selectEspecifico = null) {
    const proveedores = await obtenerProveedoresDesdeAPI();
    const { rol } = obtenerUsuarioDatos();

    const selects = selectEspecifico ? [selectEspecifico] : document.querySelectorAll("select.select-proveedor");

    selects.forEach(select => {
        select.innerHTML = `<option value="" disabled selected>Seleccione un proveedor</option>`;

        proveedores.forEach(nombre => {
            const option = document.createElement("option");
            option.value = nombre;
            option.textContent = nombre;
            select.appendChild(option);
        });

        if (rol === "Administrador") {
            const extra = document.createElement("option");
            extra.value = "añadir-proveedor";
            extra.textContent = "➕ Añadir nuevo proveedor";
            select.appendChild(extra);
        }
    });
}

// Redirigir si se elige la opción de añadir nuevo proveedor
document.addEventListener("change", function (event) {
    if (event.target.classList.contains("select-proveedor") && event.target.value === "añadir-proveedor") {
        window.location.href = "adm-parte-servicio.html#proveedores";
    }
});

// Ejecutar al cargar página
document.addEventListener("DOMContentLoaded", function () {
    llenarSelectsProveedores();
});
