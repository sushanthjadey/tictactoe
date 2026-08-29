using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TicTacToe.Api.Models.GameModels;

namespace TicTacToe.Api.Tests.Integration;

public class GameApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public GameApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateGame_ShouldReturnOk()
    {
        var request = new CreateGameRequest(GameMode.TwoPlayer);

        var response = await client.PostAsJsonAsync(
            "/api/games",
            request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var game = await response.Content.ReadFromJsonAsync<GameState>();

        game.Should().NotBeNull();
        game!.GameId.Should().NotBeEmpty();
        game.Mode.Should().Be(GameMode.TwoPlayer);
        game.CurrentPlayer.Should().Be("X");
        game.Status.Should().Be(GameStatus.InProgress);
        game.Board.Should().HaveCount(9);
    }

    [Fact]
    public async Task GetGame_ShouldReturnCreatedGame()
    {
        var createRequest = new CreateGameRequest(GameMode.TwoPlayer);

        var createResponse = await client.PostAsJsonAsync(
            "/api/games",
            createRequest);

        var createdGame =
            await createResponse.Content.ReadFromJsonAsync<GameState>();

        createdGame.Should().NotBeNull();

        var response = await client.GetAsync(
            $"/api/games/{createdGame!.GameId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var game =
            await response.Content.ReadFromJsonAsync<GameState>();

        game.Should().NotBeNull();
        game!.GameId.Should().Be(createdGame.GameId);
    }

    [Fact]
    public async Task GetGame_ShouldReturnNotFoundForUnknownGame()
    {
        var response = await client.GetAsync(
            $"/api/games/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task MakeMove_ShouldReturnUpdatedGame()
    {
        var game = await CreateGame();

        var request = new MoveRequest("X", 0, 0);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.GameId}/moves",
            request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result =
            await response.Content.ReadFromJsonAsync<GameState>();

        result.Should().NotBeNull();
        result!.Board[0].Should().Be("X");
        result.CurrentPlayer.Should().Be("O");
        result.MoveHistory.Should().HaveCount(1);
    }

    [Fact]
    public async Task MakeMove_ShouldRejectOccupiedCell()
    {
        var game = await CreateGame();

        var firstMove = new MoveRequest("X", 0, 0);

        await client.PostAsJsonAsync(
            $"/api/games/{game.GameId}/moves",
            firstMove);

        var secondMove = new MoveRequest("O", 0, 0);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.GameId}/moves",
            secondMove);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task MakeMove_ShouldRejectWrongPlayer()
    {
        var game = await CreateGame();

        var request = new MoveRequest("O", 0, 0);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.GameId}/moves",
            request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task MakeMove_ShouldRejectInvalidPosition()
    {
        var game = await CreateGame();

        var request = new MoveRequest("X", -1, 0);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.GameId}/moves",
            request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task MakeMove_ShouldDetectWin()
    {
        var game = await CreateGame();

        await MakeMove(game.GameId, "X", 0, 0);
        await MakeMove(game.GameId, "O", 1, 0);
        await MakeMove(game.GameId, "X", 0, 1);
        await MakeMove(game.GameId, "O", 1, 1);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.GameId}/moves",
            new MoveRequest("X", 0, 2));

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result =
            await response.Content.ReadFromJsonAsync<GameState>();

        result.Should().NotBeNull();
        result!.Status.Should().Be(GameStatus.Won);
        result.Winner.Should().Be("X");
        result.WinningCells.Should().BeEquivalentTo(new[] { 0, 1, 2 });
    }

    [Fact]
    public async Task Undo_ShouldRestorePreviousState()
    {
        var game = await CreateGame();

        await MakeMove(game.GameId, "X", 0, 0);
        await MakeMove(game.GameId, "O", 1, 1);

        var response = await client.PostAsync(
            $"/api/games/{game.GameId}/undo",
            null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result =
            await response.Content.ReadFromJsonAsync<GameState>();

        result.Should().NotBeNull();
        result!.Board[0].Should().Be("X");
        result.Board[4].Should().Be("");
        result.CurrentPlayer.Should().Be("O");
        result.MoveHistory.Should().HaveCount(1);
    }

    [Fact]
    public async Task Undo_ShouldReturnBadRequestWhenNoMovesExist()
    {
        var game = await CreateGame();

        var response = await client.PostAsync(
            $"/api/games/{game.GameId}/undo",
            null);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Reset_ShouldCreateFreshGame()
    {
        var game = await CreateGame();

        await MakeMove(game.GameId, "X", 0, 0);
        await MakeMove(game.GameId, "O", 1, 1);

        var response = await client.PostAsync(
            $"/api/games/{game.GameId}/reset",
            null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result =
            await response.Content.ReadFromJsonAsync<GameState>();

        result.Should().NotBeNull();
        result!.GameId.Should().NotBe(game.GameId);
        result.CurrentPlayer.Should().Be("X");
        result.Status.Should().Be(GameStatus.InProgress);
        result.MoveHistory.Should().BeEmpty();
        result.Board.Should().OnlyContain(cell => cell == "");
    }

    [Fact]
    public async Task CreateGame_ComputerMode_ShouldReturnComputerGame()
    {
        var request = new CreateGameRequest(GameMode.Computer);

        var response = await client.PostAsJsonAsync(
            "/api/games",
            request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var game =
            await response.Content.ReadFromJsonAsync<GameState>();

        game.Should().NotBeNull();
        game!.Mode.Should().Be(GameMode.Computer);
        game.CurrentPlayer.Should().Be("X");
    }

    [Fact]
    public async Task ComputerMode_ShouldMakeAutomaticMove()
    {
        var game = await CreateGame(GameMode.Computer);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.GameId}/moves",
            new MoveRequest("X", 0, 0));

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result =
            await response.Content.ReadFromJsonAsync<GameState>();

        result.Should().NotBeNull();
        result!.MoveHistory.Should().HaveCount(2);
        result.MoveHistory[0].Player.Should().Be("X");
        result.MoveHistory[1].Player.Should().Be("O");
    }

    private async Task<GameState> CreateGame(
        GameMode mode = GameMode.TwoPlayer)
    {
        var response = await client.PostAsJsonAsync(
            "/api/games",
            new CreateGameRequest(mode));  

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var game =
            await response.Content.ReadFromJsonAsync<GameState>();

        game.Should().NotBeNull();

        return game!;
    }

    private async Task<GameState> MakeMove(
        Guid gameId,
        string player,
        int row,
        int column)
    {
        var response = await client.PostAsJsonAsync(
            $"/api/games/{gameId}/moves",
            new MoveRequest(player, row, column));

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var game =
            await response.Content.ReadFromJsonAsync<GameState>();

        game.Should().NotBeNull();

        return game!;
    }
}