namespace ScrumBoardAPI.Entities;

public class TaskCard
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public required string Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public int ColumnId { get; set; }

    // Navigation property
    public required Column Column { get; set; }
}
