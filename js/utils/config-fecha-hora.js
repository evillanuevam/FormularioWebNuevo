document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { // Aseguramos que se ejecute después de la carga del DOM
        const fechaRegistroInput = document.getElementById("fecha");

        if (fechaRegistroInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajusta la zona horaria

            fechaRegistroInput.value = now.toISOString().slice(0, 16); // Formato correcto
            console.log("Fecha registrada:", fechaRegistroInput.value); // Verificar en consola
        } else {
            console.error("No se encontró el campo 'fecha'");
        }
    }, 500); // Esperamos 500ms para asegurar que el DOM está listo

    // Función para permitir la deselección de botones de radio al hacer clic en ellos nuevamente
    function habilitarDesmarcarRadios() {
        document.addEventListener("click", (event) => {
            if (event.target.type === "radio") {
                if (event.target.checked) {
                    if (event.target.wasChecked) {
                        event.target.checked = false; // Desmarcar si se hace clic nuevamente
                    }
                    event.target.wasChecked = !event.target.wasChecked; // Alternar estado
                }
            }
        });
    }

    //Llamamos a la función para manejar todos los radios en la página
    habilitarDesmarcarRadios();
});
