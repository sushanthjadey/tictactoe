using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Models.GameModels;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/games")]
public class GamesController : ControllerBase
{
    private readonly IGameService gameService;

    public GamesController(IGameService game)
    {
        this.gameService = game;
    }

    [HttpPost]
    public ActionResult<GameState> Create(CreateGameRequest request)
    {
        return Ok(gameService.Create(request.Mode));
    }

    [HttpGet("{id:guid}")]
    public ActionResult<GameState> Get(Guid id)
    {
        try
        {
            return Ok(gameService.Get(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id:guid}/moves")]
    public ActionResult<GameState> Move(Guid id, MoveRequest request)
    {
        try
        {
            return Ok(gameService.MakeMove(id, request));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/undo")]
    public ActionResult<GameState> Undo(Guid id)
    {
        try
        {
            return Ok(gameService.Undo(id));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reset")]
    public ActionResult<GameState> Reset(Guid id)
    {
        try
        {
            return Ok(gameService.Reset(id));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}