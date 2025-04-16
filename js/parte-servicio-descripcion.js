//PARTE DE SERVICIO DESCRIPCION
function agregarDescripcion() {
    const container = document.getElementById('descripcion-container');
    const nuevaDescripcion = document.createElement('div');
    nuevaDescripcion.classList.add('descripcion-item');

    // Crear un ID único para cada input de archivo
    const uniqueId = 'archivo_' + Date.now();

    // Obtener el nombre del vigilante desde la sesión
    const nombreVigilante = document.getElementById("nombre-vigilante").value;

    nuevaDescripcion.innerHTML = `
        <div class="horario">
            <div class="horario-item">
                <label for="hora-inicio">Hora</label>
                <input type="time" name="hora-inicio" required>
            </div>
            <div class="puesto-item">
                <select name="puesto" class="puesto-select" required>
                    <option value="" disabled selected> Puesto Vigilante</option>
                    <!-- Opciones dinámicas -->
                </select>
            </div>
        </div>

        <!-- Columna 2: Descripción del servicio -->
        <textarea name="descripcion-servicio" placeholder="Describe el servicio realizado" required></textarea>
        <!-- Columna 3: Acción tomada -->
        <textarea name="descripcion-accion" placeholder="Describe la acción tomada (opcional)"></textarea>
        <!-- Columna 4: Verificación + Checkbox incidencia -->
        <div class="verificacion-container">
            <!-- Contenedor de verificación -->
            <div class="verificacion-item">
                <label for="verificacion">Verificación:</label>
                <select name="verificacion">
                    <option value="" disabled selected>....</option>
                    <option value="Ok">Ok</option>
                    <option value="No OK">No OK</option>
                </select>
            </div>
            <!-- Contenedor de checkbox de incidencia -->
            <div class="incidencia-item">
                <label for="incidencia">Marcar si es incidencia:</label>
                <input type="checkbox" class="incidencia-checkbox">
                <input type="hidden" name="incidencia" value="Incidencia">
            </div>
            <!-- Contenedor para tipo de incidencia (se agregará dinámicamente si el checkbox está marcado) -->
            <div class="tipo-incidencia-container" style="display: none;">
                
                <select name="tipoIncidencia" class="tipo-incidencia-select">
                    <option value="" disabled selected>Tipo de Incidencia</option>
                    <!-- Las opciones se insertarán por JS -->
                </select>
            </div>

        </div>
        <!-- Contenedor 5: de subida de archivos -->
        <div class="archivo-item">
        <input type="file" id="${uniqueId}" class="archivo-input" style="display: none;" onchange="mostrarNombreArchivo(this)">
        <button type="button" class="archivo-boton" onclick="document.getElementById('${uniqueId}').click();">
            📁 Subir archivo
        </button>
        <span class="archivo-nombre">Archivo no seleccionado</span>
        </div>
        
        <!-- Columna 6: Botón eliminar -->
        <button type="button" class="btn-eliminar" onclick="eliminarDescripcion(this)" title="Eliminar">
            <i class="fa fa-trash"></i>
        </button>
    `;

    // Agregar evento para capitalizar el texto en tiempo real en los nuevos textarea
    nuevaDescripcion.querySelectorAll("textarea[name='descripcion-servicio'], textarea[name='descripcion-accion'], textarea[name='observacionesVehiculo']").forEach(textarea => {
        textarea.addEventListener("input", function () {
            let cursorPos = this.selectionStart; // Guardar la posición del cursor
            this.value = capitalizarFrase(this.value);
            this.setSelectionRange(cursorPos, cursorPos); // Restaurar posición del cursor
        });
    });

    container.appendChild(nuevaDescripcion);

    // Llamar a la función para que registre los eventos en los nuevos checkboxes
    activarCambioColorIncidencia();

    // 🔹 Rellenar los puestos disponibles desde la API
    obtenerPuestosVigilanteDesdeAPI().then(puestos => {
        const selectPuesto = nuevaDescripcion.querySelector(".puesto-select");
        if (selectPuesto && puestos.length > 0) {
            puestos.forEach(puesto => {
                const option = document.createElement("option");
                option.value = puesto;
                option.textContent = puesto;
                selectPuesto.appendChild(option);
            });
        }
    });

}


// Mostrar el nombre del archivo seleccionado
function mostrarNombreArchivo(input) {
    let nombreArchivo = input.files.length > 0 ? input.files[0].name : "No se ha seleccionado archivo";
    input.nextElementSibling.nextElementSibling.textContent = nombreArchivo;
}

function activarCambioColorIncidencia() {
    document.querySelectorAll('.incidencia-checkbox').forEach(checkbox => {
        if (!checkbox.dataset.listenerAdded) { // ✅ Evita duplicar eventos
            const descripcionItem = checkbox.closest('.descripcion-item');
            const inputHidden = descripcionItem.querySelector('input[type="hidden"][name="incidencia"]');

            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    descripcionItem.style.backgroundColor = "#ffcccc";
                    if (inputHidden) inputHidden.value = "si";
                } else {
                    descripcionItem.style.backgroundColor = "";
                    if (inputHidden) inputHidden.value = "no";
                }
            });

            checkbox.dataset.listenerAdded = "true"; // 🔒 Marca como agregado
        }
    });
}

// Asegurar que se ejecuta cuando la página se carga
document.addEventListener("DOMContentLoaded", activarCambioColorIncidencia);

// Eliminar descripción
function eliminarDescripcion(button) {
    const container = document.getElementById('descripcion-container');
    const item = button.closest('.descripcion-item');

    // Verifica si hay más de una descripción antes de eliminar
    if (container.children.length > 1) {
        item.remove();
    } else {
        alert("Debe haber al menos una descripción del servicio.");
    }
}

// Función para mostrar material controlado en caso de "otros"
function toggleOtrosInput() {
    let otrosCheckbox = document.getElementById('otros');
    let otrosInput = document.getElementById('otros-material');

    // Si el checkbox está marcado, mostramos el input
    if (otrosCheckbox.checked) {
        otrosInput.style.display = 'inline-block';
        otrosInput.focus(); // Poner el cursor en el input
    } else {
        otrosInput.style.display = 'none';
        otrosInput.value = ''; // Limpiar el campo si se deselecciona
    }
}

//************************************ TABLA INSPECCION DIARIO DE VEHICULOS ****************************************/

//PARTE SERVICIO VEHICULOS:
function agregarFila() {
    const tabla = document.getElementById("tabla-inspeccion-vehiculos").querySelector("tbody");
    const nuevaFila = document.createElement("tr");

    nuevaFila.innerHTML = `
        <td><input type="time" name="horaVehiculo[]"></td>
        <td><input type="text" name="matriculaVehiculo[]" placeholder="Matrícula"></td>
        <td>
            <button type="button" class="btn-detalles" onclick="abrirModal(this)">🛠 Detalles</button>
        </td>
        <td><textarea type="text" name="detalles" placeholder="Seleccione los distintos detalles" readonly></textarea></td>
        <td>
            <select name="revisionVehiculo[]">
            <option value="">Seleccionar</option>
            <option value="OK">OK</option>
            <option value="NO OK">NO OK</option>
            </select>
        </td>
        <td><textarea type="text" name="observacionesVehiculo[]" placeholder="Ingresar observación relevante (opcional)"></textarea></td>

        <td>
            <button type="button" class="btn-eliminar" onclick="eliminarFila(this)">
            <i class="fa fa-trash"></i>
            </button>
        </td>
    `;

    tabla.appendChild(nuevaFila);
}

function eliminarFila(boton) {
    const fila = boton.closest("tr");
    fila.remove();
}

document.addEventListener("DOMContentLoaded", function () {
    const contenedorTabla = document.getElementById("contenedor-tabla-vehiculos");
    const botonToggle = document.getElementById("toggle-tabla-vehiculos");

    // Ocultar al cargar
    contenedorTabla.style.display = "none";

    botonToggle.addEventListener("click", function () {
        if (contenedorTabla.style.display === "none") {
            contenedorTabla.style.display = "block";
            botonToggle.textContent = "Ocultar Tabla de Inspeccion de Vehículos";
        } else {
            contenedorTabla.style.display = "none";
            botonToggle.textContent = "Mostrar Tabla de Inspeccion de Vehículos";
        }
    });
});


//************************************MANEJO DE MODAL*********************************************
function abrirModal(boton) {
    const modal = document.getElementById("modalRevision");
    modal.style.display = "block";
    // Puedes aquí guardar a qué fila se está asociando para después guardar los datos si hace falta
}
  
function cerrarModal() {
    document.getElementById("modalRevision").style.display = "none";
}
  
function guardarChecklist() {
    // Aquí podrías guardar los checks en memoria o asociarlos a la fila correspondiente
    cerrarModal();
}

//rellenar Modal en text area
let textareaDetallesActual = null;

function abrirModal(boton) {
    const fila = boton.closest('tr');
    const matricula = fila.querySelector('input[name="matriculaVehiculo[]"]').value;
    textareaDetallesActual = fila.querySelector('textarea[name="detalles"]');

    // Asigna la matrícula al título
    const titulo = document.getElementById("tituloModal");
    titulo.textContent = `Checklist de Revisión del Vehículo: ${matricula || '(sin matrícula)'}`;

    // Obtener los valores ya seleccionados desde el textarea
    const valoresPrevios = (textareaDetallesActual.value || "")
    .split(",")
    .map(t => t.trim());

    // Recorrer los checkboxes del modal y marcar si coincide con los valores previos
    document.querySelectorAll('#modalRevision input[type="checkbox"]').forEach(chk => {
    const texto = chk.parentElement.textContent.trim();
    chk.checked = valoresPrevios.includes(texto);
    });

    // Abre el modal
    document.getElementById("modalRevision").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modalRevision").style.display = "none";
}

function guardarChecklist() {
  const checks = document.querySelectorAll('#modalRevision input[type="checkbox"]');
  const seleccionados = [];

  checks.forEach(chk => {
    if (chk.checked) {
      seleccionados.push(chk.parentElement.textContent.trim());
    }
  });

  // Guarda los resultados en el textarea
  if (textareaDetallesActual) {
    textareaDetallesActual.value = seleccionados.join(", ");
  }

  cerrarModal();
}



