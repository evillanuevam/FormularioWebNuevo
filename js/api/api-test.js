const API_URL = window.CONFIG.API_BASE_URL; // Obtener la URL de la API

// 📌 Prueba de conexión con el backend
const API_BASE_URL = "https://localhost:7187/api/auth"; // 🔹 Reemplaza con la URL de tu backend si es necesario

async function testConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/test`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Error en la conexión: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Conexión exitosa con el backend:", data);
    } catch (error) {
        console.error("❌ Error al conectar con la API:", error);
    }
}

// Llamar a la prueba de conexión
testConnection();
