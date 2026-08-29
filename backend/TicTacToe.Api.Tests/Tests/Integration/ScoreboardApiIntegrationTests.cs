using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TicTacToe.Api.Models.GameModels;

namespace TicTacToe.Api.Tests.Integration;

public class ScoreboardApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public ScoreboardApiIntegrationTests(
        WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task GetScoreboard_ShouldReturnOk()
    {
        var response = await client.GetAsync(
            "/api/scoreboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var scoreboard =
            await response.Content.ReadFromJsonAsync<Scoreboard>();

        scoreboard.Should().NotBeNull();
    }

    [Fact]
    public async Task ResetScoreboard_ShouldReturnZeroScores()
    {
        var response = await client.PostAsync(
            "/api/scoreboard/reset",
            null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var scoreboard =
            await response.Content.ReadFromJsonAsync<Scoreboard>();

        scoreboard.Should().NotBeNull();
        scoreboard!.XWins.Should().Be(0);
        scoreboard.OWins.Should().Be(0);
        scoreboard.Draws.Should().Be(0);
    }

    [Fact]
    public async Task CompletedGame_ShouldUpdateScoreboard()
    {
        await client.PostAsync(
            "/api/scoreboard/reset",
            null);

        var createResponse = await client.PostAsJsonAsync(
            "/api/games",
            new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            await createResponse.Content.ReadFromJsonAsync<GameState>();

        game.Should().NotBeNull();

        await MakeMove(game!.GameId, "X", 0, 0);
        await MakeMove(game.GameId, "O", 1, 0);
        await MakeMove(game.GameId, "X", 0, 1);
        await MakeMove(game.GameId, "O", 1, 1);
        await MakeMove(game.GameId, "X", 0, 2);

        var response = await client.GetAsync(
            "/api/scoreboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var scoreboard =
            await response.Content.ReadFromJsonAsync<Scoreboard>();

        scoreboard.Should().NotBeNull();
        scoreboard!.XWins.Should().Be(1);
    }

    [Fact]
    public async Task ResetGame_ShouldNotResetScoreboard()
    {
        await client.PostAsync(
            "/api/scoreboard/reset",
            null);

        var createResponse = await client.PostAsJsonAsync(
            "/api/games",
            new CreateGameRequest(GameMode.TwoPlayer));

        var game =
            await createResponse.Content.ReadFromJsonAsync<GameState>();

        game.Should().NotBeNull();

        await MakeMove(game!.GameId, "X", 0, 0);
        await MakeMove(game.GameId, "O", 1, 0);
        await MakeMove(game.GameId, "X", 0, 1);
        await MakeMove(game.GameId, "O", 1, 1);
        await MakeMove(game.GameId, "X", 0, 2);

        await client.PostAsync(
            $"/api/games/{game.GameId}/reset",
            null);

        var response = await client.GetAsync(
            "/api/scoreboard");

        var scoreboard =
            await response.Content.ReadFromJsonAsync<Scoreboard>();

        scoreboard.Should().NotBeNull();
        scoreboard!.XWins.Should().Be(1);
    }

    private async Task MakeMove(
        Guid gameId,
        string player,
        int row,
        int column)
    {
        var response = await client.PostAsJsonAsync(
            $"/api/games/{gameId}/moves",
            new MoveRequest(player, row, column));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}