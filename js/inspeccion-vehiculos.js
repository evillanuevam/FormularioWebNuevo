// Función para agregar una nueva fila a la tabla de inspección
function agregarFila() {
    const tabla = document.getElementById('tabla-inspeccion').getElementsByTagName('tbody')[0];
    const nuevaFila = document.createElement('tr');

    nuevaFila.innerHTML = `
        <td><input type="date" name="dia[]" required></td>
        <td><input type="time" name="hora[]" required></td>
        <td><input type="text" name="matricula[]" required></td>
        <td><input type="number" name="ocupantes[]" min="1" required></td>
        <td><input type="checkbox" name="bolsillos-delanteros[]"></td>
        <td><input type="checkbox" name="bolsillos-traseros[]"></td>
        <td><input type="checkbox" name="maletero[]"></td>
        <td><input type="checkbox" name="guardabarros[]"></td>
        <td><input type="checkbox" name="alojamiento-motor[]"></td>
        <td><input type="text" name="zonas[]" placeholder="Especificar zonas"></td>
        <td><button type="button" class="btn-eliminar" onclick="eliminarFila(this)">
            <i class="fa fa-trash"></i>
        </button></td>
    `;

    tabla.appendChild(nuevaFila);
}

// Función para eliminar una fila
function eliminarFila(button) {
    const tabla = document.getElementById('tabla-inspeccion').getElementsByTagName('tbody')[0];
    const fila = button.closest('tr');

    // Verifica si hay más de una fila antes de eliminar
    if (tabla.rows.length > 1) {
        fila.remove();
    } else {
        alert("Debe haber al menos una fila en la tabla.");
    }
}
