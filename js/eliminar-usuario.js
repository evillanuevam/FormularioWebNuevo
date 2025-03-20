document.addEventListener("DOMContentLoaded", function () {
    // Base de datos simulada de usuarios con datos completos
    let usuarios = [
        { tip: "12345", nombre: "Juan", apellidos: "Pérez", numAcreditacion: "A001", colorAcreditacion: "Rojo", rol: "Vigilante", aeropuerto: "MAD - Madrid-Barajas" },
        { tip: "67890", nombre: "Ana", apellidos: "López", numAcreditacion: "A002", colorAcreditacion: "Azul", rol: "Supervisor", aeropuerto: "MAD - Madrid-Barajas" },
        { tip: "11223", nombre: "Carlos", apellidos: "Sánchez", numAcreditacion: "A003", colorAcreditacion: "Verde", rol: "Seguridad", aeropuerto: "BCN - Barcelona-El Prat" },
        { tip: "33445", nombre: "María", apellidos: "García", numAcreditacion: "A004", colorAcreditacion: "Amarillo", rol: "Operador", aeropuerto: "BCN - Barcelona-El Prat" },
    ];

    const aeropuertoSelect = document.querySelector("#eliminar select#aeropuerto");
    const listaUsuarios = document.getElementById("lista-usuarios");
    const inputBuscarTIP = document.getElementById("buscar-tip");

    // 🔹 Función para mostrar usuarios según el aeropuerto seleccionado
    function cargarUsuarios() {
        const aeropuertoSeleccionado = aeropuertoSelect.value;
        if (!aeropuertoSeleccionado) return;

        console.log("Cargando usuarios para:", aeropuertoSeleccionado);
        listaUsuarios.innerHTML = ""; // Limpiar tabla antes de cargar nuevos datos

        const usuariosFiltrados = usuarios.filter(usuario => usuario.aeropuerto === aeropuertoSeleccionado);

        if (usuariosFiltrados.length === 0) {
            listaUsuarios.innerHTML = `<tr><td colspan="7" style="text-align: center;">No hay usuarios para este aeropuerto</td></tr>`;
            return;
        }

        usuariosFiltrados.forEach(usuario => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${usuario.tip}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellidos}</td>
                <td>${usuario.numAcreditacion}</td>
                <td>${usuario.colorAcreditacion}</td>
                <td>${usuario.rol}</td>
                <td>
                    <button class="btn-eliminar" data-tip="${usuario.tip}">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            `;
            listaUsuarios.appendChild(row);
        });

        agregarEventosEliminar();
    }

    // 🔹 Evento para eliminar usuario
    function agregarEventosEliminar() {
        document.querySelectorAll(".btn-eliminar").forEach(button => {
            button.addEventListener("click", function (event) {
                const tip = event.target.closest("button").dataset.tip;
                usuarios = usuarios.filter(usuario => usuario.tip !== tip);
                cargarUsuarios();
                console.log(`Usuario con TIP ${tip} eliminado.`);
            });
        });
    }

    // 🔹 Función para filtrar por TIP al presionar Enter
    function filtrarPorTIP(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const tipIngresado = inputBuscarTIP.value.trim().toLowerCase();

            document.querySelectorAll("#lista-usuarios tr").forEach(row => {
                const tip = row.children[0]?.textContent.toLowerCase();
                row.style.display = (tip && tip.includes(tipIngresado)) || tipIngresado === "" ? "" : "none";
            });
        }
    }

    // 🔹 Agregar eventos para que todo funcione
    aeropuertoSelect.addEventListener("change", cargarUsuarios);
    inputBuscarTIP.addEventListener("keydown", filtrarPorTIP);

    // 🔹 Cargar automáticamente si hay un aeropuerto seleccionado
    if (aeropuertoSelect.value) {
        cargarUsuarios();
    }
});
