using FluentAssertions;
using TicTacToe.Api.Models.GameModels;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Tests;

public class GameServiceTests
{
    private readonly IGameService gameService;
    private readonly IScoreboardService scoreboardService;

    public GameServiceTests()
    {
        scoreboardService = new ScoreboardService();
        gameService = new GameService(scoreboardService);
    }

    private static MoveRequest Move(string player, int row, int column)
    {
        return new MoveRequest(player, row, column);
    }

    private GameState CreateGame(GameMode mode = GameMode.TwoPlayer)
    {
        return ((IGameService)gameService).Create(mode);
    }

    private GameState MakeMove(Guid gameId, string player, int row, int column)
    {
        return ((IGameService)gameService).MakeMove(
            gameId,
            Move(player, row, column));
    }

    [Fact]
    public void Create_ShouldCreateNewGame()
    {
        var game = CreateGame();

        game.Should().NotBeNull();
        game.GameId.Should().NotBeEmpty();
        game.Mode.Should().Be(GameMode.TwoPlayer);
        game.CurrentPlayer.Should().Be("X");
        game.Status.Should().Be(GameStatus.InProgress);
        game.Board.Should().HaveCount(9);
        game.MoveHistory.Should().BeEmpty();
    }

    [Fact]
    public void Create_ShouldInitializeEmptyBoard()
    {
        var game = CreateGame();

        game.Board.Should().OnlyContain(cell => cell == "");
    }

    [Fact]
    public void Create_ShouldSupportComputerMode()
    {
        var game = CreateGame(GameMode.Computer);

        game.Mode.Should().Be(GameMode.Computer);
        game.CurrentPlayer.Should().Be("X");
        game.Status.Should().Be(GameStatus.InProgress);
        game.MoveHistory.Should().BeEmpty();
    }

    [Fact]
    public void Create_ShouldGenerateUniqueGameIds()
    {
        var firstGame = CreateGame();
        var secondGame = CreateGame();

        firstGame.GameId.Should().NotBe(secondGame.GameId);
    }

    [Fact]
    public void Get_ShouldReturnExistingGame()
    {
        var createdGame = CreateGame();

        var result = ((IGameService)gameService).Get(createdGame.GameId);

        result.Should().BeSameAs(createdGame);
    }

    [Fact]
    public void Get_ShouldThrowWhenGameDoesNotExist()
    {
        var gameId = Guid.NewGuid();

        Action act = () => ((IGameService)gameService).Get(gameId);

        act.Should()
            .Throw<KeyNotFoundException>()
            .WithMessage("Game not found.");
    }

    [Fact]
    public void MakeMove_ShouldPlaceXOnBoard()
    {
        var game = CreateGame();

        var result = MakeMove(game.GameId, "X", 0, 0);

        result.Board[0].Should().Be("X");
        result.MoveHistory.Should().HaveCount(1);
        result.MoveHistory[0].Number.Should().Be(1);
        result.MoveHistory[0].Player.Should().Be("X");
        result.MoveHistory[0].Row.Should().Be(0);
        result.MoveHistory[0].Column.Should().Be(0);
    }

    [Fact]
    public void MakeMove_ShouldSwitchTurnFromXToO()
    {
        var game = CreateGame();

        var result = MakeMove(game.GameId, "X", 0, 0);

        result.CurrentPlayer.Should().Be("O");
    }

    [Fact]
    public void MakeMove_ShouldSwitchTurnFromOToX()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);

        var result = MakeMove(game.GameId, "O", 1, 1);

        result.CurrentPlayer.Should().Be("X");
    }

    [Fact]
    public void MakeMove_ShouldAddMovesInCorrectOrder()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 0, 1);

        var result = ((IGameService)gameService).Get(game.GameId);

        result.MoveHistory.Should().HaveCount(3);
        result.MoveHistory[0].Number.Should().Be(1);
        result.MoveHistory[0].Player.Should().Be("X");
        result.MoveHistory[1].Number.Should().Be(2);
        result.MoveHistory[1].Player.Should().Be("O");
        result.MoveHistory[2].Number.Should().Be(3);
        result.MoveHistory[2].Player.Should().Be("X");
    }

    [Fact]
    public void MakeMove_ShouldRejectOccupiedCell()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);

        Action act = () => MakeMove(game.GameId, "O", 0, 0);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Cell is already occupied.");
    }

    [Fact]
    public void MakeMove_ShouldRejectWrongPlayer()
    {
        var game = CreateGame();

        Action act = () => MakeMove(game.GameId, "O", 0, 0);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("It is X's turn.");
    }

    [Fact]
    public void MakeMove_ShouldRejectInvalidPlayer()
    {
        var game = CreateGame();

        Action act = () => MakeMove(game.GameId, "A", 0, 0);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Invalid player.");
    }

    [Fact]
    public void MakeMove_ShouldRejectNegativeRow()
    {
        var game = CreateGame();

        Action act = () => MakeMove(game.GameId, "X", -1, 0);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Invalid board position.");
    }

    [Fact]
    public void MakeMove_ShouldRejectRowGreaterThanTwo()
    {
        var game = CreateGame();

        Action act = () => MakeMove(game.GameId, "X", 3, 0);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Invalid board position.");
    }

    [Fact]
    public void MakeMove_ShouldRejectNegativeColumn()
    {
        var game = CreateGame();

        Action act = () => MakeMove(game.GameId, "X", 0, -1);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Invalid board position.");
    }

    [Fact]
    public void MakeMove_ShouldRejectColumnGreaterThanTwo()
    {
        var game = CreateGame();

        Action act = () => MakeMove(game.GameId, "X", 0, 3);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Invalid board position.");
    }

    [Fact]
    public void InvalidMove_ShouldNotChangeBoard()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);

        Action act = () => MakeMove(game.GameId, "O", 0, 0);

        act.Should().Throw<InvalidOperationException>();

        var result = ((IGameService)gameService).Get(game.GameId);

        result.Board[0].Should().Be("X");
        result.MoveHistory.Should().HaveCount(1);
    }

    [Fact]
    public void InvalidMove_ShouldNotChangeTurn()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);

        Action act = () => MakeMove(game.GameId, "O", 0, 0);

        act.Should().Throw<InvalidOperationException>();

        var result = ((IGameService)gameService).Get(game.GameId);

        result.CurrentPlayer.Should().Be("O");
    }

    [Fact]
    public void MakeMove_ShouldDetectTopRowWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 0);
        MakeMove(game.GameId, "X", 0, 1);
        MakeMove(game.GameId, "O", 1, 1);

        var result = MakeMove(game.GameId, "X", 0, 2);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 0, 1, 2 });
    }

    [Fact]
    public void MakeMove_ShouldDetectMiddleRowWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 1, 0);
        MakeMove(game.GameId, "O", 0, 0);
        MakeMove(game.GameId, "X", 1, 1);
        MakeMove(game.GameId, "O", 0, 1);

        var result = MakeMove(game.GameId, "X", 1, 2);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 3, 4, 5 });
    }

    [Fact]
    public void MakeMove_ShouldDetectBottomRowWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 2, 0);
        MakeMove(game.GameId, "O", 0, 0);
        MakeMove(game.GameId, "X", 2, 1);
        MakeMove(game.GameId, "O", 0, 1);

        var result = MakeMove(game.GameId, "X", 2, 2);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 6, 7, 8 });
    }

    [Fact]
    public void MakeMove_ShouldDetectFirstColumnWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 0, 1);
        MakeMove(game.GameId, "X", 1, 0);
        MakeMove(game.GameId, "O", 1, 1);

        var result = MakeMove(game.GameId, "X", 2, 0);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 0, 3, 6 });
    }

    [Fact]
    public void MakeMove_ShouldDetectSecondColumnWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 1);
        MakeMove(game.GameId, "O", 0, 0);
        MakeMove(game.GameId, "X", 1, 1);
        MakeMove(game.GameId, "O", 1, 0);

        var result = MakeMove(game.GameId, "X", 2, 1);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 1, 4, 7 });
    }

    [Fact]
    public void MakeMove_ShouldDetectThirdColumnWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 2);
        MakeMove(game.GameId, "O", 0, 0);
        MakeMove(game.GameId, "X", 1, 2);
        MakeMove(game.GameId, "O", 1, 0);

        var result = MakeMove(game.GameId, "X", 2, 2);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 2, 5, 8 });
    }

    [Fact]
    public void MakeMove_ShouldDetectMainDiagonalWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 0, 1);
        MakeMove(game.GameId, "X", 1, 1);
        MakeMove(game.GameId, "O", 1, 0);

        var result = MakeMove(game.GameId, "X", 2, 2);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 0, 4, 8 });
    }

    [Fact]
    public void MakeMove_ShouldDetectReverseDiagonalWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 2);
        MakeMove(game.GameId, "O", 0, 0);
        MakeMove(game.GameId, "X", 1, 1);
        MakeMove(game.GameId, "O", 1, 0);

        var result = MakeMove(game.GameId, "X", 2, 0);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 2, 4, 6 });
    }

    [Fact]
    public void MakeMove_ShouldDetectOWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 1, 0);
        MakeMove(game.GameId, "O", 0, 0);
        MakeMove(game.GameId, "X", 1, 1);
        MakeMove(game.GameId, "O", 0, 1);
        var result = MakeMove(game.GameId, "X", 2, 2);

        result = MakeMove(game.GameId, "O", 0, 2);

        result.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("O");
        result.WinningCells.Should().BeEquivalentTo(new[] { 0, 1, 2 });
    }

    [Fact]
    public void MakeMove_ShouldDetectDraw()
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

        var result = MakeMove(game.GameId, "X", 2, 2);

        result.Status.Should().Be(GameStatus.Draw);
        result.Winner.Should().BeNull();
        result.WinningCells.Should().BeEmpty();
    }

    [Fact]
    public void MakeMove_ShouldRejectMoveAfterWin()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 0);
        MakeMove(game.GameId, "X", 0, 1);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 0, 2);

        Action act = () => MakeMove(game.GameId, "O", 2, 2);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Game is already completed.");
    }

    [Fact]
    public void MakeMove_ShouldRejectMoveAfterDraw()
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

        Action act = () => MakeMove(game.GameId, "O", 2, 2);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("Game is already completed.");
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
        result.CurrentPlayer.Should().Be("O");
        result.Status.Should().Be(GameStatus.InProgress);
        result.Winner.Should().BeNull();
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
    public void Undo_ShouldRejectAfterGameCompletion()
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
    public void Undo_TwoPlayer_ShouldRestoreCorrectTurn()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);
        MakeMove(game.GameId, "X", 0, 1);

        var result = gameService.Undo(game.GameId);

        result.CurrentPlayer.Should().Be("X");
        result.MoveHistory.Should().HaveCount(2);
    }

    [Fact]
    public void Undo_ComputerMode_ShouldRemoveHumanAndComputerMoves()
    {
        var game = CreateGame(GameMode.Computer);

        var afterHumanMove = MakeMove(
            game.GameId,
            "X",
            0,
            0);

        afterHumanMove.MoveHistory.Should().HaveCount(2);
        afterHumanMove.MoveHistory[0].Player.Should().Be("X");
        afterHumanMove.MoveHistory[1].Player.Should().Be("O");

        var result = gameService.Undo(game.GameId);

        result.MoveHistory.Should().BeEmpty();
        result.Board.Should().OnlyContain(cell => cell == "");
        result.CurrentPlayer.Should().Be("X");
        result.Status.Should().Be(GameStatus.InProgress);
    }

    [Fact]
    public void ComputerMode_ShouldAutomaticallyMakeComputerMove()
    {
        var game = CreateGame(GameMode.Computer);

        var result = MakeMove(
            game.GameId,
            "X",
            0,
            0);

        result.MoveHistory.Should().HaveCount(2);
        result.MoveHistory[0].Player.Should().Be("X");
        result.MoveHistory[1].Player.Should().Be("O");
        result.Board.Should().Contain("O");
    }

    [Fact]
    public void ComputerMode_ShouldNotAllowHumanToPlayAsO()
    {
        var game = CreateGame(GameMode.Computer);

        Action act = () => MakeMove(
            game.GameId,
            "O",
            0,
            0);

        act.Should()
            .Throw<InvalidOperationException>()
            .WithMessage("It is X's turn.");
    }

    [Fact]
    public void ComputerMode_ShouldTakeCenterWhenAvailable()
    {
        var game = CreateGame(GameMode.Computer);

        var result = MakeMove(
            game.GameId,
            "X",
            0,
            0);

        result.Board[4].Should().Be("O");
    }

    [Fact]
    public void Reset_ShouldCreateFreshGame()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);
        MakeMove(game.GameId, "O", 1, 1);

        var result = gameService.Reset(game.GameId);

        result.GameId.Should().NotBe(game.GameId);
        result.Mode.Should().Be(GameMode.TwoPlayer);
        result.CurrentPlayer.Should().Be("X");
        result.Status.Should().Be(GameStatus.InProgress);
        result.Winner.Should().BeNull();
        result.MoveHistory.Should().BeEmpty();
        result.Board.Should().OnlyContain(cell => cell == "");
    }

    [Fact]
    public void Reset_ShouldPreserveGameMode()
    {
        var game = CreateGame(GameMode.Computer);

        var result = gameService.Reset(game.GameId);

        result.Mode.Should().Be(GameMode.Computer);
        result.CurrentPlayer.Should().Be("X");
        result.Status.Should().Be(GameStatus.InProgress);
    }

    [Fact]
    public void Reset_ShouldCreateEmptyBoard()
    {
        var game = CreateGame();

        MakeMove(game.GameId, "X", 0, 0);

        var result = gameService.Reset(game.GameId);

        result.Board.Should().HaveCount(9);
        result.Board.Should().OnlyContain(cell => cell == "");
    }

    [Fact]
    public void Create_ShouldInitializeBoardWithNineCells()
    {
        var game = CreateGame();

        game.Board.Should().HaveCount(9);
    }
}