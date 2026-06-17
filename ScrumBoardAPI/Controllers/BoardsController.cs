using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumBoardAPI.Data;
using ScrumBoardAPI.Entities;

namespace ScrumBoardAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BoardsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all boards
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Board>>> GetBoards()
    {
        var boards = await _context.Boards.ToListAsync();
        return Ok(boards);
    }

    /// <summary>
    /// Get a single board by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Board>> GetBoard(int id)
    {
        var board = await _context.Boards.FindAsync(id);

        if (board == null)
        {
            return NotFound();
        }

        return Ok(board);
    }

    /// <summary>
    /// Create a new board
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Board>> CreateBoard(CreateBoardRequest request)
    {
        var board = new Board
        {
            Title = request.Title,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBoard), new { id = board.Id }, board);
    }

    /// <summary>
    /// Update a board's title and description
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(int id, UpdateBoardRequest request)
    {
        var board = await _context.Boards.FindAsync(id);

        if (board == null)
        {
            return NotFound();
        }

        board.Title = request.Title;
        board.Description = request.Description;

        _context.Boards.Update(board);
        await _context.SaveChangesAsync();

        return Ok(board);
    }

    /// <summary>
    /// Delete a board
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(int id)
    {
        var board = await _context.Boards.FindAsync(id);

        if (board == null)
        {
            return NotFound();
        }

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

/// <summary>
/// Request model for creating a board
/// </summary>
public class CreateBoardRequest
{
    public required string Title { get; set; }
    public string? Description { get; set; }
}

/// <summary>
/// Request model for updating a board
/// </summary>
public class UpdateBoardRequest
{
    public required string Title { get; set; }
    public string? Description { get; set; }
}
