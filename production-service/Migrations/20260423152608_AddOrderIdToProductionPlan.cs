using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Production_Service.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderIdToProductionPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "ProductionPlans",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "ProductionPlans");
        }
    }
}
