
document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("🔒 Debes iniciar sesión primero.");
        window.location.href = "index.html";
        return;
    }

    try {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decodificar el token
        console.log("🔹 Datos del usuario decodificado:", decoded); 

        const rol = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        let aeropuerto = decoded["Aeropuerto"];
        const tip = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const nombre = decoded["Nombre"];
        let apellido1 = decodeURIComponent(escape(decoded["Apellido1"])).normalize("NFC").trim();
        let apellido2 = decodeURIComponent(escape(decoded["Apellido2"])).normalize("NFC").trim();
        
        // ✅ Aplicar normalización y decodificación correcta del aeropuerto
        aeropuerto = decodeURIComponent(escape(aeropuerto)).normalize("NFC").trim();

        console.log(`✅ Aeropuerto decodificado correctamente: ${aeropuerto}`);

        console.log("🔹 Rol extraído:", rol);

        const paginaActual = window.location.pathname.split("/").pop();

        const paginasSoloAdmin = ["administrar.html", "reporte-servicio.html"];

        if (paginasSoloAdmin.includes(paginaActual) && rol !== "Administrador") {
            alert("🚫 No tienes permisos para acceder a esta página.");
            window.location.href = "parte-servicio.html";
        }
        
        // ✅ ASIGNAR EL AEROPUERTO AL ENCABEZADO Y FORMULARIOS
        document.getElementById("header-text").textContent = aeropuerto;

        /*const setAeropuertoValue = (id) => {
            const selectElement = document.getElementById(id);
            if (selectElement) {
                selectElement.value = aeropuerto;
                selectElement.setAttribute("readonly", true);
            }
        };*/

        const setAeropuertoValue = (id) => {
            const selectElement = document.getElementById(id);
            if (selectElement) {
              // Limpiar opciones existentes
              selectElement.innerHTML = "";
          
              // Crear una opción con el aeropuerto del token
              const option = document.createElement("option");
              option.value = aeropuerto;
              option.textContent = aeropuerto;
              option.selected = true;
          
              selectElement.appendChild(option);
              selectElement.disabled = true;
            }
          };
          
        
        if (paginaActual === "parte-servicio.html") {
            setAeropuertoValue("aeropuerto");
            document.getElementById("nombre-vigilante").value = nombre;
            document.getElementById("apellido1").value = apellido1;
            document.getElementById("apellido2").value = apellido2;
            document.getElementById("tip").value = tip;
            document.getElementById("label-nombre-vigilante").textContent = nombre;

            document.getElementById("nombre-vigilante").setAttribute("readonly", true);
            document.getElementById("apellido1").setAttribute("readonly", true);
            document.getElementById("apellido2").setAttribute("readonly", true);
            document.getElementById("tip").setAttribute("readonly", true);
        }

        if (paginaActual === "administrar.html") {
            setAeropuertoValue("aeropuerto-incidencias");
            // Asignar el aeropuerto a los otros selects si existen
            setAeropuertoValue("aeropuerto-admin");
            setAeropuertoValue("aeropuerto-eliminar");
        }

        if (["patrullas-perimetro.html", "patrullas-otras-zonas.html", "parte-equipos.html", 
             "inspeccion-vehiculos.html", "inspeccion-suministros.html"]
            .includes(paginaActual)) {
            setAeropuertoValue("aeropuerto");
        }

        if (paginaActual === "parte-equipos.html") {
            setAeropuertoValue("aeropuerto");
            document.getElementById("nombre-vigilante").value = nombre;
            document.getElementById("nombre-vigilante").setAttribute("readonly", true);
        }

        if (paginaActual === "reporte-servicio.html") {
            setAeropuertoValue("aeropuerto");
            document.getElementById("nombre-vigilante").value = nombre;

            document.getElementById("nombre-vigilante").setAttribute("readonly", true);
        }


        // ✅ DETECTAR CAMBIO DE PESTAÑA Y ACTUALIZAR EL AEROPUERTO EN "ELIMINAR USUARIO"
        document.querySelectorAll(".tab-button").forEach(button => {
            button.addEventListener("click", function () {
                const tab = this.getAttribute("data-tab");

                if (tab === "eliminar") {
                    setTimeout(() => { 
                        const selectEliminar = document.querySelector("#eliminar select#aeropuerto");
                        if (selectEliminar) {
                            selectEliminar.value = aeropuerto;
                        }
                    }, 100);
                }
            });
        });

    } catch (error) {
        console.error("❌ Error al procesar el token:", error);
        sessionStorage.removeItem("token");
        window.location.href = "index.html";
    }

    // ✅ LÓGICA DE CIERRE DE SESIÓN
    const logoutLink = document.getElementById("logout");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault(); 
            sessionStorage.clear();
            document.cookie = "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "index.html";
        });
    }
});
