# Testing Strategy

The Tic Tac Toe application uses a layered testing strategy to validate business logic, controller behavior, and REST API integration.

The testing approach follows a test pyramid model. Most tests are implemented as fast and isolated unit tests, while controller tests validate API action behavior and a smaller number of integration tests validate the complete REST API flow.

```text
                 ┌──────────────────────────┐
                 │   Integration Tests      │
                 │                          │
                 │ HTTP API + Controllers   │
                 │ Routing + DI + JSON      │
                 └────────────┬─────────────┘
                              │
                   Small number of tests
                              │
                 ┌────────────▼─────────────┐
                 │    Controller Tests      │
                 │                          │
                 │ ActionResult / HTTP      │
                 │ exception mapping        │
                 └────────────┬─────────────┘
                              │
                 ┌────────────▼─────────────┐
                 │      Unit Tests          │
                 │                          │
                 │ Game rules               │
                 │ Undo                     │
                 │ Computer strategy        │
                 │ Scoreboard               │
                 └──────────────────────────┘
```

---

## Test Project Structure

```text
TicTacToe.Api.Tests/
├── Unit/
│   ├── GameServiceTests.cs
│   ├── UndoTests.cs
│   └── ScoreboardTests.cs
│
├── Controllers/
│   ├── GameControllerTests.cs
│   └── ScoreboardControllerTests.cs
│
└── Integration/
    ├── GameApiIntegrationTests.cs
    └── ScoreboardApiIntegrationTests.cs
```

---

## 1. Unit Tests

Unit tests validate the core application and business logic independently of HTTP communication.

The unit tests focus on game rules, state transitions, undo behavior, computer move selection, and scoreboard functionality.

### GameServiceTests.cs

The game service tests cover:

* Game creation
* Initial game state
* Initial board state
* 3 × 3 board initialization
* Initial player being X
* Two Player mode
* Computer mode
* Valid move
* Move history
* Move numbering
* Turn switching
* Invalid player validation
* Invalid row validation
* Invalid column validation
* Move by the wrong player
* Move on an occupied cell
* Move after game completion
* Row win detection
* Column win detection
* Diagonal win detection
* Winning cell identification
* Winner identification
* Draw detection
* Game completion status
* Scoreboard update after game completion
* Reset game
* New game ID after reset
* Board clearing during reset
* Move history clearing during reset
* Current player reset to X
* Preservation of game mode after reset

### UndoTests.cs

Undo tests cover:

* Undo when there are no moves
* Two Player undo
* Removing only the latest move in Two Player mode
* Restoring the correct player turn
* Restoring the board state
* Removing the latest move from move history
* Preserving previous moves
* Preserving move numbers
* Making a new move after undo
* Undo after a completed game
* Undo after a draw
* Computer mode undo
* Removing the human and computer moves together
* Restoring X's turn after computer-mode undo
* Restoring the board after computer-mode undo
* Restoring move history after computer-mode undo
* Ensuring undo does not modify the scoreboard

### ScoreboardTests.cs

Scoreboard tests cover:

* Initial scoreboard state
* X win tracking
* O win tracking
* Multiple X wins
* Multiple O wins
* Draw tracking
* Multiple draws
* Independent X, O, and draw tracking
* Invalid player handling
* Scoreboard reset
* Adding scores after reset
* Returning a copy of the scoreboard
* Ensuring one score type does not modify another

---

## 2. Controller Tests

Controller tests verify that controller actions correctly translate service results and exceptions into appropriate ASP.NET Core `ActionResult` responses.

These tests instantiate the controllers directly and do not start the ASP.NET Core HTTP server.

### GameControllerTests.cs

The following scenarios are covered:

* Creating a Two Player game
* Creating a Computer game
* Retrieving an existing game
* Handling an unknown game ID
* Submitting a valid move
* Handling an occupied cell
* Handling an incorrect player
* Handling an invalid board position
* Handling a move for an unknown game
* Handling a move after game completion
* Undoing a move
* Handling undo when there are no moves
* Handling undo after game completion
* Resetting a game
* Preserving game mode during reset
* Handling reset for an unknown game
* Verifying automatic computer moves

### ScoreboardControllerTests.cs

The following scenarios are covered:

* Getting the current scoreboard
* Returning the scoreboard using `OkObjectResult`
* Returning current X, O, and draw values
* Resetting the scoreboard
* Returning zero scores after reset
* Adding new scores after scoreboard reset

---

## 3. Integration Tests

Integration tests validate the actual REST API using:

* `WebApplicationFactory<Program>`
* `HttpClient`
* ASP.NET Core TestServer

Unlike controller tests, integration tests do not directly invoke controller methods.

They send actual HTTP requests through the ASP.NET Core application.

For example:

```csharp
var response = await client.PostAsJsonAsync(
    "/api/games",
    request);
```

The request goes through:

```text
HttpClient
    ↓
ASP.NET Core Test Server
    ↓
Routing
    ↓
Controller
    ↓
Dependency Injection
    ↓
GameService / ScoreboardService
    ↓
Game State
    ↓
JSON Serialization
    ↓
HTTP Response
```

### GameApiIntegrationTests.cs

The game API integration tests cover:

* `POST /api/games`
* Creating a Two Player game
* Creating a Computer game
* `GET /api/games/{id}`
* Retrieving an existing game
* Handling an unknown game ID
* `POST /api/games/{id}/moves`
* Submitting valid moves
* Verifying updated board state
* Verifying current player
* Verifying move history
* Rejecting occupied cells
* Rejecting moves from the wrong player
* Rejecting invalid board positions
* Detecting a win through the REST API
* Returning the winning player
* Returning winning cells
* `POST /api/games/{id}/undo`
* Restoring previous game state
* Rejecting undo when there are no moves
* `POST /api/games/{id}/reset`
* Creating a fresh game after reset
* Verifying reset board state
* Verifying reset move history
* Verifying reset current player
* Verifying Computer mode
* Verifying automatic computer move through the REST API

### ScoreboardApiIntegrationTests.cs

The scoreboard API integration tests cover:

* `GET /api/scoreboard`
* Retrieving scoreboard through HTTP
* `POST /api/scoreboard/reset`
* Resetting scoreboard through HTTP
* Verifying scoreboard update after a completed game
* Verifying Reset Game does not reset the scoreboard

---

# Test Coverage by Requirement

| Requirement                | Unit | Controller | Integration |
| -------------------------- | :--: | :--------: | :---------: |
| Create game                |   ✓  |      ✓     |      ✓      |
| Two Player mode            |   ✓  |      ✓     |      ✓      |
| Computer mode              |   ✓  |      ✓     |      ✓      |
| Valid move                 |   ✓  |      ✓     |      ✓      |
| Invalid move               |   ✓  |      ✓     |      ✓      |
| Turn switching             |   ✓  |      ✓     |      ✓      |
| Move history               |   ✓  |      ✓     |      ✓      |
| Move numbering             |   ✓  |            |             |
| Row win                    |   ✓  |            |      ✓      |
| Column win                 |   ✓  |            |             |
| Diagonal win               |   ✓  |            |             |
| Winning cells              |   ✓  |            |      ✓      |
| Winner identification      |   ✓  |            |      ✓      |
| Draw detection             |   ✓  |            |             |
| Move after completion      |   ✓  |      ✓     |             |
| Two Player undo            |   ✓  |      ✓     |      ✓      |
| Computer undo              |   ✓  |      ✓     |             |
| Undo after completion      |   ✓  |      ✓     |             |
| Undo after draw            |   ✓  |            |             |
| Move after undo            |   ✓  |            |             |
| Scoreboard X wins          |   ✓  |      ✓     |      ✓      |
| Scoreboard O wins          |   ✓  |      ✓     |             |
| Scoreboard draws           |   ✓  |      ✓     |             |
| Scoreboard reset           |   ✓  |      ✓     |      ✓      |
| Reset Game                 |   ✓  |      ✓     |      ✓      |
| Reset preserves scoreboard |   ✓  |            |      ✓      |
| Computer automatic move    |   ✓  |      ✓     |      ✓      |
| Computer strategy          |   ✓  |            |             |
| REST routing               |      |            |      ✓      |
| Dependency injection       |      |            |      ✓      |
| JSON serialization         |      |            |      ✓      |
| HTTP status codes          |      |      ✓     |      ✓      |

---

# Test Isolation

Each unit test creates its own service instances so that game and scoreboard state does not leak between tests.

Integration tests use the ASP.NET Core test host.

The application currently uses in-memory singleton services for session-level state. Therefore, integration tests explicitly reset the scoreboard where a clean scoreboard is required.

This keeps tests deterministic and prevents state from one test affecting another.

---

# Running Tests

All tests can be executed from the `backend` directory.

### Run all tests

```bash
dotnet test
```

### Run tests with normal output

```bash
dotnet test --verbosity normal
```

### Run only unit tests

```bash
dotnet test --filter "FullyQualifiedName~Unit"
```

### Run only controller tests

```bash
dotnet test --filter "FullyQualifiedName~Controllers"
```

### Run only integration tests

```bash
dotnet test --filter "FullyQualifiedName~Integration"
```

### Run a specific test class

```bash
dotnet test --filter "FullyQualifiedName~GameServiceTests"
```

For example:

```bash
dotnet test --filter "FullyQualifiedName~UndoTests"
```

---

# Undo Testing Decision

The application follows **Option A** from the requirements:

> Undo is disabled after a game has been completed.

Once a game is won or drawn, the scoreboard result is considered final.

The behavior is:

```text
Game In Progress
       ↓
Game Completed
       ↓
Scoreboard Updated
       ↓
Undo Requested
       ↓
Rejected
```

This approach avoids having to reverse a previously recorded scoreboard result and keeps scoreboard state consistent with completed games.

The behavior is covered by tests for both completed wins and draws.

---

# Test Philosophy

The testing strategy follows three levels of validation.

### Unit Tests

Validate:

* Business rules
* Game state transitions
* Move validation
* Win and draw detection
* Undo logic
* Computer strategy
* Scoreboard behavior

These tests are fast and isolated.

### Controller Tests

Validate:

* Controller actions
* `ActionResult` types
* HTTP-oriented response behavior
* Exception-to-response mapping

These tests verify the controller layer without requiring an HTTP server.

### Integration Tests

Validate:

* Actual REST endpoints
* Routing
* Dependency injection
* Controllers and services working together
* JSON request serialization
* JSON response deserialization
* HTTP status codes
* Complete API workflows

This layered approach provides a balance between execution speed and confidence in the application's behavior.

---

# Testing Before Submission

Before submitting the solution, run the following commands:

```bash
dotnet clean
dotnet build
dotnet test
```

The expected result is:

```text
Build succeeded.
Test Run Successful.
0 Failed.
```

All tests should pass before the solution is committed and pushed to GitHub.

---

# Known Testing Limitations

The current test suite focuses on backend business logic and REST API behavior.

The following are outside the scope of the backend integration tests:

* Angular DOM rendering
* Browser click interactions
* CSS and responsive layout
* Browser compatibility
* End-to-end browser automation

Frontend behavior is tested separately using Angular testing tools.

The backend currently uses in-memory storage, so the following are not covered:

* Database persistence
* Database connection failures
* Database migration failures
* Concurrent database access
* Data recovery after application restart

These can be addressed if persistent storage such as SQLite is introduced in the future.
