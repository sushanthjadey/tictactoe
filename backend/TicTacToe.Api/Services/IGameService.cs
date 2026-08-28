using TicTacToe.Api.Models.GameModels;

namespace TicTacToe.Api.Services;

public interface IGameService
{
    GameState Create(GameMode mode);
    GameState Get(Guid id);
    GameState MakeMove(Guid id, MoveRequest request);
    GameState Undo(Guid id);
    GameState Reset(Guid id);
}