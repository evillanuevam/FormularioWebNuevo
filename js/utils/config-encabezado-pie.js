document.addEventListener("DOMContentLoaded", function () {
    // === CAMBIO DE IDIOMA ===
    const languageButton = document.querySelector(".language-button");
    const languageBar = document.querySelector("#languageBar");
    const header = document.querySelector(".header");
    const logo = document.querySelector(".header-logo");
    const headerText = document.querySelector(".header-text");
    const languageOptions = document.querySelectorAll(".language-option");

    // Guarda el texto original del header dinámicamente
    const originalHeaderText = headerText.textContent;

    // Alternar barra de idiomas y encabezado
    if (languageButton) {
        languageButton.addEventListener("click", function () {
            languageBar.classList.toggle("visible"); // Mostrar/Ocultar barra de idiomas
            header.classList.toggle("header-green"); // Cambiar color del encabezado

            // Cambiar logo y texto
            if (header.classList.contains("header-green")) {
                logo.src = "images/aena-green-bg.svg"; // Logo con fondo verde
                headerText.textContent = "Elige idioma"; // Texto actualizado
            } else {
                logo.src = "images/aena.svg"; // Logo original
                headerText.textContent = originalHeaderText; // Recupera el texto original
            }
        });
    }

    // Seleccionar idioma
    languageOptions.forEach(option => {
        option.addEventListener("click", function (e) {
            e.preventDefault();
            // Quitar 'selected' de todos los idiomas y agregarlo al seleccionado
            languageOptions.forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    // === BOTÓN "SUBIR" Y LÍNEA DE PROGRESO ===
    const scrollToTopButton = document.querySelector(".scroll-to-top");
    const scrollProgress = document.getElementById("scrollProgress");

    if (scrollToTopButton) {
        scrollToTopButton.classList.add("hidden"); // Ocultar botón al cargar

        function updateScrollState() {
            const scrollPosition = window.scrollY; // Posición actual del scroll
            const documentHeight = document.body.scrollHeight - window.innerHeight; // Altura total del documento visible
            const scrollPercentage = (scrollPosition / documentHeight) * 100; // Porcentaje del scroll

            scrollProgress.style.width = scrollPercentage + "%"; // Actualizar la barra de progreso

            // Mostrar u ocultar el botón SUBIR según la posición del scroll
            scrollToTopButton.classList.toggle("hidden", scrollPosition === 0);
        }

        updateScrollState(); // Inicializar estado
        window.addEventListener("scroll", updateScrollState);
    }

    // === FUNCIÓN PARA ALTERNAR LA BARRA LATERAL Y MOVER FORMULARIO ===
    const toggleSidebarButton = document.getElementById("toggle-sidebar");
    const sidebar = document.querySelector(".index-sidebar");
    const formContainer = document.querySelector(".form-container");

    if (toggleSidebarButton && sidebar) {
        toggleSidebarButton.addEventListener("click", function () {
            if (this.querySelector("i")) {  // ✅ Verifica que el <i> existe antes de cambiar su clase
                this.querySelector("i").classList.toggle("active");
            }
            sidebar.classList.toggle("active");
    
            if (formContainer) {  // ✅ Verifica que formContainer existe antes de usarlo
                formContainer.classList.toggle("shifted");
            }
        });
    }

    // === CAMBIO DEL TEXTO DEL HEADER AL SELECCIONAR UN AEROPUERTO ===
    const aeropuertoSelect = document.getElementById("aeropuerto");

    if (aeropuertoSelect) {
        aeropuertoSelect.addEventListener("change", function () {
            let selectedValue = this.value;
            let airportName = selectedValue.replace(/^[A-Z]{3} - /, ""); // Elimina el código IATA
            headerText.textContent = airportName; // Cambia el texto del header
        });
    }
});
