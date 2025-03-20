document.addEventListener("DOMContentLoaded", function () {
    // ====================================
    // GENERACIÓN DE CUADRÍCULA EN EL PLANO
    // ==================================
    const gridOverlay = document.querySelector(".grid-overlay");
    const filas = 7;
    const columnas = 15;
    const letras = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];

    for (let fila = 1; fila <= filas; fila++) {
        for (let col = 0; col < columnas; col++) {
            let cell = document.createElement("div");
            cell.classList.add("grid-cell");
            let identificador = `${fila}${letras[col]}`; // Ejemplo: "3G"
            cell.dataset.id = identificador; // Guardamos el ID en un atributo de datos
            cell.addEventListener("click", function () {
                // Agregar o quitar selección
                if (this.classList.contains("selected")) {
                    this.classList.remove("selected");
                    this.textContent = ""; // Borra el texto si se deselecciona
                } else {
                    this.classList.add("selected");
                    this.textContent = identificador; // Muestra el identificador dentro
                }
            });
            gridOverlay.appendChild(cell);
        }
    }

    // ==========================================
    // GENERACIÓN DE RONDAS
    // ===========================================

    // Mapeo de aeropuertos con sus respectivas rondas
    const rondasPorAeropuerto = {
        "ABC - Albacete": ["Ronda 1", "Ronda 2"],
        "AGP - Málaga-Costa del Sol": ["Ronda 1", "Ronda 2", "Ronda 3", "Ronda 4"],
        "BCN - Barcelona-El Prat": ["Ronda 1", "Ronda 2", "Ronda 3"],
        "MAD - Madrid-Barajas": ["Ronda 1", "Ronda 2", "Ronda 3", "Ronda 4", "Ronda 5"],
        "XRY - Jerez de la Frontera": ["Ronda 1", "Ronda 2"],
        // Agregar más aeropuertos aquí
    };

    const aeropuertoSelect = document.getElementById("aeropuerto");
    const rondasSelect = document.getElementById("rondas");

    aeropuertoSelect.addEventListener("change", function () {
        const aeropuertoSeleccionado = this.value;
        rondasSelect.innerHTML = `<option value="" disabled selected>Seleccione una Ronda</option>`; // Limpia opciones anteriores

        if (rondasPorAeropuerto[aeropuertoSeleccionado]) {
            rondasPorAeropuerto[aeropuertoSeleccionado].forEach(ronda => {
                let option = document.createElement("option");
                option.value = ronda;
                option.textContent = ronda;
                rondasSelect.appendChild(option);
            });
        }
    });

    // ==========================================
    // GENERACIÓN DE PUNTOS DE FICHAJE EN LA RONDA
    // ===========================================
    // esto se modificara para traerlos de la base de datos 
    const puntosFichaje = [
        "Punto 1 - Entrada Principal",
        "Punto 2 - Salida Norte",
        "Punto 3 - Torre de Control",
        "Punto 4 - Hangares"
    ];

    // Opciones de estado para el desplegable
    const estados = [
        "Seleccione...","Correcto", "Deteriorado", "Agujereado", "No anclado",
        "Objetos junto al vallado (ZT/ZC)", "Vegetación abundante (ZT/ZC)",
        "Anomalías en las puertas", "Mal estado de basamento",
        "Cámara de seguridad", "Acumulación de plásticos/papel/basura",
        "Cartel", "Otros"
    ];

    // Seleccionamos el cuerpo de la tabla
    const tbody = document.querySelector("#tabla-inspeccion tbody");

    if (tbody) {  // Verificamos que la tabla existe antes de ejecutar el código
        puntosFichaje.forEach((punto) => {
            const fila = document.createElement("tr");

            // Columna: Punto de Fichaje
            const tdPunto = document.createElement("td");
            tdPunto.textContent = punto;
            tdPunto.classList.add("punto-fichaje"); // Asignar clase CSS
            fila.appendChild(tdPunto);

            // Columna: Hora (input type time)
            const tdHora = document.createElement("td");
            tdHora.classList.add("hora"); // Asignar clase CSS
            const inputHora = document.createElement("input");
            inputHora.type = "time";
            tdHora.appendChild(inputHora);
            fila.appendChild(tdHora);

            // Columna: Estado (select dropdown)
            const tdEstado = document.createElement("td");
            tdEstado.classList.add("estado"); // Asignar clase CSS
            const selectEstado = document.createElement("select");

            estados.forEach((estado) => {
                const option = document.createElement("option");
                option.value = estado;
                option.textContent = estado;
                selectEstado.appendChild(option);
            });

            tdEstado.appendChild(selectEstado);
            fila.appendChild(tdEstado);

            // Columna: Observaciones (input text)
            const tdObservaciones = document.createElement("td");
            tdObservaciones.classList.add("observaciones"); // Asignar clase CSS
            const inputObservaciones = document.createElement("textarea");
            inputObservaciones.placeholder = "Ingrese observaciones";
            tdObservaciones.appendChild(inputObservaciones);
            fila.appendChild(tdObservaciones);

            // Agregar fila a la tabla
            tbody.appendChild(fila);
        });
    }
    
    // ==========================================
    // GENERACIÓN DE PUERTAS DE PERIMETRO
    // ===========================================    
    // Lista de puertas de ejemplo (luego se reemplazará con datos de la base de datos)
    const puertasPerimetro = [
        "P10", "P11", "P13", "P15", "P15R", "P17", "P19"
    ];

    // Seleccionamos el cuerpo de la tabla
    const tbodyPuertas = document.querySelector("#tabla-puertas tbody");

    if (tbodyPuertas) {
        puertasPerimetro.forEach((puerta, index) => {
            const fila = document.createElement("tr");

            // Columna: Nombre de la puerta
            const tdPuerta = document.createElement("td");
            tdPuerta.textContent = puerta;
            tdPuerta.classList.add("puerta-revision"); // ✅ Se agrega clase
            fila.appendChild(tdPuerta);

            // Función auxiliar para crear un grupo de radio buttons
            function crearRadioGrupo(name) {
                const divRadio = document.createElement("div");
                divRadio.classList.add("radio-group"); // ✅ Se agrega clase

                // Crear opción "Correcto"
                const radioCorrecto = document.createElement("input");
                radioCorrecto.type = "radio";
                radioCorrecto.name = name;
                radioCorrecto.value = "correcto";
                radioCorrecto.id = `${name}-correcto`;

                const labelCorrecto = document.createElement("label");
                labelCorrecto.textContent = "✅";
                labelCorrecto.setAttribute("for", `${name}-correcto`);

                // Crear opción "Incorrecto"
                const radioIncorrecto = document.createElement("input");
                radioIncorrecto.type = "radio";
                radioIncorrecto.name = name;
                radioIncorrecto.value = "incorrecto";
                radioIncorrecto.id = `${name}-incorrecto`;

                const labelIncorrecto = document.createElement("label");
                labelIncorrecto.textContent = "❌";
                labelIncorrecto.setAttribute("for", `${name}-incorrecto`);

                // Agregar elementos al contenedor
                divRadio.appendChild(radioCorrecto);
                divRadio.appendChild(labelCorrecto);
                divRadio.appendChild(radioIncorrecto);
                divRadio.appendChild(labelIncorrecto);

                return divRadio;
            }

            // Columna: Estado General
            const tdEstadoGeneral = document.createElement("td");
            tdEstadoGeneral.classList.add("estado-general"); // ✅ Se agrega clase
            tdEstadoGeneral.appendChild(crearRadioGrupo(`estado-general-${index}`));
            fila.appendChild(tdEstadoGeneral);

            // Columna: Apertura y Cierre
            const tdAperturaCierre = document.createElement("td");
            tdAperturaCierre.classList.add("apertura-cierre"); // ✅ Se agrega clase
            tdAperturaCierre.appendChild(crearRadioGrupo(`apertura-cierre-${index}`));
            fila.appendChild(tdAperturaCierre);

            // Columna: Tipo de Cerradura
            const tdTipoCerradura = document.createElement("td");
            tdTipoCerradura.classList.add("tipo-cerradura"); // ✅ Se agrega clase
            const selectCerradura = document.createElement("select");

            // Opción por defecto "Seleccione"
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione...";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            selectCerradura.appendChild(defaultOption);

            // Opciones de cerradura
            ["Electrónico", "Mecánico"].forEach((tipo) => {
                const option = document.createElement("option");
                option.value = tipo;
                option.textContent = tipo;
                selectCerradura.appendChild(option);
            });

            tdTipoCerradura.appendChild(selectCerradura);
            fila.appendChild(tdTipoCerradura);

            // Columna: Apertura y Cierre de Cerradura
            const tdAperturaCerradura = document.createElement("td");
            tdAperturaCerradura.classList.add("apertura-cerradura"); // ✅ Se agrega clase
            tdAperturaCerradura.appendChild(crearRadioGrupo(`apertura-cerradura-${index}`));
            fila.appendChild(tdAperturaCerradura);

            // Columna: Estado General de Cerradura
            const tdEstadoCerradura = document.createElement("td");
            tdEstadoCerradura.classList.add("estado-cerradura"); // ✅ Se agrega clase
            tdEstadoCerradura.appendChild(crearRadioGrupo(`estado-cerradura-${index}`));
            fila.appendChild(tdEstadoCerradura);

            // Columna: Observaciones
            const tdObservaciones = document.createElement("td");
            tdObservaciones.classList.add("observaciones-puertas"); // ✅ Se agrega clase
            const inputObservaciones = document.createElement("textarea");
            inputObservaciones.placeholder = "Ingrese observaciones";
            tdObservaciones.appendChild(inputObservaciones);
            fila.appendChild(tdObservaciones);

            // Agregar fila a la tabla
            tbodyPuertas.appendChild(fila);
        });
    }
    // =================================================================
    // GENERACIÓN DE LISTADO DE ZONAS ( PAGINA patrullas - otras - zonas)
    // ================================================================== 
     // Lista de zonas (ejemplo, se reemplazará con datos dinámicos en el futuro)
     const zonas = [
        "Zona A - Terminal Principal",
        "Zona B - Área de Carga",
        "Zona C - Plataforma",
        "Zona D - Seguridad",
        "Zona E - Estacionamiento"
    ];

    // Seleccionamos el cuerpo de la tabla
    const tbodyZonas = document.querySelector("#tabla-zonas tbody");

    if (tbodyZonas) {
        zonas.forEach((zona, index) => {
            const fila = document.createElement("tr");

            // Columna: Nombre de la Zona
            const tdZona = document.createElement("td");
            tdZona.textContent = zona;
            tdZona.classList.add("zona");
            fila.appendChild(tdZona);

            // Columna: Hora de Inicio (input type time)
            const tdHoraInicio = document.createElement("td");
            const inputHoraInicio = document.createElement("input");
            inputHoraInicio.type = "time";
            inputHoraInicio.classList.add("hora-inicio");
            tdHoraInicio.appendChild(inputHoraInicio);
            fila.appendChild(tdHoraInicio);

            // Columna: Hora de Fin (input type time)
            const tdHoraFin = document.createElement("td");
            const inputHoraFin = document.createElement("input");
            inputHoraFin.type = "time";
            inputHoraFin.classList.add("hora-fin");
            tdHoraFin.appendChild(inputHoraFin);
            fila.appendChild(tdHoraFin);

            // Función auxiliar para crear radio buttons de estado
            function crearRadioGrupo(name) {
                const divRadio = document.createElement("div");

                // Opción "OK"
                const radioOK = document.createElement("input");
                radioOK.type = "radio";
                radioOK.name = name;
                radioOK.value = "ok";
                radioOK.id = `${name}-ok`;

                const labelOK = document.createElement("label");
                labelOK.textContent = "✅";
                labelOK.setAttribute("for", `${name}-ok`);

                // Opción "No OK"
                const radioNoOK = document.createElement("input");
                radioNoOK.type = "radio";
                radioNoOK.name = name;
                radioNoOK.value = "no-ok";
                radioNoOK.id = `${name}-no-ok`;

                const labelNoOK = document.createElement("label");
                labelNoOK.textContent = "❌";
                labelNoOK.setAttribute("for", `${name}-no-ok`);

                // Agregar elementos al contenedor
                divRadio.appendChild(radioOK);
                divRadio.appendChild(labelOK);
                divRadio.appendChild(radioNoOK);
                divRadio.appendChild(labelNoOK);

                return divRadio;
            }

            // Columna: Estado (OK / No OK)
            const tdEstado = document.createElement("td");
            tdEstado.appendChild(crearRadioGrupo(`estado-zona-${index}`));
            tdEstado.classList.add("estado");
            fila.appendChild(tdEstado);

            // Columna: Observaciones
            const tdObservaciones = document.createElement("td");
            tdObservaciones.classList.add("observaciones-zonas");
            const inputObservaciones = document.createElement("textarea");
            inputObservaciones.placeholder = "Ingrese observaciones";
            tdObservaciones.appendChild(inputObservaciones);
            fila.appendChild(tdObservaciones);

            // Agregar fila a la tabla
            tbodyZonas.appendChild(fila);
        });
    }


});
