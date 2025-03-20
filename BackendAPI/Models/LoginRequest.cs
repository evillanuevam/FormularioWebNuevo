using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class LoginRequest
    {
        [Required]
        public string TIP { get; set; } = string.Empty;

        [Required]
        public string Aeropuerto { get; set; } = string.Empty;
    }
}
