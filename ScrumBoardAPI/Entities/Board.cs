namespace ScrumBoardAPI.Entities;

public class Board
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation property
    public ICollection<Column> Columns { get; set; } = [];
}
