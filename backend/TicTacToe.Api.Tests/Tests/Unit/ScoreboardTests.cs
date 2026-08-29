using FluentAssertions;
using TicTacToe.Api.Models.GameModels;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Tests;

public class ScoreboardTests
{
    private readonly ScoreboardService scoreboardService;

    public ScoreboardTests()
    {
        scoreboardService = new ScoreboardService();
        ((IScoreboardService)scoreboardService).Reset();
    }

    [Fact]
    public void Get_ShouldReturnInitialZeroScoreboard()
    {
        var result = ((IScoreboardService)scoreboardService).Get();

        result.Should().NotBeNull();
        result.XWins.Should().Be(0);
        result.OWins.Should().Be(0);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void AddWin_ShouldIncrementXWins()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(1);
        result.OWins.Should().Be(0);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void AddWin_ShouldIncrementOWins()
    {
        ((IScoreboardService)scoreboardService).AddWin("O");

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(0);
        result.OWins.Should().Be(1);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void AddWin_ShouldIncrementXWinsMultipleTimes()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("X");

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(3);
        result.OWins.Should().Be(0);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void AddWin_ShouldIncrementOWinsMultipleTimes()
    {
        ((IScoreboardService)scoreboardService).AddWin("O");
        ((IScoreboardService)scoreboardService).AddWin("O");

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(0);
        result.OWins.Should().Be(2);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void AddDraw_ShouldIncrementDraws()
    {
        ((IScoreboardService)scoreboardService).AddDraw();

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(0);
        result.OWins.Should().Be(0);
        result.Draws.Should().Be(1);
    }

    [Fact]
    public void AddDraw_ShouldIncrementDrawsMultipleTimes()
    {
        ((IScoreboardService)scoreboardService).AddDraw();
        ((IScoreboardService)scoreboardService).AddDraw();
        ((IScoreboardService)scoreboardService).AddDraw();

        var result = ((IScoreboardService)scoreboardService).Get();

        result.Draws.Should().Be(3);
    }

    [Fact]
    public void AddWin_ShouldNotChangeOtherScores()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(1);
        result.OWins.Should().Be(0);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void AddDraw_ShouldNotChangePlayerWins()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("O");
        ((IScoreboardService)scoreboardService).AddDraw();

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(1);
        result.OWins.Should().Be(1);
        result.Draws.Should().Be(1);
    }

    [Fact]
    public void Get_ShouldReturnCopyOfScoreboard()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");

        var first = ((IScoreboardService)scoreboardService).Get();
        var second = ((IScoreboardService)scoreboardService).Get();

        first.Should().NotBeSameAs(second);
        first.XWins.Should().Be(1);
        second.XWins.Should().Be(1);
    }

    [Fact]
    public void Reset_ShouldClearAllScores()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("O");
        ((IScoreboardService)scoreboardService).AddDraw();

        ((IScoreboardService)scoreboardService).Reset();

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(0);
        result.OWins.Should().Be(0);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void Reset_ShouldAllowNewScoresAfterReset()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).Reset();
        ((IScoreboardService)scoreboardService).AddWin("O");

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(0);
        result.OWins.Should().Be(1);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void AddWin_ShouldIgnoreInvalidPlayer()
    {
        ((IScoreboardService)scoreboardService).AddWin("A");

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(0);
        result.OWins.Should().Be(0);
        result.Draws.Should().Be(0);
    }

    [Fact]
    public void Scoreboard_ShouldTrackAllResultsIndependently()
    {
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("X");
        ((IScoreboardService)scoreboardService).AddWin("O");
        ((IScoreboardService)scoreboardService).AddDraw();
        ((IScoreboardService)scoreboardService).AddDraw();

        var result = ((IScoreboardService)scoreboardService).Get();

        result.XWins.Should().Be(2);
        result.OWins.Should().Be(1);
        result.Draws.Should().Be(2);
    }

    
}