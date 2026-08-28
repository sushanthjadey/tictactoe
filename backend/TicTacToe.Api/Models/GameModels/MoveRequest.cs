namespace  TicTacToe.Api.Models.GameModels;
public record MoveRequest(
    string Player,
    int Row,
    int Column
);
