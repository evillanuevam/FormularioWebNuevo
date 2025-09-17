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

        //**********************agregando para bloquear paginas*****************/

        const paginasSoloAdmin = [
            "adm-parte-servicio.html",
            "adm-usuarios.html",
            "adm-parte-patrullas.html",
            "reporte-parte-servicios.html",
            "reporte-incidencias.html"
        ];
        
        const esAdmin = rol === "Administrador";

        // Si el usuario no es admin y está intentando entrar a una página restringida(tipeando)
        if (paginasSoloAdmin.includes(paginaActual) && !esAdmin) {
            alert("🚫 No tienes permisos para acceder a esta página.");
            window.location.href = "parte-servicio.html"; // o a otra página segura
            return;
        }


        // 🔒 Desactivar accesos a enlaces individuales
        document.querySelectorAll("a[href$='.html']").forEach(link => {
            const href = link.getAttribute("href");
            if (paginasSoloAdmin.includes(href) && !esAdmin) {
                link.style.pointerEvents = "none";
                link.style.opacity = "0.5";
                link.style.cursor = "not-allowed";
                link.setAttribute("title", "Acceso restringido");
            }
        });
        
        // 🔒 Desactivar secciones enteras si contienen solo enlaces restringidos
        document.querySelectorAll(".submenu").forEach(submenu => {
            const toggle = submenu.querySelector(".submenu-toggle");
            const enlacesInternos = submenu.querySelectorAll(".submenu-content a");
        
            // Verifica si TODOS los enlaces dentro son páginas restringidas
            const todosRestringidos = [...enlacesInternos].every(enlace =>
                paginasSoloAdmin.includes(enlace.getAttribute("href"))
            );
        
            if (!esAdmin && todosRestringidos && toggle) {
                toggle.style.pointerEvents = "none";
                toggle.style.opacity = "0.5";
                toggle.style.cursor = "not-allowed";
                toggle.setAttribute("title", "Acceso restringido");
        
                const contenido = submenu.querySelector(".submenu-content");
                if (contenido) contenido.style.display = "none";
            }
        });
    
        // ✅ ASIGNAR EL AEROPUERTO AL ENCABEZADO Y FORMULARIOS
        document.getElementById("header-text").textContent = aeropuerto;

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

            document.getElementById("nombre-vigilante").setAttribute("readonly", true);
            document.getElementById("apellido1").setAttribute("readonly", true);
            document.getElementById("apellido2").setAttribute("readonly", true);
            document.getElementById("tip").setAttribute("readonly", true);
        }

        if (paginaActual === "adm-parte-servicio.html","adm-usuarios.html","adm-parte-patrullas.html","adm-gestionar-planos") {
            // Adm. Parte de servicio 
            setAeropuertoValue("aeropuerto-incidencias");
            setAeropuertoValue("aeropuerto-puestos");
            setAeropuertoValue("aeropuerto-proveedores");
            // Adm. Usuarios
            setAeropuertoValue("aeropuerto-admin");
            setAeropuertoValue("aeropuerto-eliminar");
            // Adm. Parte de patrullas
            setAeropuertoValue("aeropuerto-rondas");
            setAeropuertoValue("aeropuerto-fichajes");
            setAeropuertoValue("aeropuerto-puertas");
            // Gestionar planos perimetro
            setAeropuertoValue("aeropuerto-perimetro");
            // Gestionar planos de otras zonas
            setAeropuertoValue("aeropuerto-otras-zonas");
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

        if (paginaActual === "reporte-parte-servicios.html") {
            setAeropuertoValue("aeropuerto");
            document.getElementById("nombre-vigilante").value = nombre;

            document.getElementById("nombre-vigilante").setAttribute("readonly", true);
        }

        if (paginaActual === "reporte-incidencias.html") {
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

// ✅ Obtener datos del usuario desde el token y normalizar caracteres especiales(para todas las páginas)
function obtenerUsuarioDatos() {
    const token = sessionStorage.getItem("token");
    if (!token) {
        console.error("❌ No hay token en sessionStorage.");
        return {};
    }
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log("🔹 Token decodificado:", decoded);
        
        let aeropuertoNormalizado = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();
        
        let tipNormalizado = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"].trim();

        return {
            tip: tipNormalizado,
            aeropuerto: aeropuertoNormalizado,
            nombre: decoded["Nombre"],
            apellido1: decoded["Apellido1"],
            apellido2: decoded["Apellido2"],
            rol: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        };
    } catch (error) {
        console.error("❌ Error al decodificar el token:", error);
        return {};
    }
}