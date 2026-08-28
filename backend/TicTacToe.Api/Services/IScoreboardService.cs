using TicTacToe.Api.Models.GameModels;
namespace TicTacToe.Api.Services;

public interface IScoreboardService
{
    Scoreboard Get();
    void AddWin(string player);
    void AddDraw();
    void Reset();
}