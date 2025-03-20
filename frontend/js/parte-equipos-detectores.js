function cambiarTitulo() {
    let tipoTest = document.getElementById("tipo-test").value;
    let titulo = document.getElementById("titulo-formulario");
    if (tipoTest === "ETD") {
        titulo.textContent = "Test de Verificación - Equipos Detectores de Trazas Explosivos (ETD)";
    } else {
        titulo.textContent = "Test de Verificación - Equipos Detectores de Líquidos (LEDS)";
    }
}

function agregarFila() {
    let tabla = document.getElementById("tabla-equipos").getElementsByTagName('tbody')[0];
    let nuevaFila = tabla.insertRow();
    nuevaFila.innerHTML = `
        <td><input type="text" name="equipo[]" required title="Ingrese nombre del equipo" aria-label="equipo"></td>
        <td><input type="text" name="marca[]" required title="Ingrese la la marca" aria-label="marca"></td>
        <td>
        <select name="control[]" required title="Seleccion uno" aria-label="control de seguridad">
            <option value="" disabled selected>Seleccione...</option>
            <option value="PAX">PAX</option>
            <option value="Personal">Personal</option>
            <option value="Mixto">Mixto</option>
        </select>
        </td>
        <td><input type="text" name="serie[]" required title="Ingrese Nº de Serie" aria-label="Serie"></td>
        <td>
            <div class="radio-group">
                <input type="radio" name="tipo[]" value="A" required title="Seleccione el tipo" aria-label="Opción A"> A
                <input type="radio" name="tipo[]" value="B" aria-label="Opción B"> B
            </div>
            </td>
        <td>
            <div class="radio-group">
                <input type="radio" name="verificacion[]" value="OK" required title="Seleccione uno" aria-label="Opción OK"> Ok
                <input type="radio" name="verificacion[]" value="NO_OK" aria-label="Opción No OK"> No Ok
            </div>
        </td>
        <td><input type="text" name="comentarios[]" title="Escriba un comentario" aria-label="comentario"></td>
        <td><button type="button" class="btn-eliminar" onclick="eliminarFila(this)" title="Eliminar fila"><i class="fa fa-trash"></i></button></td>
    `;
}


function eliminarFila(btn) {
    let tabla = document.getElementById("tabla-equipos").getElementsByTagName('tbody')[0];
    let fila = btn.closest("tr");
    
    // Verifica si hay más de una fila antes de eliminar (preguntar si se puede quitar )
    if (tabla.rows.length > 1) {
        fila.remove();
    } else {
        alert("Debe haber al menos un equipo en la lista.");
    }
}
