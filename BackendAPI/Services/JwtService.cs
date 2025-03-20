using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BackendAPI.Services
{
    public class JwtService
    {
        private readonly string _key;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expireMinutes;

        public JwtService(IConfiguration config)
        {
            _key = config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration");
            _issuer = config["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer is missing");
            _audience = config["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience is missing");
            _expireMinutes = int.Parse(config["Jwt:ExpireMinutes"] ?? "60"); // Si no hay valor, usa 60 minutos por defecto
        }
        
        //generar token con los valores que enviare a mi front
        public string GenerateToken(string tip, string rol, string aeropuerto, string nombre, string apellido1, string apellido2)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, tip),
                new Claim(ClaimTypes.Role, rol),
                new Claim("Aeropuerto", aeropuerto),
                new Claim("Nombre", nombre),         // Agregado para enviar a los formularios
                new Claim("Apellido1", apellido1),   // Agregado
                new Claim("Apellido2", apellido2)    // Agregado
            };

            var token = new JwtSecurityToken(
                _issuer,
                _audience,
                claims,
                expires: DateTime.UtcNow.AddMinutes(_expireMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
