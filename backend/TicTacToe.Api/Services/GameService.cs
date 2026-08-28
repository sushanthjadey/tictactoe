using TicTacToe.Api.Models.GameModels;

namespace TicTacToe.Api.Services;

public class GameService: IGameService
{
    private readonly Dictionary<Guid, GameState> games = [];
    private readonly IScoreboardService scoreboard;

    private static readonly int[][] WinningLines =
    {
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6]
    };

    public GameService(IScoreboardService scoreboard)
    {
        this.scoreboard = scoreboard;
    }


    GameState IGameService.Create(GameMode mode)
    {
        return Create(mode);
    }

    GameState IGameService.Get(Guid id)
    {
        return Get(id);
    }

    GameState IGameService.MakeMove(Guid id, MoveRequest request)
    {
        var game = Get(id);

        ValidateMove(game, request);

        ApplyMove(
            game,
            request.Player,
            request.Row,
            request.Column);

        if (game.Mode == GameMode.Computer &&
            game.Status == GameStatus.InProgress &&
            game.CurrentPlayer == "O")
        {
            int computerMove =  GetComputerMove(game);

            if (computerMove != -1)
            {
                int row = computerMove / 3;
                int column = computerMove % 3;

                ApplyMove(game, "O", row, column);
            }
        }

        return game;
    }

    private GameState Get(Guid id)
    {
        if (!games.ContainsKey(id))
            throw new KeyNotFoundException("Game not found.");

        return games[id];
    }
    
    private GameState Create(GameMode mode)
    {
        var game = new GameState
        {
            GameId = Guid.NewGuid(),
            Mode = mode,
            Board = Enumerable.Repeat("", 9).ToArray(),
            CurrentPlayer = "X",
            Status = GameStatus.InProgress
        };

        games[game.GameId] = game;

        return game;
    }
    private static void ValidateMove(GameState game, MoveRequest request)
    {
        if (game.Status != GameStatus.InProgress)
            throw new InvalidOperationException(
                "Game is already completed.");

        if (request.Player != "X" &&
            request.Player != "O")
            throw new InvalidOperationException(
                "Invalid player.");

        if (request.Row < 0 ||
            request.Row > 2 ||
            request.Column < 0 ||
            request.Column > 2)
            throw new InvalidOperationException(
                "Invalid board position.");

        if (request.Player != game.CurrentPlayer)
            throw new InvalidOperationException(
                $"It is {game.CurrentPlayer}'s turn.");

        if (game.Mode == GameMode.Computer &&
            request.Player == "O")
            throw new InvalidOperationException(
                "O is controlled by computer.");

        int index = request.Row * 3 + request.Column;

        if (game.Board[index] != "")
            throw new InvalidOperationException(
                "Cell is already occupied.");
    }

    private void ApplyMove(GameState game, string player, int row, int column)
    {
        int index = row * 3 + column;

        game.Board[index] = player;

        game.MoveHistory.Add(
            new Move
            {
                Number = game.MoveHistory.Count + 1,
                Player = player,
                Row = row,
                Column = column
            });

        var winningLine =
            FindWinningLine(game.Board);

        if (winningLine != null)
        {
            game.Status = GameStatus.Won;
            game.Winner = player;
            game.WinningCells =
                winningLine.ToList();

            scoreboard.AddWin(player);

            return;
        }

        if (game.Board.All(cell => cell != ""))
        {
            game.Status = GameStatus.Draw;

            scoreboard.AddDraw();

            return;
        }

        game.CurrentPlayer =  player == "X" ? "O" : "X";
    }

    private int[]? FindWinningLine(string[] board)
    {
        foreach (var line in WinningLines)
        {
            if (!string.IsNullOrEmpty(board[line[0]]) &&
                board[line[0]] == board[line[1]] &&
                board[line[1]] == board[line[2]])
            {
                return line;
            }
        }

        return null;
    }

    private int GetComputerMove(GameState game)
    {
        int winningMove = FindTacticalMove(game.Board, "O");

        if (winningMove != -1)
            return winningMove;

        int blockingMove = FindTacticalMove(game.Board, "X");

        if (blockingMove != -1)
            return blockingMove;

        if (game.Board[4] == "")
            return 4;

        int[] corners =
        {
            0, 2, 6, 8
        };

        foreach (var corner in corners)
        {
            if (game.Board[corner] == "")
                return corner;
        }

        for (int i = 0; i < 9; i++)
        {
            if (game.Board[i] == "")
                return i;
        }

        return -1;
    }

    private int FindTacticalMove(string[] board, string player)
    {
        foreach (var line in WinningLines)
        {
            int playerCount = 0;
            int emptyIndex = -1;

            foreach (var index in line)
            {
                if (board[index] == player)
                    playerCount++;

                if (board[index] == "")
                    emptyIndex = index;
            }

            if (playerCount == 2 &&
                emptyIndex != -1)
            {
                return emptyIndex;
            }
        }

        return -1;
    }

    public GameState Undo(Guid id)
    {
        var game = Get(id);

        if (game.Status != GameStatus.InProgress)
            throw new InvalidOperationException(
                "Undo is disabled after game completion.");

        if (game.MoveHistory.Count == 0)
            throw new InvalidOperationException(
                "No moves to undo.");

        int numberOfMoves = game.Mode == GameMode.Computer
                ? Math.Min(2, game.MoveHistory.Count)
                : 1;

        for (int i = 0; i < numberOfMoves; i++)
        {
            var move = game.MoveHistory[^1];

            int index =  move.Row * 3 + move.Column;

            game.Board[index] = "";

            game.MoveHistory.RemoveAt(game.MoveHistory.Count - 1);
        }

        game.Status =  GameStatus.InProgress;

        game.Winner = null;

        game.WinningCells.Clear();

        if (game.Mode == GameMode.Computer)
        {
            game.CurrentPlayer = "X";
        }
        else
        {
            game.CurrentPlayer =
                game.MoveHistory.Count % 2 == 0
                    ? "X"
                    : "O";
        }

        return game;
    }

    GameState IGameService.Reset(Guid id)
    {
        var oldGame = Get(id);

        var newGame = Create(oldGame.Mode);

        games.Remove(id);

        return newGame;
    }
}
