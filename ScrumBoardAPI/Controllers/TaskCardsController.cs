using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumBoardAPI.Data;
using ScrumBoardAPI.Entities;

namespace ScrumBoardAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskCardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TaskCardsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all task cards inside a column
    /// </summary>
    [HttpGet("column/{columnId}")]
    public async Task<ActionResult<IEnumerable<TaskCard>>> GetTaskCardsByColumn(int columnId)
    {
        var columnExists = await _context.Columns.AnyAsync(c => c.Id == columnId);
        if (!columnExists)
        {
            return NotFound($"Column with ID {columnId} not found.");
        }

        var taskCards = await _context.TaskCards
            .Where(t => t.ColumnId == columnId)
            .ToListAsync();

        return Ok(taskCards);
    }

    /// <summary>
    /// Create a new task card inside a column
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TaskCard>> CreateTaskCard(CreateTaskCardRequest request)
    {
        var column = await _context.Columns.FindAsync(request.ColumnId);
        if (column == null)
        {
            return NotFound($"Column with ID {request.ColumnId} not found.");
        }

        var taskCard = new TaskCard
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            ColumnId = request.ColumnId,
            Column = null!
        };

        _context.TaskCards.Add(taskCard);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTaskCardsByColumn), new { columnId = taskCard.ColumnId }, taskCard);
    }

    /// <summary>
    /// Update task details like title, description, priority, or move it to another column
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskCard(int id, UpdateTaskCardRequest request)
    {
        var taskCard = await _context.TaskCards.FindAsync(id);

        if (taskCard == null)
        {
            return NotFound($"Task card with ID {id} not found.");
        }

        // Verify the target column exists if changing column
        if (request.ColumnId != taskCard.ColumnId)
        {
            var columnExists = await _context.Columns.AnyAsync(c => c.Id == request.ColumnId);
            if (!columnExists)
            {
                return NotFound($"Column with ID {request.ColumnId} not found.");
            }
        }

        taskCard.Title = request.Title;
        taskCard.Description = request.Description;
        taskCard.Priority = request.Priority;
        taskCard.DueDate = request.DueDate;
        taskCard.ColumnId = request.ColumnId;

        _context.TaskCards.Update(taskCard);
        await _context.SaveChangesAsync();

        return Ok(taskCard);
    }

    /// <summary>
    /// Delete a task card
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskCard(int id)
    {
        var taskCard = await _context.TaskCards.FindAsync(id);

        if (taskCard == null)
        {
            return NotFound($"Task card with ID {id} not found.");
        }

        _context.TaskCards.Remove(taskCard);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

/// <summary>
/// Request model for creating a task card
/// </summary>
public class CreateTaskCardRequest
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int ColumnId { get; set; }
}

/// <summary>
/// Request model for updating a task card
/// </summary>
public class UpdateTaskCardRequest
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int ColumnId { get; set; }
}
