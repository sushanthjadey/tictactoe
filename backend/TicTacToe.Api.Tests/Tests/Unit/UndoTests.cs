using FluentAssertions;
using TicTacToe.Api.Models.GameModels;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Tests;

public class UndoTests
{
    private readonly GameService gameService;
    private readonly ScoreboardService scoreboardService;

    public UndoTests()
    {
        scoreboardService = new ScoreboardService();
        gameService = new GameService(scoreboardService);
    }

    private GameState CreateGame(GameMode mode = GameMode.TwoPlayer)
    {
        return ((IGameService)gameService).Create(mode);
    }

    private GameState MakeMove(
        Guid gameId,
        string player,
        int row,
        int column)
    {
        return ((IGameService)gameService).MakeMove(
            gameId,
            new MoveRequest(player, row, column));
    }

    [Fact]
    public void Undo_ShouldRejectWhenThereAreNoMoves()
    {
        var game = CreateGame();

        Action act = () => gameService.Undo(game.GameId);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("No moves to undo.");
    }

    [Fact]
    public void Undo_TwoPlayer_ShouldRemoveOnlyLastMove()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);

        var result = gameService.Undo(game.GameId);

        result.Board[0].Should().Be("X");
        result.Board[4].Should().Be("");
        result.MoveHistory.Should().HaveCount(1);
    }

    [Fact]
    public void Undo_TwoPlayer_ShouldRestoreCorrectPlayerTurn()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);

        var result = gameService.Undo(game.GameId);

        result.CurrentPlayer.Should().Be("O");
    }

    [Fact]
    public void Undo_TwoPlayer_ShouldRemoveLastMoveFromHistory()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);

        var result = gameService.Undo(game.GameId);

        result.MoveHistory.Should().HaveCount(1);
        result.MoveHistory[0].Number.Should().Be(1);
        result.MoveHistory[0].Player.Should().Be("X");
        result.MoveHistory[0].Row.Should().Be(0);
        result.MoveHistory[0].Column.Should().Be(0);
    }

    [Fact]
    public void Undo_TwoPlayer_ShouldRestoreEmptyCell()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 2, 2);

        var result = gameService.Undo(game.GameId);

        result.Board[8].Should().Be("");
    }

    [Fact]
    public void Undo_TwoPlayer_ShouldKeepPreviousMoves()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 0, 1);

        var result = gameService.Undo(game.GameId);

        result.Board[0].Should().Be("X");
        result.Board[4].Should().Be("O");
        result.Board[1].Should().Be("");

        result.MoveHistory.Should().HaveCount(2);
        result.CurrentPlayer.Should().Be("X");
    }

    [Fact]
    public void Undo_ShouldKeepGameInProgress()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);

        var result = gameService.Undo(game.GameId);

        result.Status.Should().Be(GameStatus.InProgress);
    }

    [Fact]
    public void Undo_ShouldClearWinner()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 0);
        MakeMove(game.GameId, "X", 0, 1);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 0, 2);

        Action act = () => gameService.Undo(game.GameId);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Undo is disabled after game completion.");
    }

    [Fact]
    public void Undo_ShouldRejectAfterWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 0);
        MakeMove(game.GameId, "X", 0, 1);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 0, 2);

        game.Status.Should().Be(GameStatus.Won);

        Action act = () => gameService.Undo(game.GameId);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Undo is disabled after game completion.");
    }

    [Fact]
    public void Undo_ShouldRejectAfterDraw()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 0, 1);
        MakeMove(game.GameId, "X", 0, 2);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 1, 0);
        MakeMove(game.GameId, "O", 1, 2);
        MakeMove(game.GameId, "X", 2, 1);
        MakeMove(game.GameId, "O", 2, 0);
        MakeMove(game.GameId, "X", 2, 2);

        game.Status.Should().Be(GameStatus.Draw);

        Action act = () => gameService.Undo(game.GameId);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Undo is disabled after game completion.");
    }

    [Fact]
    public void Undo_ComputerMode_ShouldRemoveHumanAndComputerMoves()
    {
        var game = CreateGame(GameMode.Computer);

        var afterMove = MakeMove(
            game.GameId,
            "X",
            0,
            0);

        afterMove.MoveHistory.Should().HaveCount(2);
        afterMove.MoveHistory[0].Player.Should().Be("X");
        afterMove.MoveHistory[1].Player.Should().Be("O");

        var result = gameService.Undo(game.GameId);

        result.MoveHistory.Should().BeEmpty();
        result.Board.Should().OnlyContain(cell => cell == "");
        result.CurrentPlayer.Should().Be("X");
        result.Status.Should().Be(GameStatus.InProgress);
    }

    [Fact]
    public void Undo_ComputerMode_ShouldRemoveComputerMove()
    {
        var game = CreateGame(GameMode.Computer);

        MakeMove(
            game.GameId,
            "X",
            0,
            0);

        var beforeUndo =
            ((IGameService)gameService).Get(game.GameId);

        beforeUndo.MoveHistory.Should().HaveCount(2);

        var computerMove = beforeUndo.MoveHistory[1];

        var result = gameService.Undo(game.GameId);

        result.Board[computerMove.Row * 3 + computerMove.Column]
            .Should()
            .Be("");
    }

    [Fact]
    public void Undo_ComputerMode_ShouldRemoveHumanMove()
    {
        var game = CreateGame(GameMode.Computer);

        MakeMove(
            game.GameId,
            "X",
            0,
            0);

        var result = gameService.Undo(game.GameId);

        result.Board[0].Should().Be("");
    }

    [Fact]
    public void Undo_ComputerMode_ShouldRestoreXTurn()
    {
        var game = CreateGame(GameMode.Computer);

        MakeMove(
            game.GameId,
            "X",
            0,
            0);

        var result = gameService.Undo(game.GameId);

        result.CurrentPlayer.Should().Be("X");
    }

    [Fact]
    public void Undo_ComputerMode_ShouldRestoreEmptyHistory()
    {
        var game = CreateGame(GameMode.Computer);

        MakeMove(
            game.GameId,
            "X",
            0,
            0);

        gameService.Undo(game.GameId);

        var result =
            ((IGameService)gameService).Get(game.GameId);

        result.MoveHistory.Should().BeEmpty();
    }

    [Fact]
    public void Undo_ShouldNotChangeScoreboard()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);

        var beforeUndo =
            ((IScoreboardService)scoreboardService).Get();

        gameService.Undo(game.GameId);

        var afterUndo =
            ((IScoreboardService)scoreboardService).Get();

        afterUndo.XWins.Should().Be(beforeUndo.XWins);
        afterUndo.OWins.Should().Be(beforeUndo.OWins);
        afterUndo.Draws.Should().Be(beforeUndo.Draws);
    }

    [Fact]
    public void Undo_ShouldPreserveMoveNumbers()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 0, 1);

        var result = gameService.Undo(game.GameId);

        result.MoveHistory.Should().HaveCount(2);
        result.MoveHistory[0].Number.Should().Be(1);
        result.MoveHistory[1].Number.Should().Be(2);
    }

    [Fact]
    public void Undo_ShouldAllowNewMoveAfterUndo()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);

        gameService.Undo(game.GameId);

        var result = MakeMove(game.GameId, "O", 2, 2);

        result.Board[8].Should().Be("O");
        result.CurrentPlayer.Should().Be("X");
        result.MoveHistory.Should().HaveCount(2);
    }
}