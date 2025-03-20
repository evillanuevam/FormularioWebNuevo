using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    public class DescripcionServicio
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ParteServicioId { get; set; }

        [ForeignKey("ParteServicioId")]
        public ParteServicio? ParteServicio { get; set; }

        [Required]
        public TimeSpan Hora { get; set; }

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        public string AccionTomada { get; set; } = string.Empty;

        [Required]
        public string Verificacion { get; set; } = string.Empty;

        // ✅ Convertimos a string para almacenar correctamente
        public string EsIncidencia { get; set; } = "No incidencia"; 

        public string Observaciones { get; set; } = string.Empty;

        public string? ArchivoRuta { get; set; }

        // 🔹 Relación con Usuarios
        [Required]
        public int UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }
    }
}

