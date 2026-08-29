using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Controllers;
using TicTacToe.Api.Models.GameModels;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Tests;

public class GameControllerTests
{
    private readonly GamesController controller;
    private readonly GameService gameService;
    private readonly ScoreboardService scoreboardService;

    public GameControllerTests()
    {
        scoreboardService = new ScoreboardService();
        gameService = new GameService(scoreboardService);
        controller = new GamesController(gameService);
    }

    private static MoveRequest Move(
        string player,
        int row,
        int column)
    {
        return new MoveRequest(player, row, column);
    }

    [Fact]
    public void Create_ShouldReturnOk()
    {
        var request = new CreateGameRequest(GameMode.TwoPlayer);

        var result = controller.Create(request);

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;

        okResult.Value.Should().BeOfType<GameState>();

        var game = (GameState)okResult.Value!;

        game.GameId.Should().NotBeEmpty();
        game.Mode.Should().Be(GameMode.TwoPlayer);
        game.CurrentPlayer.Should().Be("X");
        game.Status.Should().Be(GameStatus.InProgress);
    }

    [Fact]
    public void Create_ShouldCreateComputerGame()
    {
        var request = new CreateGameRequest(GameMode.Computer);

        var result = controller.Create(request);

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var game = (GameState)okResult.Value!;

        game.Mode.Should().Be(GameMode.Computer);
        game.CurrentPlayer.Should().Be("X");
    }

    [Fact]
    public void Get_ShouldReturnExistingGame()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var createdGame =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        var result = controller.Get(createdGame.GameId);

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var game = (GameState)okResult.Value!;

        game.GameId.Should().Be(createdGame.GameId);
    }

    [Fact]
    public void Get_ShouldReturnNotFoundForUnknownGame()
    {
        var result = controller.Get(Guid.NewGuid());

        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public void Move_ShouldReturnOkForValidMove()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        var result = controller.Move(
            game.GameId,
            Move("X", 0, 0));

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var updatedGame = (GameState)okResult.Value!;

        updatedGame.Board[0].Should().Be("X");
        updatedGame.CurrentPlayer.Should().Be("O");
    }

    [Fact]
    public void Move_ShouldReturnBadRequestForOccupiedCell()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        controller.Move(
            game.GameId,
            Move("X", 0, 0));

        var result = controller.Move(
            game.GameId,
            Move("O", 0, 0));

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public void Move_ShouldReturnBadRequestForWrongPlayer()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));


        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        var result = controller.Move(
            game.GameId,
            Move("O", 0, 0));

        result.Result.Should().BeOfType<BadRequestObjectResult>();

        var badRequest =
            (BadRequestObjectResult)result.Result!;

        badRequest.Value.Should().NotBeNull();
    }

    [Fact]
    public void Move_ShouldReturnBadRequestForInvalidPosition()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        var result = controller.Move(
            game.GameId,
            Move("X", -1, 0));

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public void Move_ShouldReturnNotFoundForUnknownGame()
    {
        var result = controller.Move(
            Guid.NewGuid(),
            Move("X", 0, 0));

        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public void Move_ShouldReturnBadRequestAfterGameCompletion()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        controller.Move(game.GameId, Move("X", 0, 0));
        controller.Move(game.GameId, Move("O", 1, 0));
        controller.Move(game.GameId, Move("X", 0, 1));
        controller.Move(game.GameId, Move("O", 1, 1));
        controller.Move(game.GameId, Move("X", 0, 2));

        var result = controller.Move(
            game.GameId,
            Move("O", 2, 2));

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public void Undo_ShouldReturnOk()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        controller.Move(
            game.GameId,
            Move("X", 0, 0));

        controller.Move(
            game.GameId,
            Move("O", 1, 1));

        var result = controller.Undo(game.GameId);

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var updatedGame = (GameState)okResult.Value!;

        updatedGame.Board[0].Should().Be("X");
        updatedGame.Board[4].Should().Be("");
        updatedGame.CurrentPlayer.Should().Be("O");
    }

    [Fact]
    public void Undo_ShouldReturnBadRequestWhenThereAreNoMoves()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        var result = controller.Undo(game.GameId);

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public void Undo_ShouldReturnBadRequestAfterGameCompletion()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        controller.Move(game.GameId, Move("X", 0, 0));
        controller.Move(game.GameId, Move("O", 1, 0));
        controller.Move(game.GameId, Move("X", 0, 1));
        controller.Move(game.GameId, Move("O", 1, 1));
        controller.Move(game.GameId, Move("X", 0, 2));

        var result = controller.Undo(game.GameId);

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public void Reset_ShouldReturnOk()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        controller.Move(
            game.GameId,
            Move("X", 0, 0));

        var result = controller.Reset(game.GameId);

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var resetGame = (GameState)okResult.Value!;

        resetGame.GameId.Should().NotBe(game.GameId);
        resetGame.CurrentPlayer.Should().Be("X");
        resetGame.Status.Should().Be(GameStatus.InProgress);
        resetGame.MoveHistory.Should().BeEmpty();
        resetGame.Board.Should().OnlyContain(cell => cell == "");
    }

    [Fact]
    public void Reset_ShouldPreserveGameMode()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.Computer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        var result = controller.Reset(game.GameId);

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var resetGame = (GameState)okResult.Value!;

        resetGame.Mode.Should().Be(GameMode.Computer);
    }

    [Fact]
    public void Reset_ShouldReturnBadRequestForUnknownGame()
    {
        var result = controller.Reset(Guid.NewGuid());

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public void ComputerModeMove_ShouldReturnGameWithComputerMove()
    {
        var createResult = controller.Create(new CreateGameRequest(GameMode.Computer));

        var game =
            (GameState)((OkObjectResult)createResult.Result!).Value!;

        var result = controller.Move(
            game.GameId,
            Move("X", 0, 0));

        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = (OkObjectResult)result.Result!;
        var updatedGame = (GameState)okResult.Value!;

        updatedGame.MoveHistory.Should().HaveCount(2);
        updatedGame.MoveHistory[0].Player.Should().Be("X");
        updatedGame.MoveHistory[1].Player.Should().Be("O");
    }
    
}