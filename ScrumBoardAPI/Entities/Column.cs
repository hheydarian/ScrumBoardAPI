namespace ScrumBoardAPI.Entities;

public class Column
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public int Position { get; set; }

    public int BoardId { get; set; }

    // Navigation property
    public required Board Board { get; set; }

    public ICollection<TaskCard> TaskCards { get; set; } = [];
}
