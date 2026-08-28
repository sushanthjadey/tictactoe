using TicTacToe.Api.Models.GameModels;
namespace TicTacToe.Api.Services;

public class ScoreboardService: IScoreboardService
{
    private readonly Scoreboard scoreboard = new();

    Scoreboard IScoreboardService.Get()
    {
        return new Scoreboard
        {
            XWins = scoreboard.XWins,
            OWins = scoreboard.OWins,
            Draws = scoreboard.Draws
        };
    }

    void IScoreboardService.AddWin(string player)
    {
        if (player == "X")
            scoreboard.XWins++;

        if (player == "O")
            scoreboard.OWins++;
    }

    void IScoreboardService.AddDraw()
    {
        scoreboard.Draws++;
    }

    void IScoreboardService.Reset()
    {
        scoreboard.XWins = 0;
        scoreboard.OWins = 0;
        scoreboard.Draws = 0;
    }
}
