namespace  TicTacToe.Api.Models.GameModels;
public class GameState
{
    public Guid GameId { get; set; }

    public string[] Board { get; set; }
        = Enumerable.Repeat("", 9).ToArray();

    public string CurrentPlayer { get; set; } = "X";

    public GameMode Mode { get; set; }

    public GameStatus Status { get; set; }
        = GameStatus.InProgress;

    public string? Winner { get; set; }

    public List<int> WinningCells { get; set; } = [];

    public List<Move> MoveHistory { get; set; } = [];
}
