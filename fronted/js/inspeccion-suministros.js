// Función para agregar una nueva fila a la tabla de inspección
function agregarFila() {
    const tbody = document.querySelector('#tabla-inspeccion tbody');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td><input type="date" name="dia[]" required></td>
        <td><input type="time" name="hora[]" required></td>
        <td><input type="text" name="matricula[]" required></td>
        <td><input type="text" name="empresa[]" required></td>
        <td><input type="text" name="personas[]" required></td>
        <td><input type="text" name="tipo-suministro[]" required></td>
        <td><input type="radio" name="inspeccion-si[]"></td>
        <td><input type="radio" name="inspeccion-no[]"></td>
        <td><input type="text" name="combinacion[]" placeholder="Ej: A, B, C, D"></td>
        <td><input type="text" name="inspeccion-100[]" placeholder=" "></td>
        <td><button type="button" class="btn-eliminar" onclick="eliminarFila(this)"><i class="fa fa-trash"></i></button></td>
    `;
    tbody.appendChild(nuevaFila);
}

// Función para eliminar una fila de la tabla de inspección
function eliminarFila(button) {
    const tbody = document.querySelector('#tabla-inspeccion tbody');
    const fila = button.closest('tr');
    if (tbody.children.length > 1) {
        fila.remove();
    } else {
        alert("Debe haber al menos una fila en la tabla.");
    }
}
