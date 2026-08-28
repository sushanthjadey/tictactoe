using TicTacToe.Api.Models.GameModels;
namespace TicTacToe.Api.Services;

public class ScoreboardService
{
    private readonly Scoreboard scoreboard = new();

    public Scoreboard Get()
    {
        return new Scoreboard
        {
            XWins = scoreboard.XWins,
            OWins = scoreboard.OWins,
            Draws = scoreboard.Draws
        };
    }

    public void AddWin(string player)
    {
        if (player == "X")
            scoreboard.XWins++;

        if (player == "O")
            scoreboard.OWins++;
    }

    public void AddDraw()
    {
        scoreboard.Draws++;
    }

    public void Reset()
    {
        scoreboard.XWins = 0;
        scoreboard.OWins = 0;
        scoreboard.Draws = 0;
    }
}