using Microsoft.EntityFrameworkCore;
using ScrumBoardAPI.Entities;

namespace ScrumBoardAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Board> Boards { get; set; }
    public DbSet<Column> Columns { get; set; }
    public DbSet<TaskCard> TaskCards { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Board configuration
        modelBuilder.Entity<Board>(entity =>
        {
            entity.HasKey(b => b.Id);

            entity.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(b => b.Description)
                .HasMaxLength(500);

            entity.Property(b => b.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasMany(b => b.Columns)
                .WithOne(c => c.Board)
                .HasForeignKey(c => c.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Column configuration
        modelBuilder.Entity<Column>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(c => c.Position)
                .IsRequired();

            entity.HasMany(c => c.TaskCards)
                .WithOne(t => t.Column)
                .HasForeignKey(t => t.ColumnId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TaskCard configuration
        modelBuilder.Entity<TaskCard>(entity =>
        {
            entity.HasKey(t => t.Id);

            entity.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(t => t.Description)
                .HasMaxLength(2000);

            entity.Property(t => t.Priority)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(t => t.DueDate);
            entity.Property(t => t.Estimate).HasColumnType("decimal(18,2)");
        });
    }
}
