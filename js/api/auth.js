// auth.js optimizado

let usuarioActual = null; // guardamos el token decodificado una sola vez

document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("🔒 Debes iniciar sesión primero.");
        window.location.href = "index.html";
        return;
    }

    try {
        // ✅ decodificar una sola vez
        usuarioActual = JSON.parse(atob(token.split('.')[1]));
        console.log("🔹 Datos del usuario decodificado:", usuarioActual);

        const rol = usuarioActual["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        let aeropuerto = decodeURIComponent(escape(usuarioActual["Aeropuerto"])).normalize("NFC").trim();

        console.log(`✅ Aeropuerto decodificado correctamente: ${aeropuerto}`);
        console.log("🔹 Rol extraído:", rol);

        const paginaActual = window.location.pathname.split("/").pop();
        const esAdmin = rol === "Administrador";

        // ------------------ BLOQUEO DE PAGINAS SOLO ADMIN ------------------
        const paginasSoloAdmin = [
            "adm-parte-servicio.html",
            "adm-usuarios.html",
            "adm-parte-patrullas.html",
            "reporte-parte-servicios.html",
            "reporte-incidencias.html"
        ];

        if (paginasSoloAdmin.includes(paginaActual) && !esAdmin) {
            alert("🚫 No tienes permisos para acceder a esta página.");
            window.location.href = "parte-servicio.html";
            return;
        }

        // ------------------ BLOQUEO DE ENLACES ------------------
        document.querySelectorAll("a[href$='.html']").forEach(link => {
            const href = link.getAttribute("href");
            if (paginasSoloAdmin.includes(href) && !esAdmin) {
                link.style.pointerEvents = "none";
                link.style.opacity = "0.5";
                link.style.cursor = "not-allowed";
                link.setAttribute("title", "Acceso restringido");
            }
        });

        // ------------------ BLOQUEO DE SUBMENUS ------------------
        document.querySelectorAll(".submenu").forEach(submenu => {
            const toggle = submenu.querySelector(".submenu-toggle");
            const enlacesInternos = submenu.querySelectorAll(".submenu-content a");

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

        // ------------------ ASIGNAR AEROPUERTO AL HEADER ------------------
        document.getElementById("header-text").textContent = aeropuerto;

        // funcion auxiliar
        const setAeropuertoValue = (id) => {
            const selectElement = document.getElementById(id);
            if (selectElement) {
                selectElement.innerHTML = "";
                const option = document.createElement("option");
                option.value = aeropuerto;
                option.textContent = aeropuerto;
                option.selected = true;
                selectElement.appendChild(option);
                selectElement.disabled = true;
            }
        };

        // ------------------ ASIGNAR A LOS FORMULARIOS SEGUN PAGINA (que se visualice aeropuerto, usuario, etc) ------------------
        if (paginaActual === "parte-servicio.html") {
            setAeropuertoValue("aeropuerto");
            document.getElementById("nombre-vigilante").value = usuarioActual["Nombre"];
            document.getElementById("apellido1").value = usuarioActual["Apellido1"];
            document.getElementById("apellido2").value = usuarioActual["Apellido2"];
            document.getElementById("tip").value = usuarioActual["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            ["nombre-vigilante", "apellido1", "apellido2", "tip"].forEach(id =>
                document.getElementById(id).setAttribute("readonly", true)
            );
        }

        if (["adm-parte-servicio.html", "adm-usuarios.html", "adm-parte-patrullas.html", "adm-gestionar-planos.html"].includes(paginaActual)) {
            setAeropuertoValue("aeropuerto-incidencias");
            setAeropuertoValue("aeropuerto-puestos");
            setAeropuertoValue("aeropuerto-proveedores");
            setAeropuertoValue("aeropuerto-admin");
            setAeropuertoValue("aeropuerto-eliminar");
            setAeropuertoValue("aeropuerto-rondas");
            setAeropuertoValue("aeropuerto-fichajes");
            setAeropuertoValue("aeropuerto-puertas");
            setAeropuertoValue("aeropuerto-perimetro");
            setAeropuertoValue("aeropuerto-otras-zonas");
            setAeropuertoValue("aeropuerto-categorias-patrullas");
        }

        if (["patrullas-perimetro.html", "patrullas-otras-zonas.html", "parte-equipos.html",
             "inspeccion-vehiculos.html", "inspeccion-suministros.html"].includes(paginaActual)) {
            setAeropuertoValue("aeropuerto");
        }

        if (paginaActual === "parte-equipos.html") {
            setAeropuertoValue("aeropuerto");
            document.getElementById("nombre-vigilante").value = usuarioActual["Nombre"];
            document.getElementById("nombre-vigilante").setAttribute("readonly", true);
        }

        if (paginaActual === "reporte-parte-servicios.html" || paginaActual === "reporte-incidencias.html" || paginaActual === "reporte-parte-patrullas.html") {
            setAeropuertoValue("aeropuerto");
            document.getElementById("nombre-vigilante").value = usuarioActual["Nombre"];
            document.getElementById("nombre-vigilante").setAttribute("readonly", true);
        }

        // ------------------ PESTAÑA ELIMINAR USUARIO ------------------
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

    // ------------------ LOGOUT ------------------
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

// ✅ Obtener datos del usuario ya decodificados (sin duplicar)
function obtenerUsuarioDatos() {
    if (!usuarioActual) {
        console.error("❌ No hay usuarioActual (token no cargado).");
        return {};
    }

    return {
        tip: usuarioActual["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"].trim(),
        aeropuerto: decodeURIComponent(escape(usuarioActual["Aeropuerto"])).normalize("NFC").trim(),
        nombre: usuarioActual["Nombre"],
        apellido1: usuarioActual["Apellido1"],
        apellido2: usuarioActual["Apellido2"],
        rol: usuarioActual["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    };
}
