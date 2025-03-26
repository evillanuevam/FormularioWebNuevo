//norrmal
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
            <div class="nombre-vigilante">
                <label class="label-nombre-vigilante"><em>${nombreVigilante}</em></label>
            </div>    
            <div class="horario-item">
                <label for="hora-inicio">Hora</label>
                <input type="time" name="hora-inicio" required>
            </div>
        </div>

        <textarea name="descripcion-servicio" placeholder="Describe el servicio realizado" required></textarea>
        <textarea name="descripcion-accion" placeholder="Describe la acción tomada (opcional)"></textarea>

        <!-- Contenedor de verificación y checkbox -->
        <div class="verificacion-container">
            <div class="verificacion-item">
                <label for="verificacion">Verificación</label>
                <select name="verificacion">
                    <option value="" disabled selected>Seleccione...</option>
                    <option value="Ok">Ok</option>
                    <option value="No Ok">No OK</option>
                </select>
            </div>

            <div class="incidencia-item">
                <label for="incidencia">Marque si es incidencia:</label>
                <input type="checkbox" class="incidencia-checkbox">
                <input type="hidden" name="incidencia" value="Incidencia">
            </div>
        </div>

        <!-- Sección de subida de archivo -->
        <div class="archivo-item">
            <input type="file" id="${uniqueId}" class="archivo-input" style="display: none;" onchange="mostrarNombreArchivo(this)">
            <button type="button" class="archivo-boton" onclick="document.getElementById('${uniqueId}').click();">
                📁 Subir archivo
            </button>
            <span class="archivo-nombre">Archivo no seleccionado</span>
        </div>

        <button type="button" class="btn-eliminar" onclick="eliminarDescripcion(this)" title="Eliminar">
            <i class="fa fa-trash"></i>
        </button>
    `;

    // Agregar evento para capitalizar el texto en tiempo real en los nuevos textarea
    nuevaDescripcion.querySelectorAll("textarea[name='descripcion-servicio'], textarea[name='descripcion-accion']").forEach(textarea => {
        textarea.addEventListener("input", function () {
            let cursorPos = this.selectionStart; // Guardar la posición del cursor
            this.value = capitalizarFrase(this.value);
            this.setSelectionRange(cursorPos, cursorPos); // Restaurar posición del cursor
        });
    });

    container.appendChild(nuevaDescripcion);

    // Llamar a la función para que registre los eventos en los nuevos checkboxes
    activarCambioColorIncidencia();

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



