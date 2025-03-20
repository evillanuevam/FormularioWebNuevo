using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;


namespace BackendAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService; // Agregar JwtService para topken

        public AuthController(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService; //  Asignar el servicio en el constructor
        }


        // Función para capitalizar la primera letra de cada palabra
        private string CapitalizarTexto(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return texto;

            return string.Join(" ", texto.ToLower().Split(" ")
                .Select(palabra => char.ToUpper(palabra[0]) + palabra.Substring(1)));
        }

        //  Registro de usuario (ENDPOINT) igual que en el front
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Usuario usuario)
        {
            // Normalizar el formato de nombre y apellidos
            usuario.Nombre = CapitalizarTexto(usuario.Nombre);
            usuario.Apellido1 = CapitalizarTexto(usuario.Apellido1);
            usuario.Apellido2 = CapitalizarTexto(usuario.Apellido2);

            // Verificar si el TIP ya existe en el mismo aeropuerto
            bool usuarioExistenteEnAeropuerto = await _context.Usuarios.AnyAsync(u => u.TIP == usuario.TIP && u.Aeropuerto == usuario.Aeropuerto);

            if (usuarioExistenteEnAeropuerto)
            {
                return BadRequest(new { message = "Ya existe un usuario con este TIP en este aeropuerto." });
            }

            // Verificar si el TIP ya existe en otro aeropuerto con diferente nombre/apellido
            var usuarioExistente = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TIP == usuario.TIP);

            if (usuarioExistente != null)
            {
                // Comparar los datos del usuario registrado con los datos ingresados
                if (usuarioExistente.Nombre != usuario.Nombre || usuarioExistente.Apellido1 != usuario.Apellido1 || usuarioExistente.Apellido2 != usuario.Apellido2)
                {
                    return BadRequest(new { message = "Los datos ingresados no coinciden con los registrados para este TIP." });
                }
            }

            // Asignar por defecto el rol "Vigilante"
            usuario.Rol = "Vigilante";

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario registrado exitosamente." });
        }

        

        //  Login de usuario (SIN CAMBIOS)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TIP) || string.IsNullOrWhiteSpace(request.Aeropuerto))
            {
                return BadRequest(new { message = "Los campos TIP y Aeropuerto son obligatorios." });
            }

            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TIP == request.TIP && u.Aeropuerto == request.Aeropuerto);

            if (user == null)
            {
                return Unauthorized(new { message = "Credenciales incorrectas." });
            }

            // Generar el Token JWT con los datos completos
            var token = _jwtService.GenerateToken(user.TIP, user.Rol, user.Aeropuerto, user.Nombre, user.Apellido1, user.Apellido2);

            // COOKIE SEGURA: Configurar cookie segura con el token
            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,   // Evita que sea accesible desde JS
                Secure = true,     // Solo en HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(2) // Expira en 2 horas
            });

            return Ok(new
            {
                message = "Inicio de sesión exitoso.",
                token // Devolver el token al usuario
            });
        }

        //  Eliminar usuario por TIP
        [HttpDelete("delete/{tip}")]
        [Authorize]  //  Solo este endpoint necesita autenticación
        public async Task<IActionResult> Delete(string tip)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.TIP == tip);
            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado." });
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario eliminado correctamente." });
        }

        // ENDPOINT de prueba para verificar conexión con el backend
        [HttpGet("test")]
        public IActionResult TestConnection()
        {
            return Ok(new { message = "API funcionando correctamente" });
        }


        // ENDPOINT para verificar el Rol del vigilante en el login
        [HttpGet("get-role")]
        public async Task<IActionResult> GetRoleByTip(string tip, string aeropuerto)
        {
            if (string.IsNullOrEmpty(tip) || string.IsNullOrEmpty(aeropuerto))
            {
                return BadRequest(new { message = "El TIP y el Aeropuerto son obligatorios." });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TIP == tip && u.Aeropuerto == aeropuerto);

            if (usuario == null)
            {
                return NotFound(new { message = "No se encontró un usuario con ese TIP en este aeropuerto." });
            }

            return Ok(new { rol = usuario.Rol });
        }


    }
}
