const API_URL = window.CONFIG.API_BASE_URL;
const token = sessionStorage.getItem("token");
const decoded = JSON.parse(atob(token.split(".")[1]));
const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();

// ✅ api/api-parte-patrullas.js (modificado sin export)
window.apiPatrullas = (() => {
    const API_URL = window.CONFIG.API_BASE_URL;
    const token = sessionStorage.getItem("token");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const aeropuerto = decodeURIComponent(escape(decoded["Aeropuerto"])).normalize("NFC").trim();

    async function cargarRondas() {
        try {
            const res = await fetch(`${API_URL}/api/Administrar/leer-rondas?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            const select = document.getElementById("rondas");

            select.innerHTML = `<option value="" disabled selected>Seleccione una Ronda</option>`;
            (data.$values || data || []).forEach(r => {
                const option = document.createElement("option");
                option.value = r.descripcion;
                option.textContent = r.descripcion;
                select.appendChild(option);
            });
        } catch (err) {
            console.error("❌ Error al cargar rondas:", err);
        }
    }

    async function cargarPuntosFichaje() {
        try {
            const res = await fetch(`${API_URL}/api/Administrar/leer-fichajes?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            const tbody = document.querySelector("#tabla-inspeccion tbody");
            tbody.innerHTML = "";

            const estados = [
                "Seleccione...","Correcto", "Deteriorado", "Agujereado", "No anclado",
                "Objetos junto al vallado (ZT/ZC)", "Vegetación abundante (ZT/ZC)",
                "Anomalías en las puertas", "Mal estado de basamento",
                "Cámara de seguridad", "Acumulación de plásticos/papel/basura",
                "Cartel", "Otros"
            ];

            (data.$values || []).forEach(p => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${p.descripcion}</td>
                    <td><input type="time"></td>
                    <td>
                        <select>
                            ${estados.map(e => `<option value="${e}">${e}</option>`).join("")}
                        </select>
                    </td>
                    <td><textarea placeholder="Ingrese observaciones"></textarea></td>
                    <td class="celda-coordenadas"></td> <!-- ✅ Nueva columna para mostrar coordenadas -->
                `;
                tbody.appendChild(fila);
            });
        } catch (err) {
            console.error("❌ Error al cargar puntos de fichaje:", err);
        }
    }

    async function cargarPuertasPerimetro() {
        try {
            const res = await fetch(`${API_URL}/api/Administrar/leer-puertas?aeropuerto=${encodeURIComponent(aeropuerto)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            const tbody = document.querySelector("#tabla-puertas tbody");
            tbody.innerHTML = "";

            (data.$values || []).forEach((p, i) => {
                const fila = document.createElement("tr");
                const radioGroup = name => `
                    <div class="radio-group">
                        <input type="radio" name="${name}" value="ok" id="${name}-ok">
                        <label for="${name}-ok">✅</label>
                        <input type="radio" name="${name}" value="nok" id="${name}-nok">
                        <label for="${name}-nok">❌</label>
                    </div>
                `;

                fila.innerHTML = `
                    <td>${p.identificador}</td>
                    <td>${radioGroup(`estado-${i}`)}</td>
                    <td>${radioGroup(`apertura-${i}`)}</td>
                    <td>
                        <select>
                            <option value="">Seleccione...</option>
                            <option>Electrónico</option>
                            <option>Mecánico</option>
                        </select>
                    </td>
                    <td>${radioGroup(`apertura-c-${i}`)}</td>
                    <td>${radioGroup(`estado-c-${i}`)}</td>
                    <td><textarea placeholder="Ingrese observaciones"></textarea></td>
                `;
                tbody.appendChild(fila);
            });
        } catch (err) {
            console.error("❌ Error al cargar puertas:", err);
        }
    }

    return {
        cargarRondas,
        cargarPuntosFichaje,
        cargarPuertasPerimetro
    };
})();


