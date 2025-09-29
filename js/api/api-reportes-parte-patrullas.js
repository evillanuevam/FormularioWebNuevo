
//funcionalidad para intercalar las pestañas inspeccion de fichaje y inspecciones de Puertas en el reporte de patrulas.
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


// ====== CONFIG BASICA ======
const API_URL = window.CONFIG?.API_BASE_URL || "";
if (!API_URL) console.error("CONFIG.API_BASE_URL no definido. Revisa utils/config-api-url.js");

const token = sessionStorage.getItem("token") || "";
const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

// Endpoints
const EP_RONDAS        = `${API_URL}/api/Administrar/leer-rondas`;
const EP_CATEGORIAS    = `${API_URL}/api/Administrar/leer-categorias-patrullas`;
const EP_SUBCATEGORIAS = `${API_URL}/api/Administrar/leer-subcategorias-patrulla`;

const EP_REP_FICHAJES  = `${API_URL}/api/ReportesPatrullas/leer-fichajes`;
const EP_REP_PUERTAS   = `${API_URL}/api/ReportesPatrullas/leer-puertas`;

// ====== HELPERS ======
const unwrap = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.$values) return data.$values;
  for (const k of Object.keys(data)) {
    if (data[k]?.$values) return data[k].$values;
  }
  return [];
};

function obtenerFiltros() {
  const aeropuerto   = document.getElementById("aeropuerto")?.value || "";
  const usuario      = document.getElementById("nombre-vigilante")?.value || "";
  const fecha        = document.getElementById("fechaSeleccionada")?.value || "";
  const ronda        = document.getElementById("ronda")?.value || "";
  const categoria    = document.getElementById("categoria")?.value || "";
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

// ====== INICIAL: hidratar usuario/aeropuerto ======
async function hidratarCabeceraDesdeToken() {
  try {
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

// ====== CARGA DE COMBOS ======
async function cargarRondas() {
  const sel = document.getElementById("ronda");
  if (!sel) return;
  sel.innerHTML = `<option value="">Todas</option>`;
  try {
    const { aeropuerto } = obtenerFiltros();
    const res = await fetch(`${EP_RONDAS}?aeropuerto=${encodeURIComponent(aeropuerto)}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = unwrap(await res.json());
    data.forEach(r => {
      const nombre = r?.descripcion || r?.nombre || r?.ronda || r;
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
    const { aeropuerto } = obtenerFiltros();
    const res = await fetch(`${EP_CATEGORIAS}?aeropuerto=${encodeURIComponent(aeropuerto)}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = unwrap(await res.json());
    data.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c?.id ?? "";
      opt.textContent = c?.nombreCategoria ?? "";
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
  if (!catId) return;

  try {
    const res = await fetch(`${EP_SUBCATEGORIAS}/${catId}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = unwrap(await res.json());
    data.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s?.id ?? "";
      opt.textContent = s?.nombreSubcategoria ?? "";
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error("Error cargando subcategorias:", e);
  }
}

// ====== CARGA DE TABLAS ======
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
    const vista = unwrap(payload?.vista ?? payload);
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
  await cargarSubcategorias();

  // cambios de filtros -> recargar pestaña activa
  ["fechaSeleccionada","ronda","categoria","subcategoria"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", async () => {
      if (id === "categoria") await cargarSubcategorias();
      recargarPestanaActiva();
    });
  });

  // carga inicial
  recargarPestanaActiva();
});

// ==================== PARA EXPORTAR EXCEL Y PDF DESDE EL BACKEND ================================

async function exportarVista(tipo) {
    const f = obtenerFiltros();
    if (!f.fecha) {
        alert("Seleccione una fecha antes de exportar");
        return;
    }

    const url = `${API_URL}/api/ReportesPatrullas/exportar-vista?tipo=${tipo}&fecha=${f.fecha}&aeropuerto=${encodeURIComponent(f.aeropuerto)}&ronda=${encodeURIComponent(f.ronda)}&categoriaId=${f.categoria}&subcategoriaId=${f.subcategoria}`;
    await descargarArchivo(url, `Reporte_${tipo}_vista.xlsx`);
}

// 🔹 COMPLETOS POR TABLA
async function exportarCompletoFichajes() {
    const f = obtenerFiltros();
    if (!f.fecha) {
        alert("Seleccione una fecha antes de exportar");
        return;
    }

    const url = `${API_URL}/api/ReportesPatrullas/exportar-completo-fichajes?fecha=${f.fecha}&aeropuerto=${encodeURIComponent(f.aeropuerto)}&ronda=${encodeURIComponent(f.ronda)}&categoriaId=${f.categoria}&subcategoriaId=${f.subcategoria}`;
    await descargarArchivo(url, `Reporte_fichajes_completo.xlsx`);
}

async function exportarCompletoPuertas() {
    const f = obtenerFiltros();
    if (!f.fecha) {
        alert("Seleccione una fecha antes de exportar");
        return;
    }

    const url = `${API_URL}/api/ReportesPatrullas/exportar-completo-puertas?fecha=${f.fecha}&aeropuerto=${encodeURIComponent(f.aeropuerto)}&ronda=${encodeURIComponent(f.ronda)}&categoriaId=${f.categoria}&subcategoriaId=${f.subcategoria}`;
    await descargarArchivo(url, `Reporte_puertas_completo.xlsx`);
}

// 🔹 PDF
async function exportarPdf(tipo) {
    const f = obtenerFiltros();
    if (!f.fecha) {
        alert("Seleccione una fecha antes de exportar");
        return;
    }

    const url = `${API_URL}/api/ReportesPatrullas/exportar-pdf?tipo=${tipo}&fecha=${f.fecha}&aeropuerto=${encodeURIComponent(f.aeropuerto)}&ronda=${encodeURIComponent(f.ronda)}&categoriaId=${f.categoria}&subcategoriaId=${f.subcategoria}`;
    await descargarArchivo(url, `Reporte_${tipo}.pdf`);
}

// 🔹 Helper común para descargar archivos binarios
async function descargarArchivo(url, nombreArchivo) {
    try {
        const res = await fetch(url, { headers: authHeaders });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (e) {
        console.error("Error exportando archivo:", e);
        alert("❌ Error al exportar el archivo");
    }
}

// ========== EXPORTACIONES FICHAJES ==========
async function exportarVistaFichajes() {
    await exportarVista("fichajes");
}
async function exportarPdfFichajes() {
    await exportarPdf("fichajes");
}

// ========== EXPORTACIONES PUERTAS ==========
async function exportarVistaPuertas() {
    await exportarVista("puertas");
}
async function exportarPdfPuertas() {
    await exportarPdf("puertas");
}
