// ✅ utils/validaciones-globales.js

// Capitalizar frases (primera letra de cada oración en mayuscula, tambien despues de un punto)
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

// Funcion para Limitar a solo números y máximo 6 dígitos (ej. para TIP) usado en el registro
function validarTIP(input) {
    input.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, ""); // Eliminar no números
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6); // Limitar a 6 dígitos
        }
    });
}

/*================================FUNCIONES AUTOMATICAS PARA APLICAR LAS VALIDACIONES =======================================*/


//para la capitalizacion en tex area en tiempo real, a todos los text Area
function aplicarCapitalizacionAutomatica() {
    const elementos = document.querySelectorAll("textarea");

    elementos.forEach(elemento => {
        elemento.addEventListener("input", function () {
            const pos = this.selectionStart;
            this.value = capitalizarFrase(this.value);
            this.setSelectionRange(pos, pos);
        });
    });
}

//para la capitalizacion solo letras en tiempo real (SOLO A INPUT QUE TENGAN LA CLASE "solo-letras")
function aplicarSoloLetrasAutomatico() {
    const inputs = document.querySelectorAll("input.solo-letras");

    inputs.forEach(input => {
        soloLetras(input);
    });
}

function aplicarValidacionTIP() {
    const inputs = document.querySelectorAll("input.validar-tip");

    inputs.forEach(input => {
        validarTIP(input);
    });
}

/*================================ LLAMAR O EJECUTAR LAS FUNCIONES AL CARGAR LA PAGINA ==============================*/

/** llamar las funciones necesarias para que se aplique al cargar la pagina **/
document.addEventListener("DOMContentLoaded", () => {
    aplicarCapitalizacionAutomatica();
    aplicarSoloLetrasAutomatico();
    aplicarValidacionTIP();
});


