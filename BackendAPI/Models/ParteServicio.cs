using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    public class ParteServicio
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "DATE")] // 🔹 Almacenar solo la fecha sin la hora en la BD
        public DateTime? FechaSeleccionada { get; set; } // 🔹 Ahora puede ser null

        [Required]
        public TimeSpan HoraInicio { get; set; }

        [Required]
        public TimeSpan HoraFin { get; set; }

        public string? MaterialControlado { get; set; }

        // ✅ Convertimos los booleanos a string
        public string LeidoNormativa { get; set; } = "No definido";
        public string AccidentesPuesto { get; set; } = "No definido";

        // 🔹 Relación con Usuarios
        [Required]
        public int UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }

        public ICollection<DescripcionServicio> Descripciones { get; set; } = new List<DescripcionServicio>();
    }
}


