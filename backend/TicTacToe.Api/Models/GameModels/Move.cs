namespace  TicTacToe.Api.Models.GameModels;
public class Move
{
    public int Number { get; set; }
    public string Player { get; set; } = "";
    public int Row { get; set; }
    public int Column { get; set; }
}
