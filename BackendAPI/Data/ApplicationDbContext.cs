using BackendAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<ParteServicio> ParteServicios { get; set; } // Para la tabla ParteServicios
        public DbSet<DescripcionServicio> DescripcionesServicio { get; set; } // Para la tabla DescripcionesServicio

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔴 Configuración para evitar conflictos de cascada
            modelBuilder.Entity<ParteServicio>()
                .HasOne(p => p.Usuario)
                .WithMany()
                .HasForeignKey(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict); // Evita eliminación en cascada

            modelBuilder.Entity<DescripcionServicio>()
                .HasOne(d => d.Usuario)
                .WithMany()
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict); // Evita eliminación en cascada
        }
    }
}
