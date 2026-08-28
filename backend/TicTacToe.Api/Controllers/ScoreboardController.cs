using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Models.GameModels;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/scoreboard")]
public class ScoreboardController : ControllerBase
{
    private readonly ScoreboardService scoreboard;

    public ScoreboardController(
        ScoreboardService scoreboard)
    {
        this.scoreboard = scoreboard;
    }

    [HttpGet]
    public ActionResult<Scoreboard> Get()
    {
        return Ok(scoreboard.Get());
    }

    [HttpPost("reset")]
    public ActionResult<Scoreboard> Reset()
    {
        scoreboard.Reset();

        return Ok(
            scoreboard.Get());
    }
}