# Tic Tac Toe

A full-stack Tic Tac Toe application built as part of the Round 2 coding assessment.

The application supports **Two Player** and **Play Against Computer** modes. The Angular frontend provides the user interface, while the ASP.NET Core Web API manages game state, validates moves, applies game rules, handles move history and undo, and maintains the session scoreboard.

---

## 1. Project Overview

This project implements a browser-based Tic Tac Toe game on a standard **3 × 3 board**.

### Game Modes

* **Two Player Mode**

  * Player X and Player O play alternately.
  * Both players interact with the same board.

* **Play Against Computer Mode**

  * The human player controls X.
  * The computer controls O.
  * The backend automatically generates the computer's move after a valid X move.

### Additional Functionality

* Win detection
* Draw detection
* Winning-cell highlighting
* Move history
* Undo
* Session scoreboard
* Reset Game
* Reset Scoreboard
* REST API communication
* Backend validation
* Automated unit tests

---

## 2. Tech Stack

### Frontend

* Angular
* TypeScript
* HTML5
* SCSS
* RxJS
* Angular HttpClient

### Backend

* ASP.NET Core Web API
* C#
* .NET
* REST APIs
* Swagger / OpenAPI

### Testing

* xUnit
* .NET Test Framework

### Development Tools

* Node.js
* npm
* Angular CLI
* .NET CLI
* Git
* GitHub

---

## 3. Features Implemented

### Game Board

* Standard 3 × 3 Tic Tac Toe board.
* X and O player markers.
* Occupied cells cannot be selected again.
* Backend maintains the authoritative game state.

### Two Player Mode

Players alternate turns:

```text
X → O → X → O → ...
```

The backend validates that the correct player is making each move.

### Computer Mode

The human controls X and the computer controls O.

The computer follows this priority:

1. Win if possible.
2. Block X if X can win on the next move.
3. Take the center.
4. Take an available corner.
5. Take any remaining available cell.

### Win Detection

The backend detects:

* Horizontal wins
* Vertical wins
* Diagonal wins

Winning cells are returned by the API and highlighted in the UI.

### Draw Detection

If all nine cells are occupied and there is no winner, the game is marked as a draw.

### Move History

Every valid move records:

* Move number
* Player
* Row
* Column

### Undo

#### Two Player Mode

Undo removes the most recent move.

#### Computer Mode

Undo removes the human move and the corresponding computer move, returning the game to the previous human decision point.

#### Completed Games

Undo is disabled after a game has been completed.

### Scoreboard

The application tracks:

* X wins
* O wins
* Draws

The scoreboard persists while the backend process is running.

### Reset Game

Starts a new game without changing the scoreboard.

### Reset Scoreboard

Resets:

```text
X Wins = 0
O Wins = 0
Draws  = 0
```

### Backend Validation

The backend validates:

* Player
* Turn
* Row
* Column
* Cell availability
* Game status
* Computer-controlled player restrictions

---

## 4. How to Run the Backend Locally

### Prerequisites

Install the .NET SDK.

Verify the installation:

```bash
dotnet --version
```

### Start the Backend

Navigate to the API project:

```bash
cd backend/TicTacToe.Api
```

Restore dependencies:

```bash
dotnet restore
```

Run the application:

```bash
dotnet run
```

The backend runs on:

```text
http://localhost:5171
```

### Swagger

Swagger is available at:

```text
http://localhost:5171/swagger
```

---

## 5. How to Run the Frontend Locally

### Prerequisites

Install:

* Node.js
* npm
* Angular CLI

Verify the installation:

```bash
node --version
npm --version
ng version
```

### Install Dependencies

Navigate to the Angular project:

```bash
cd frontend/TicTacToe
```

Install packages:

```bash
npm install
```

### Start the Frontend

Run:

```bash
ng serve
```

The Angular application runs on:

```text
http://localhost:4200
```

Open the application in a browser:

```text
http://localhost:4200
```

### Backend API Configuration

The Angular application communicates with the backend using:

```typescript
private readonly apiUrl = 'http://localhost:5171/api';
```

This configuration is located in:

```text
src/app/game.service.ts
```

---

## 6. API Endpoint Summary

### API Base URL

```text
http://localhost:5171/api
```

### Create Game

```http
POST /api/games
```

Request:

```json
{
  "mode": "TwoPlayer"
}
```

or:

```json
{
  "mode": "Computer"
}
```

Creates a new game and returns the initial game state.

---

### Get Game

```http
GET /api/games/{gameId}
```

Returns the current game state.

Example:

```json
{
  "gameId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "board": [
    "X", "", "",
    "", "O", "",
    "", "", ""
  ],
  "currentPlayer": "X",
  "mode": "TwoPlayer",
  "status": "InProgress",
  "winner": null,
  "winningCells": [],
  "moveHistory": []
}
```

---

### Make Move

```http
POST /api/games/{gameId}/moves
```

Request:

```json
{
  "player": "X",
  "row": 0,
  "column": 1
}
```

Rows and columns are zero-based.

Example:

```text
0,0 | 0,1 | 0,2
----+-----+----
1,0 | 1,1 | 1,2
----+-----+----
2,0 | 2,1 | 2,2
```

In Computer Mode, a valid X move automatically triggers the backend to generate the O move.

---

### Undo

```http
POST /api/games/{gameId}/undo
```

Behaviour:

* Two Player Mode → removes one move.
* Computer Mode → removes the human and computer move pair.
* Completed games → undo is rejected.

---

### Reset Game

```http
POST /api/games/{gameId}/reset
```

Starts a new game using the same game mode.

The scoreboard is not reset.

---

### Get Scoreboard

```http
GET /api/scoreboard
```

Example response:

```json
{
  "xWins": 3,
  "oWins": 2,
  "draws": 1
}
```

---

### Reset Scoreboard

```http
POST /api/scoreboard/reset
```

Resets all scoreboard values to zero.

---

## 7. How to Run Tests

Navigate to the backend directory:

```bash
cd backend
```

Run all tests:

```bash
dotnet test
```

The tests cover the core game functionality, including:

* Valid moves
* Invalid moves
* Occupied cells
* Turn switching
* Row wins
* Column wins
* Diagonal wins
* Draw detection
* Completed-game validation
* Two Player undo
* Computer Mode undo
* Computer move selection
* Scoreboard behaviour
* Reset behaviour

---

## 8. AI Tools and Prompt Summary

AI tools were used as a development assistant during implementation.

### AI-Assisted Areas

AI assistance was used for:

* Project scaffolding
* Angular component structure
* ASP.NET Core API structure
* Models and DTOs
* Game-rule implementation
* Computer move strategy
* Unit-test scenarios
* Debugging TypeScript and Angular configuration issues
* Documentation

### Representative Prompts

```text
Create an Angular frontend for a Tic Tac Toe application with
Two Player and Computer modes.
```

```text
Implement an ASP.NET Core service that validates Tic Tac Toe moves,
detects row, column and diagonal wins, and detects draws.
```

```text
Implement computer move selection using the priority:
win, block, center, corner, any available cell.
```

```text
Implement undo behavior where Two Player mode removes one move
and Computer mode removes the human and computer move pair.
```

```text
Generate unit tests for valid moves, invalid moves, wins,
draws, undo and computer behaviour.
```

AI-generated code was reviewed, tested and adjusted manually before being used.

---

## 9. Design Decisions

### Backend as the Source of Truth

The backend owns:

* Board state
* Current player
* Game status
* Winner
* Winning cells
* Move history
* Computer moves
* Scoreboard

The Angular application is responsible primarily for presentation and user interaction.

This prevents clients from bypassing game rules through client-side state manipulation.

### REST API

The frontend communicates with the backend through REST endpoints.

Architecture:

```text
Angular Frontend
       |
       | HTTP / REST
       v
ASP.NET Core Web API
       |
       v
Game Service
       |
       v
Game State
```

### In-Memory Storage

Game and scoreboard data are stored in memory.

This keeps the implementation simple and focused on the assessment requirements.

### Computer Strategy

The computer uses the following deterministic priority:

```text
1. Win
2. Block
3. Center
4. Corner
5. Any available cell
```

### Undo Strategy

Undo is disabled after a game is completed.

This prevents completed game results from being retrospectively changed.

### Standalone Angular Architecture

The frontend uses Angular standalone components to keep the application lightweight and minimize unnecessary module configuration.

---

## 10. Clarifications and Assumptions

### Player Assignment

Two Player Mode:

```text
X → Player 1
O → Player 2
```

Computer Mode:

```text
X → Human
O → Computer
```

### Computer Control

The frontend cannot submit an O move in Computer Mode.

The backend generates the O move.

### Board Coordinates

API coordinates are zero-based:

```text
0,0 | 0,1 | 0,2
----+-----+----
1,0 | 1,1 | 1,2
----+-----+----
2,0 | 2,1 | 2,2
```

### Reset Game

Reset Game starts a new game but does not reset the scoreboard.

### Completed Games

Once a game reaches `Won` or `Draw`, additional moves are rejected.

### Persistence

No database is used.

Game and scoreboard data are stored in memory for the lifetime of the backend process.

---

## 11. Known Limitations

### In-Memory Storage

All games and scoreboard data are lost when the backend restarts.

### No Authentication

There is currently no:

* User authentication
* Authorization
* User account management
* Persistent player identity

### Single Session Scoreboard

The scoreboard represents the current backend session.

### Basic Computer AI

The computer uses a deterministic priority strategy rather than minimax.

### Local Multiplayer

Two Player Mode is designed for players using the same running application rather than separate browsers or devices.

### Development CORS

The backend is configured for local Angular development.

Production deployment should use environment-specific CORS configuration.

### Local API Configuration

The frontend currently uses:

```text
http://localhost:5171/api
```

A production deployment should use environment-specific API configuration.

---

## 12. Future Improvements

### Database Persistence

Add a database such as:

* SQL Server
* PostgreSQL
* SQLite

for persistent game and scoreboard data.

### Authentication

Add user authentication and persistent player statistics.

### Real-Time Multiplayer

Use SignalR or WebSockets to support players on separate browsers or devices.

### Advanced Computer AI

Implement minimax with alpha-beta pruning and difficulty levels:

```text
Easy
Medium
Hard
```

### Environment Configuration

Use separate configurations for:

```text
Development
Test
Production
```

### CI/CD

Add GitHub Actions to automatically:

* Restore dependencies
* Build the backend
* Build the frontend
* Run tests
* Publish artifacts

### Additional Automated Tests

Add:

* Angular component tests
* API integration tests
* End-to-end tests
* Computer strategy tests
* API error-response tests

### API Error Handling

Introduce centralized exception handling and a consistent API error response model.

### Observability

Add structured logging, health checks and application metrics.

---

## Project Structure

```text
TicTacToe/
│
├── backend/
│   │
│   ├── TicTacToe.Api/
│   │   ├── Controllers/
│   │   │   ├── GamesController.cs
│   │   │   └── ScoreboardController.cs
│   │   │
│   │   ├── Models/
│   │   │   └── GameModels.cs
│   │   │
│   │   ├── Services/
│   │   │   ├── GameService.cs
│   │   │   └── ScoreboardService.cs
│   │   │
│   │   └── Program.cs
│   │
│   └── TicTacToe.Tests/
│       └── GameServiceTests.cs
│
└── frontend/
    │
    └── TicTacToe/
        ├── src/
        │   ├── app/
        │   │   ├── app.component.ts
        │   │   ├── app.component.html
        │   │   ├── app.component.scss
        │   │   ├── game.models.ts
        │   │   └── game.service.ts
        │   │
        │   └── main.ts
        │
        ├── angular.json
        ├── package.json
        ├── tsconfig.json
        └── tsconfig.app.json
```

---

## Quick Start

### Backend

```bash
cd backend/TicTacToe.Api
dotnet restore
dotnet run
```

Backend:

```text
http://localhost:5171
```

Swagger:

```text
http://localhost:5171/swagger
```

### Frontend

```bash
cd frontend/TicTacToe
npm install
ng serve
```

Frontend:

```text
http://localhost:4200
```

### Tests

```bash
cd backend
dotnet test
```

---

## Application URLs

| Component            | URL                             |
| -------------------- | ------------------------------- |
| Angular Frontend     | `http://localhost:4200`         |
| ASP.NET Core Backend | `http://localhost:5171`         |
| Swagger              | `http://localhost:5171/swagger` |
| REST API             | `http://localhost:5171/api`     |

```
```
