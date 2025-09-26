// ====== CONFIG BASICA ======
const API_URL = window.CONFIG?.API_BASE_URL || "";
if (!API_URL) console.error("CONFIG.API_BASE_URL no definido. Revisa utils/config-api-url.js");

document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Quitar clase active de todos
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            // Activar el clicado
            button.classList.add("active");
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add("active");
        });
    });
});


const token = sessionStorage.getItem("token") || "";
const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

// Endpoints propuestos (ajusta si tus rutas son otras)
const EP_RONDAS        = `${API_URL}/api/Administrar/leer-rondas`;
const EP_CATEGORIAS    = `${API_URL}/api/Administrar/leer-categorias-patrullas`;
const EP_SUBCATEGORIAS = `${API_URL}/api/Administrar/leer-subcategorias-patrullas?categoriaId=`;

const EP_REP_FICHAJES  = `${API_URL}/api/ReportesPatrullas/leer-fichajes`;
const EP_REP_PUERTAS   = `${API_URL}/api/ReportesPatrullas/leer-puertas`;

// ====== HELPERS ======
const unwrap = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.$values) return data.$values;
  // a veces vienen envueltos en { items: { $values: [...] } }
  for (const k of Object.keys(data)) {
    if (data[k]?.$values) return data[k].$values;
  }
  return [];
};

function obtenerFiltros() {
  const aeropuerto = document.getElementById("aeropuerto")?.value || "";
  const usuario = document.getElementById("nombre-vigilante")?.value || "";
  const fecha = document.getElementById("fechaSeleccionada")?.value || "";
  const ronda = document.getElementById("ronda")?.value || "";
  const categoria = document.getElementById("categoria")?.value || "";
  const subcategoria = document.getElementById("subcategoria")?.value || "";
  return { aeropuerto, usuario, fecha, ronda, categoria, subcategoria };
}

function setTableMessage(tbodyId, colspan, mensaje) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;">${mensaje}</td></tr>`;
}

function recargarPestanaActiva() {
  const active = document.querySelector(".tab-button.active");
  if (!active) return;
  const tabId = active.dataset.tab;
  if (tabId === "fichajes") cargarFichajes();
  if (tabId === "puertas")  cargarPuertas();
}

// ====== INICIAL: hidratar usuario/aeropuerto y combos ======
async function hidratarCabeceraDesdeToken() {
  try {
    // requiere api/auth.js
    const datos = (typeof obtenerUsuarioDatos === "function") ? obtenerUsuarioDatos() : null;
    if (datos) {
      const { nombre, aeropuerto } = datos;
      const nombreInput = document.getElementById("nombre-vigilante");
      const aeroSelect  = document.getElementById("aeropuerto");
      if (nombreInput) nombreInput.value = nombre || "";
      if (aeroSelect) {
        aeroSelect.value = aeropuerto || aeroSelect.value;
        aeroSelect.disabled = true;
      }
    }
  } catch (e) {
    console.warn("No se pudo hidratar cabecera desde token:", e);
  }
}

async function cargarRondas() {
  const sel = document.getElementById("ronda");
  if (!sel) return;
  sel.innerHTML = `<option value="">Todas</option>`;
  try {
    const res = await fetch(EP_RONDAS, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = unwrap(await res.json());
    data.forEach(r => {
      const nombre = r?.nombre || r?.descripcion || r?.ronda || r;
      if (nombre) {
        const opt = document.createElement("option");
        opt.value = nombre;
        opt.textContent = nombre;
        sel.appendChild(opt);
      }
    });
  } catch (e) {
    console.error("Error cargando rondas:", e);
  }
}

async function cargarCategorias() {
  const sel = document.getElementById("categoria");
  if (!sel) return;
  sel.innerHTML = `<option value="">Todas</option>`;
  try {
    const res = await fetch(EP_CATEGORIAS, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = unwrap(await res.json());
    // Suponemos { id, nombre }
    data.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c?.id ?? "";
      opt.textContent = c?.nombre ?? "";
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error("Error cargando categorias:", e);
  }
}

async function cargarSubcategorias() {
  const catId = document.getElementById("categoria")?.value || "";
  const sel = document.getElementById("subcategoria");
  if (!sel) return;

  sel.innerHTML = `<option value="">Todas</option>`;
  if (!catId) return; // si no hay categoria, dejamos "Todas"

  try {
    const res = await fetch(`${EP_SUBCATEGORIAS}${encodeURIComponent(catId)}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = unwrap(await res.json());
    // Suponemos { id, nombre }
    data.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s?.id ?? "";
      opt.textContent = s?.nombre ?? "";
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error("Error cargando subcategorias:", e);
  }
}

// ====== CARGA DE TABLAS PREVIEW ======
async function cargarFichajes() {
  const f = obtenerFiltros();
  const tbodyId = "tabla-fichajes-body";

  if (!f.fecha) {
    setTableMessage(tbodyId, 4, "Seleccione una fecha");
    return;
  }

  try {
    const url = new URL(EP_REP_FICHAJES);
    url.searchParams.set("fecha", f.fecha);
    url.searchParams.set("aeropuerto", f.aeropuerto);
    if (f.ronda)        url.searchParams.set("ronda", f.ronda);
    if (f.categoria)    url.searchParams.set("categoriaId", f.categoria);
    if (f.subcategoria) url.searchParams.set("subcategoriaId", f.subcategoria);

    const res = await fetch(url.toString(), { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    const vista = unwrap(payload?.vista ?? payload); // por si devuelves { cabecera, vista, completo }
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    if (!vista.length) {
      setTableMessage(tbodyId, 4, "No hay datos disponibles");
      return;
    }

    vista.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.punto ?? "-"}</td>
        <td>${item.estado ?? item.estadoPunto ?? "-"}</td>
        <td>${item.observaciones ?? "-"}</td>
        <td>${item.ronda ?? "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Error cargando fichajes:", e);
    setTableMessage("tabla-fichajes-body", 4, "Error cargando datos");
  }
}

async function cargarPuertas() {
  const f = obtenerFiltros();
  const tbodyId = "tabla-puertas-body";

  if (!f.fecha) {
    setTableMessage(tbodyId, 6, "Seleccione una fecha");
    return;
  }

  try {
    const url = new URL(EP_REP_PUERTAS);
    url.searchParams.set("fecha", f.fecha);
    url.searchParams.set("aeropuerto", f.aeropuerto);
    if (f.ronda)        url.searchParams.set("ronda", f.ronda);
    if (f.categoria)    url.searchParams.set("categoriaId", f.categoria);
    if (f.subcategoria) url.searchParams.set("subcategoriaId", f.subcategoria);

    const res = await fetch(url.toString(), { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    const vista = unwrap(payload?.vista ?? payload);
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    if (!vista.length) {
      setTableMessage(tbodyId, 6, "No hay datos disponibles");
      return;
    }

    vista.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.puerta ?? item.identificadorPuerta ?? "-"}</td>
        <td>${item.estadoPuerta ?? item.estadoGeneralPuerta ?? "-"}</td>
        <td>${item.estadoCerradura ?? item.estadoGeneralCerradura ?? "-"}</td>
        <td>${item.tipoCerradura ?? "-"}</td>
        <td>${item.observaciones ?? "-"}</td>
        <td>${item.ronda ?? "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Error cargando puertas:", e);
    setTableMessage("tabla-puertas-body", 6, "Error cargando datos");
  }
}

// ====== EVENTOS ======
document.addEventListener("DOMContentLoaded", async () => {
  // tabs
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(content => content.classList.remove("active"));

      button.classList.add("active");
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add("active");

      recargarPestanaActiva();
    });
  });

  // hidratar cabecera y combos
  await hidratarCabeceraDesdeToken();
  await cargarRondas();
  await cargarCategorias();
  await cargarSubcategorias(); // empieza vacia: "Todas"

  // cambios de filtros -> recargar pestaña activa
  ["fechaSeleccionada","ronda","categoria","subcategoria"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", async () => {
      if (id === "categoria") await cargarSubcategorias(); // dependiente
      recargarPestanaActiva();
    });
  });

  // carga inicial en la pestaña por defecto
  recargarPestanaActiva();
});
