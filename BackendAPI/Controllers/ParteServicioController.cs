using BackendAPI.Data;
using BackendAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text; // Agregar este using
using System.Globalization;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParteServicioController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ParteServicioController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ✅ Función para capitalizar la primera letra de cada oración
        private string CapitalizarFrase(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return texto;

            char[] array = texto.ToLower().ToCharArray();
            bool inicioOracion = true;

            for (int i = 0; i < array.Length; i++)
            {
                if (inicioOracion && char.IsLetter(array[i]))
                {
                    array[i] = char.ToUpper(array[i]);
                    inicioOracion = false;
                }
                if (array[i] == '.' || array[i] == '!' || array[i] == '?')
                {
                    inicioOracion = true;
                }
            }

            return new string(array);
        }

        // ✅ 1. OBTENER EL FORMULARIO COMPLETO PARA EL USUARIO EN LA FECHA ACTUAL
        [HttpGet("GetParteServicio")]
        public async Task<IActionResult> GetParteServicio(string tip, string aeropuerto, string? fechaSeleccionada = null)
        {
            try
            {
                Console.WriteLine($"🔹 Buscando usuario con TIP: {tip}, Aeropuerto: {aeropuerto}, FechaSeleccionada: {fechaSeleccionada}");

                tip = tip.Trim();
                aeropuerto = aeropuerto.Trim().Normalize(NormalizationForm.FormC);

                var usuarios = await _context.Usuarios
                    .Where(u => u.TIP.Trim() == tip)
                    .ToListAsync();

                var usuario = usuarios.FirstOrDefault(u =>
                    u.Aeropuerto.Trim().Normalize(NormalizationForm.FormC) == aeropuerto);

                if (usuario == null)
                {
                    Console.WriteLine("❌ Usuario no encontrado en la base de datos.");
                    return NotFound("Usuario no encontrado.");
                }

                // 🔹 Convertir la fecha seleccionada a DateTime si existe, sino usar la actual
                DateTime fechaFiltrada = DateTime.UtcNow.Date;
                if (!string.IsNullOrEmpty(fechaSeleccionada))
                {
                    if (!DateTime.TryParseExact(fechaSeleccionada, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fechaFiltrada))
                    {
                        Console.WriteLine("❌ Error: Formato de fecha inválido.");
                        return BadRequest("Formato de fecha inválido. Use 'yyyy-MM-dd'.");
                    }
                }

                Console.WriteLine($"📆 Filtrando ParteServicio con FechaSeleccionada: {fechaFiltrada:yyyy-MM-dd}");

                // 🔹 Buscar el ParteServicio según la FechaSeleccionada
                var parte = await _context.ParteServicios
                    .Include(p => p.Descripciones)
                    .FirstOrDefaultAsync(p => p.UsuarioId == usuario.Id && p.FechaSeleccionada == fechaFiltrada);

                return Ok(new
                {
                    Usuario = usuario,
                    ParteServicio = parte != null ? new
                    {
                        parte.Id,
                        parte.FechaRegistro,
                        FechaSeleccionadaISO = parte.FechaSeleccionada.HasValue
                            ? parte.FechaSeleccionada.Value.ToString("yyyy-MM-dd")  // 🔹 Para el input "date"
                            : null,
                        FechaSeleccionadaFormato = parte.FechaSeleccionada.HasValue
                            ? parte.FechaSeleccionada.Value.ToString("dd/MM/yyyy") // 🔹 Para mostrar en el frontend
                            : null,
                        parte.HoraInicio,
                        parte.HoraFin,
                        parte.MaterialControlado,
                        parte.LeidoNormativa,
                        parte.AccidentesPuesto,
                        parte.UsuarioId
                    } : null,
                    Descripciones = parte?.Descripciones ?? new List<DescripcionServicio>()
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en GetParteServicio: {ex.Message}");
                return StatusCode(500, "Error interno del servidor.");
            }
        }



        // ✅ 2. GUARDAR UN NUEVO PARTE DE SERVICIO (USANDO FECHA SELECCIONADA)
        [HttpPost("GuardarParteServicio")]
        public async Task<IActionResult> GuardarParteServicio([FromBody] ParteServicio parteServicio)
        {
            if (parteServicio.Usuario == null)
                return BadRequest("El usuario es requerido en la solicitud.");

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TIP == parteServicio.Usuario.TIP && u.Aeropuerto == parteServicio.Usuario.Aeropuerto);

            if (usuario == null)
                return BadRequest("Usuario no encontrado.");

            parteServicio.UsuarioId = usuario.Id;
            parteServicio.Usuario = null; // Evitar que el objeto usuario se pase entero

            var fechaSeleccionada = parteServicio.FechaSeleccionada?.Date ?? DateTime.MinValue; // Asegurar solo la fecha sin la hora

            var parteExistente = await _context.ParteServicios
                .Include(p => p.Descripciones)
                .FirstOrDefaultAsync(p => p.UsuarioId == usuario.Id && p.FechaSeleccionada == fechaSeleccionada);

            if (parteExistente != null)
            {
                Console.WriteLine("🔄 ParteServicio encontrado, agregando nuevas descripciones.");

                foreach (var descripcion in parteServicio.Descripciones)
                {
                    descripcion.ParteServicioId = parteExistente.Id;
                    descripcion.UsuarioId = usuario.Id;

                    // 📝 Capitalizar los textos antes de guardar
                    descripcion.Descripcion = CapitalizarFrase(descripcion.Descripcion);
                    descripcion.AccionTomada = CapitalizarFrase(descripcion.AccionTomada);
                    descripcion.Observaciones = CapitalizarFrase(descripcion.Observaciones);

                    _context.DescripcionesServicio.Add(descripcion);
                }
            }
            else
            {
                Console.WriteLine("🆕 No se encontró ParteServicio en la fecha seleccionada, creando uno nuevo.");

                parteServicio.UsuarioId = usuario.Id;
                parteServicio.Usuario = null;
                parteServicio.FechaSeleccionada = fechaSeleccionada;

                foreach (var descripcion in parteServicio.Descripciones)
                {
                    descripcion.UsuarioId = usuario.Id;

                    // 📝 Capitalizar los textos antes de guardar
                    descripcion.Descripcion = CapitalizarFrase(descripcion.Descripcion);
                    descripcion.AccionTomada = CapitalizarFrase(descripcion.AccionTomada);
                    descripcion.Observaciones = CapitalizarFrase(descripcion.Observaciones);
                }

                _context.ParteServicios.Add(parteServicio);
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Parte de servicio guardado correctamente." });
        }

        // ✅ 3. AGREGAR NUEVAS DESCRIPCIONES SIN SOBRESCRIBIR (al guardar)
        [HttpPost("AgregarDescripcion")]
        public async Task<IActionResult> AgregarDescripcion([FromBody] DescripcionServicio descripcion)
        {
            Console.WriteLine($"📤 Recibiendo nueva descripción para Usuario ID: {descripcion.UsuarioId}");

            var fechaHoy = DateTime.UtcNow.Date;

            var parteExistente = await _context.ParteServicios
                .FirstOrDefaultAsync(p => p.UsuarioId == descripcion.UsuarioId && p.FechaRegistro.Date == fechaHoy);

            if (parteExistente == null)
            {
                Console.WriteLine("❌ Parte de servicio no encontrado para este usuario en la fecha actual.");
                return NotFound("No existe un parte de servicio registrado hoy para este usuario.");
            }

            // 📝 Capitalizar los textos antes de guardar
            descripcion.Descripcion = CapitalizarFrase(descripcion.Descripcion);
            descripcion.AccionTomada = CapitalizarFrase(descripcion.AccionTomada);
            descripcion.Observaciones = CapitalizarFrase(descripcion.Observaciones);

            descripcion.Observaciones = string.IsNullOrWhiteSpace(descripcion.Observaciones) ? "Sin observaciones" : descripcion.Observaciones;

            // Asignar el ParteServicioId correcto antes de guardar la descripción
            descripcion.ParteServicioId = parteExistente.Id;

            _context.DescripcionesServicio.Add(descripcion);
            await _context.SaveChangesAsync();

            Console.WriteLine("✅ Descripción agregada correctamente.");
            return Ok(new { mensaje = "Descripción agregada correctamente." });
        }
        

        // ✅ 4. MOSTRAR DESCRIPCIONES DEL DÍA EN LA TABLA CON FILTRO DE FECHA SELECCIONADA Y DÍA ANTERIOR
        [HttpGet("GetDescripcionesDelDia")]
        public async Task<IActionResult> GetDescripcionesDelDia(string aeropuerto, string? fechaSeleccionada = null)
        {
            try
            {
                Console.WriteLine($"📌 Aeropuerto recibido en la API: {aeropuerto}, FechaSeleccionada: {fechaSeleccionada}");

                // ✅ Obtener usuarios del aeropuerto
                var usuariosFiltrados = await _context.Usuarios
                    .Where(u => u.Aeropuerto.Trim() == aeropuerto.Trim())
                    .ToListAsync();

                if (!usuariosFiltrados.Any())
                {
                    Console.WriteLine("❌ No se encontraron usuarios en este aeropuerto.");
                    return NotFound("No se encontraron usuarios en este aeropuerto.");
                }

                DateTime fechaBase;
                if (!string.IsNullOrEmpty(fechaSeleccionada))
                {
                    // ✅ Convertir la fecha seleccionada a DateTime
                    if (!DateTime.TryParseExact(fechaSeleccionada, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fechaBase))
                    {
                        return BadRequest("Formato de fecha inválido. Use 'yyyy-MM-dd'.");
                    }
                }
                else
                {
                    // ✅ Si no hay fecha seleccionada, usar la lógica de hoy/ayer
                    fechaBase = DateTime.UtcNow.Date;
                }

                var fechaAyer = fechaBase.AddDays(-1);

                Console.WriteLine($"📆 Filtrando por FechaSeleccionada: {fechaBase} y {fechaAyer}");

                // ✅ Obtener partes de servicio con la fecha seleccionada o el día anterior
                var partesServicios = await _context.ParteServicios
                    .Where(ps => usuariosFiltrados.Select(u => u.Id).Contains(ps.UsuarioId)
                                && (ps.FechaSeleccionada == fechaBase || ps.FechaSeleccionada == fechaAyer))
                    .ToListAsync();

                if (!partesServicios.Any())
                {
                    return NotFound("No hay partes de servicio registrados.");
                }

                // ✅ Obtener descripciones relacionadas con esos partes de servicio
                var descripciones = await _context.DescripcionesServicio
                    .Where(ds => partesServicios.Select(ps => ps.Id).Contains(ds.ParteServicioId))
                    .ToListAsync();

                if (!descripciones.Any())
                {
                    return NotFound("No hay descripciones registradas para la fecha seleccionada.");
                }

                var descripcionesConUsuarios = descripciones
                    .Select(ds =>
                    {
                        var parteServicio = partesServicios.FirstOrDefault(ps => ps.Id == ds.ParteServicioId);
                        var usuario = usuariosFiltrados.FirstOrDefault(u => u.Id == parteServicio?.UsuarioId);

                        return new
                        {
                            Nombre = usuario?.Nombre ?? "Desconocido",
                            FechaDescripcion = parteServicio?.FechaSeleccionada?.ToString("yyyy-MM-dd") ?? "Sin fecha",
                            HoraDescripcion = ds.Hora.ToString(@"hh\:mm\:ss"),
                            ds.Descripcion,
                            ds.AccionTomada,
                            ds.Verificacion,
                            ds.EsIncidencia,
                            ds.Observaciones
                        };
                    })
                    .OrderBy(ds => ds.FechaDescripcion)
                    .ThenBy(ds => ds.HoraDescripcion)
                    .ToList();

                return Ok(descripcionesConUsuarios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en GetDescripcionesDelDia: {ex.Message}");
                return StatusCode(500, "Error interno del servidor.");
            }
        }


    }
}
    