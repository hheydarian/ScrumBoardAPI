namespace ScrumBoardAPI.Entities;

public class TaskCard
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public required string Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public string? Assignee { get; set; }

    public decimal Estimate { get; set; }

    public int ColumnId { get; set; }

    // Navigation property
    public Column? Column { get; set; }
}
