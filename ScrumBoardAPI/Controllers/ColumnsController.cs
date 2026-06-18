using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumBoardAPI.Data;
using ScrumBoardAPI.Entities;

namespace ScrumBoardAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ColumnsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ColumnsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all columns belonging to a specific board, ordered by position
    /// </summary>
    [HttpGet("board/{boardId}")]
    public async Task<ActionResult<IEnumerable<Column>>> GetColumnsByBoard(int boardId)
    {
        var boardExists = await _context.Boards.AnyAsync(b => b.Id == boardId);
        if (!boardExists)
        {
            return NotFound($"Board with ID {boardId} not found.");
        }

        var columns = await _context.Columns
            .Where(c => c.BoardId == boardId)
            .OrderBy(c => c.Position)
            .ToListAsync();

        return Ok(columns);
    }

    /// <summary>
    /// Create a new column inside a board
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Column>> CreateColumn(CreateColumnRequest request)
    {
        var boardExists = await _context.Boards.AnyAsync(b => b.Id == request.BoardId);
        if (!boardExists)
        {
            return NotFound($"Board with ID {request.BoardId} not found.");
        }

        var column = new Column
        {
            Title = request.Title,
            Position = request.Position,
            BoardId = request.BoardId,
            Board = null!
        };

        _context.Columns.Add(column);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetColumnsByBoard), new { boardId = column.BoardId }, column);
    }

    /// <summary>
    /// Update column title or position
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateColumn(int id, UpdateColumnRequest request)
    {
        var column = await _context.Columns.FindAsync(id);

        if (column == null)
        {
            return NotFound($"Column with ID {id} not found.");
        }

        column.Title = request.Title;
        column.Position = request.Position;

        _context.Columns.Update(column);
        await _context.SaveChangesAsync();

        return Ok(column);
    }

    /// <summary>
    /// Delete a column
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteColumn(int id)
    {
        var column = await _context.Columns.FindAsync(id);

        if (column == null)
        {
            return NotFound($"Column with ID {id} not found.");
        }

        _context.Columns.Remove(column);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

/// <summary>
/// Request model for creating a column
/// </summary>
public class CreateColumnRequest
{
    public required string Title { get; set; }
    public int Position { get; set; }
    public int BoardId { get; set; }
}

/// <summary>
/// Request model for updating a column
/// </summary>
public class UpdateColumnRequest
{
    public required string Title { get; set; }
    public int Position { get; set; }
}
