document.addEventListener("DOMContentLoaded", function () {
    function mostrarTab(tabId) {
        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remover clase activa de todas las pestañas
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Mostrar el contenido seleccionado
        document.getElementById(tabId).classList.add('active');

        // Marcar la pestaña activa
        event.currentTarget.classList.add('active');
    }

    // Agregar eventos a las pestañas
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function () {
            mostrarTab(this.getAttribute('data-tab'));
        });
    });

});

