// ✅ utils/validaciones-globales.js

// Capitalizar frases (primera letra de cada oración)
function capitalizarFrase(texto) {
    if (!texto) return texto;
    texto = texto.toLowerCase();
    let resultado = "";
    let inicioOracion = true;

    for (let i = 0; i < texto.length; i++) {
        if (inicioOracion && texto[i].match(/[a-zA-Z]/)) {
            resultado += texto[i].toUpperCase();
            inicioOracion = false;
        } else {
            resultado += texto[i];
        }

        if (".!?".includes(texto[i])) inicioOracion = true;
    }
    return resultado;
}

// Capitalizar automáticamente la primera letra en un input
function capitalizarInput(input) {
    input.addEventListener("input", function () {
        const texto = input.value.trim();
        if (texto.length > 0) {
            input.value = texto.charAt(0).toUpperCase() + texto.slice(1);
        }
    });
}

// Solo letras (sin números ni símbolos)
function soloLetras(input) {
    input.addEventListener("input", function () {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    });
}

// Obtener datos del usuario desde el token
function obtenerUsuarioDatos() {
    const token = sessionStorage.getItem("token");
    if (!token) return {};
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();
        const tip = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        return {
            tip: tip?.trim(),
            aeropuerto,
            nombre: decoded["Nombre"],
            apellido1: decoded["Apellido1"],
            apellido2: decoded["Apellido2"]
        };
    } catch (error) {
        console.error("❌ Error al decodificar el token:", error);
        return {};
    }
}

function aplicarCapitalizacionAutomatica() {
    const elementos = document.querySelectorAll("textarea, input[type='text']");

    elementos.forEach(elemento => {
        elemento.addEventListener("input", function () {
            const pos = this.selectionStart;
            this.value = capitalizarFrase(this.value);
            this.setSelectionRange(pos, pos);
        });
    });
}

function aplicarSoloLetrasAutomatico() {
    const inputs = document.querySelectorAll("input.solo-letras");

    inputs.forEach(input => {
        soloLetras(input);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    aplicarCapitalizacionAutomatica();
    aplicarSoloLetrasAutomatico();
});


