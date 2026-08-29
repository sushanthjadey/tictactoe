using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Controllers;
using TicTacToe.Api.Models.GameModels;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Tests;

public class ScoreboardControllerTests
{
    private readonly IScoreboardService scoreboardService;
    private readonly ScoreboardController controller;

    public ScoreboardControllerTests()
    {
        scoreboardService = new ScoreboardService();
        ((IScoreboardService)scoreboardService).Reset();

        controller = new ScoreboardController(scoreboardService);
    }

    [Fact]
    public void Get_ShouldReturnOkWithScoreboard()
    {
        var result = controller.Get();

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;

        okResult.Value.Should().BeOfType<Scoreboard>();

        var scoreboard = (Scoreboard)okResult.Value!;

        scoreboard.XWins.Should().Be(0);
        scoreboard.OWins.Should().Be(0);
        scoreboard.Draws.Should().Be(0);
    }

    [Fact]
    public void Get_ShouldReturnCurrentScoreboard()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("O");
        ((IScoreboardService)scoreboardService).AddDraw();

        var result = controller.Get();

        var okResult = (OkObjectResult)result.Result!;
        var scoreboard = (Scoreboard)okResult.Value!;

        scoreboard.XWins.Should().Be(1);
        scoreboard.OWins.Should().Be(1);
        scoreboard.Draws.Should().Be(1);
    }

    [Fact]
    public void Reset_ShouldReturnOkWithZeroScores()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("O");
        ((IScoreboardService)scoreboardService).AddDraw();

        var result = controller.Reset();

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var scoreboard = (Scoreboard)okResult.Value!;

        scoreboard.XWins.Should().Be(0);
        scoreboard.OWins.Should().Be(0);
        scoreboard.Draws.Should().Be(0);
    }

    [Fact]
    public void Reset_ShouldAllowNewScoresAfterReset()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");

        controller.Reset();

        ((IScoreboardService)scoreboardService).AddWin("O");

        var result = controller.Get();

        var okResult = (OkObjectResult)result.Result!;
        var scoreboard = (Scoreboard)okResult.Value!;

        scoreboard.XWins.Should().Be(0);
        scoreboard.OWins.Should().Be(1);
        scoreboard.Draws.Should().Be(0);
    }
}