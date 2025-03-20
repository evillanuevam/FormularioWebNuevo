using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Aeropuerto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Apellido1 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Apellido2 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TIP = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParteServicios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeSpan>(type: "time", nullable: false),
                    MaterialControlado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LeidoNormativa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccidentesPuesto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParteServicios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParteServicios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DescripcionesServicio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParteServicioId = table.Column<int>(type: "int", nullable: false),
                    Hora = table.Column<TimeSpan>(type: "time", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccionTomada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Verificacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EsIncidencia = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ArchivoRuta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UsuarioId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DescripcionesServicio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DescripcionesServicio_ParteServicios_ParteServicioId",
                        column: x => x.ParteServicioId,
                        principalTable: "ParteServicios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DescripcionesServicio_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DescripcionesServicio_ParteServicioId",
                table: "DescripcionesServicio",
                column: "ParteServicioId");

            migrationBuilder.CreateIndex(
                name: "IX_DescripcionesServicio_UsuarioId",
                table: "DescripcionesServicio",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ParteServicios_UsuarioId",
                table: "ParteServicios",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DescripcionesServicio");

            migrationBuilder.DropTable(
                name: "ParteServicios");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
