using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Aeropuerto { get; set; } = string.Empty;

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Apellido1 { get; set; } = string.Empty;

        [Required]
        public string Apellido2 { get; set; } = string.Empty;

        [Required]
        public string TIP { get; set; } = string.Empty;

        [Required]
        public string Rol { get; set; } = "Vigilante"; // Se asigna por defecto "Vigilante"
    }
}
