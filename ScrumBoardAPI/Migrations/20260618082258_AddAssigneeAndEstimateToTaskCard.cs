using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumBoardAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAssigneeAndEstimateToTaskCard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Assignee",
                table: "TaskCards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Estimate",
                table: "TaskCards",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Assignee",
                table: "TaskCards");

            migrationBuilder.DropColumn(
                name: "Estimate",
                table: "TaskCards");
        }
    }
}
