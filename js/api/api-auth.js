const API_URL = window.CONFIG.API_BASE_URL; // Obtener la URL de la API

function mostrarMensaje(elemento, mensaje, color) {
    if (!elemento) return;
    elemento.innerText = mensaje;
    elemento.style.display = "block";
    elemento.style.color = color; 

    // 🔹 Limpiar el mensaje después de 5 segundos
    setTimeout(() => { elemento.style.display = "none"; }, 5000);
}

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const mensajeLogin = document.getElementById("mensaje-login");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
        
            const aeropuerto = document.querySelector("#login-form select").value;
            const tip = document.querySelector("#login-form input[type='text']").value.trim();
        
            if (!aeropuerto || !tip) {
                mostrarMensaje(mensajeLogin, "⚠️ Por favor, ingrese todos los campos.", "red");
                return;
            }
        
            const loginData = { aeropuerto, tip };
        
            try {
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData)
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    console.log("✅ Login exitoso:", data);
                    mostrarMensaje(mensajeLogin, "✅ Inicio de sesión exitoso.", "green");
                    sessionStorage.setItem("token", data.token);
                    setTimeout(() => { window.location.href = "parte-servicio.html"; }, 1000);
                } else {
                    mostrarMensaje(mensajeLogin, "❌ Credenciales incorrectas.", "red");
                }
            } catch (error) {
                console.error("❌ Error en la solicitud de login:", error);
                mostrarMensaje(mensajeLogin, "❌ No se pudo conectar con el servidor.", "red");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const mensajeLogin = document.getElementById("mensaje-login");
    const registerForm = document.getElementById("register-form");
    const mensajeRegistro = document.getElementById("mensaje-registro");
    const tipInput = document.getElementById("tip");
    const rolInput = document.getElementById("rol-login");
    const aeropuertoSelect = document.getElementById("aeropuerto");
    const registerButton = document.getElementById("registerButton");

    //LOGICA PARA INICIAR SESION e dirigir a parte de servicio
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Evitar que la página se recargue
        
            const aeropuerto = document.querySelector("#login-form select").value;
            const tip = document.querySelector("#login-form input[type='text']").value.trim();
        
            if (!aeropuerto || !tip) {
                mostrarMensaje(mensajeLogin, "⚠️ Por favor, ingrese todos los campos.", "red");
                return;
            }
        
            const loginData = { aeropuerto, tip };
        
            try {
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData)
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    console.log("✅ Login exitoso:", data);
                    mostrarMensaje(mensajeLogin, "✅ Inicio de sesión exitoso.", "green");

                    // Usar sessionStorage para mas seguridad (cockies seguras en el back)
                    sessionStorage.setItem("token", data.token);
                    sessionStorage.setItem("tip", loginData.tip);
                    sessionStorage.setItem("aeropuerto", loginData.aeropuerto);
                    sessionStorage.setItem("rol", data.rol); // Asegúrate de que el backend devuelva el rol

                    setTimeout(() => { window.location.href = "parte-servicio.html"; }, 1000); //redirigir despues de 2seg de momentos

                } else {
                    mostrarMensaje(mensajeLogin, "❌ Credenciales incorrectas.", "red");
                }
            } catch (error) {
                console.error("❌ Error en la solicitud de login:", error);
                mostrarMensaje(mensajeLogin, "❌ No se pudo conectar con el servidor.", "red");
            }
        });

    }

    //LOGICA PARA REGISTRARSE
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Evitar que la página se recargue
        
            const aeropuerto = document.querySelector("#register-form select[title='Seleccione un Aeropuerto']").value;
            const nombre = document.querySelector("#register-form input[placeholder='Nombre']").value.trim();
            const apellido1 = document.querySelector("#register-form input[placeholder='Apellido 1']").value.trim();
            const apellido2 = document.querySelector("#register-form input[placeholder='Apellido 2']").value.trim();
            const tip = document.querySelector("#register-form input[placeholder='TIP']").value.trim();
            //const rol = "Vigilante";
            const rol = document.querySelector("#register-form select#rol-login").value;
        
            if (!aeropuerto || !nombre || !apellido1 || !apellido2 || !tip) {
                mostrarMensaje(mensajeRegistro, "⚠️ Por favor, complete todos los campos.", "red");
                return;
            }
        
            const registerData = { aeropuerto, nombre, apellido1, apellido2, tip, rol };
        
            try {
                const response = await fetch(`${API_URL}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(registerData)
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    console.log("✅ Registro exitoso:", data);
                    mostrarMensaje(mensajeRegistro, "✅ Registro exitoso. Ahora puedes iniciar sesión.", "green");
                    setTimeout(() => { registerForm.reset(); }, 2000);
                } else {
                    // Mostrar el mensaje de error que devuelva el backend
                    mostrarMensaje(mensajeRegistro, "❌ " + (data.message || "No se pudo completar el registro."), "red");
                }
            } catch (error) {
                console.error("❌ Error en la solicitud de registro:", error);
                mostrarMensaje(mensajeRegistro, "❌ No se pudo conectar con el servidor.", "red");
            }
        });
        setTimeout(() => { registerButton.disabled = false; }, 2000); // Habilitar el botón después de 2 segundos
    }

    //mostrar el rol del TIP ingresado en el login
    if (tipInput) {
        tipInput.addEventListener("input", async function () {
            const tip = tipInput.value.trim();
            const aeropuerto = aeropuertoSelect.value;

            if (tip.length === 6 && aeropuerto) { // Solo buscar cuando el TIP tenga 6 dígitos y haya un aeropuerto seleccionado
                try {
                    const response = await fetch(`${API_URL}/api/auth/get-role?tip=${tip}&aeropuerto=${encodeURIComponent(aeropuerto)}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        rolInput.value = data.rol; // Actualizar el campo de rol
                    } else {
                        rolInput.value = "No encontrado"; // Mostrar si no existe
                    }
                } catch (error) {
                    console.error("❌ Error al obtener el rol:", error);
                    rolInput.value = "Error";
                }
            } else {
                rolInput.value = "Rol"; // Valor predeterminado si el TIP es inválido o no hay aeropuerto seleccionado
            }
        });
    }
});
