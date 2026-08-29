# Tic Tac Toe – Angular Frontend

Angular frontend for the Tic Tac Toe application.

The frontend provides the user interface for playing Tic Tac Toe in **Two Player Mode** or **Play Against Computer Mode**. All game state and game rules are managed by the .NET backend, which acts as the source of truth.

---

## 1. Project Overview

The application is a browser-based Tic Tac Toe game built using:

* Angular
* TypeScript
* REST APIs
* RxJS
* Vitest
* .NET Web API backend

The Angular application is responsible for:

* Rendering the game board
* Handling user interactions
* Displaying the current player
* Displaying game status
* Displaying move history
* Providing Undo and Reset controls
* Displaying the scoreboard
* Switching between game modes
* Communicating with the backend through REST APIs

The backend is responsible for:

* Game session state
* Move validation
* Turn management
* Win detection
* Draw detection
* Move history
* Undo processing
* Computer move selection
* Scoreboard state

### Source of Truth

The backend is the source of truth for the game.

The frontend does not independently calculate or persist game results. After a game operation, the frontend updates its state using the latest response returned by the backend.

---

# 2. Technology Stack

| Area                 | Technology              |
| -------------------- | ----------------------- |
| Framework            | Angular                 |
| Language             | TypeScript              |
| HTTP Communication   | Angular HttpClient      |
| Reactive Programming | RxJS                    |
| Testing Framework    | Vitest                  |
| Test Utilities       | Angular TestBed         |
| Assertions           | Vitest                  |
| Styling              | CSS                     |
| Backend              | .NET Web API            |
| API Style            | REST                    |
| Storage              | In-memory backend state |

---

# 3. Frontend Architecture

The frontend follows a simple component/service architecture.

```text
                         Browser
                            |
                            v
                  ┌───────────────────┐
                  │   Angular App     │
                  └─────────┬─────────┘
                            |
             ┌──────────────┴──────────────┐
             |                             |
             v                             v
      ┌──────────────┐              ┌──────────────┐
      │ Game         │              │ UI Components│
      │ Component    │              │              │
      └──────┬───────┘              └──────────────┘
             |
             v
      ┌──────────────┐
      │ GameService  │
      └──────┬───────┘
             |
             | HTTP / REST
             v
      ┌──────────────────┐
      │ .NET Web API     │
      └────────┬─────────┘
               |
               v
      ┌──────────────────┐
      │ Backend Services │
      │                  │
      │ GameService      │
      │ ScoreboardService│
      └──────────────────┘
```

---

# 4. Frontend Folder Structure

The frontend is organized into components, models and core services.

```text
src/
└── app/
    ├── components/
    │   ├── board/
    │   │   ├── board.ts
    │   │   ├── board.html
    │   │   ├── board.css
    │   │   └── board.spec.ts
    │   │
    │   ├── game/
    │   │   ├── game.ts
    │   │   ├── game.html
    │   │   ├── game.css
    │   │   └── game.spec.ts
    │   │
    │   ├── move-history/
    │   │   ├── move-history.ts
    │   │   ├── move-history.html
    │   │   ├── move-history.css
    │   │   └── move-history.spec.ts
    │   │
    │   ├── scoreboard/
    │   │   ├── scoreboard.ts
    │   │   ├── scoreboard.html
    │   │   ├── scoreboard.css
    │   │   └── scoreboard.spec.ts
    │   │
    │   └── status/
    │       ├── status.ts
    │       ├── status.html
    │       ├── status.css
    │       └── status.spec.ts
    │
    └── core/
        ├── models/
        │   └── game models
        │
        └── services/
            ├── game.ts
            ├── game.spec.ts
            ├── scoreboard.ts
            └── scoreboard.spec.ts
```

The exact generated Angular files may vary slightly depending on the Angular CLI version.

---

# 5. Component Responsibilities

## Game Component

The `Game` component acts as the main orchestration component.

Responsibilities include:

* Creating a new game
* Selecting game mode
* Handling cell clicks
* Calling the game service
* Handling Undo
* Handling Reset Game
* Maintaining UI loading states
* Displaying errors
* Updating the current game state
* Coordinating child components

The Game component does **not** implement the actual Tic Tac Toe rules.

The backend remains responsible for validating and processing moves.

---

## Board Component

The Board component is responsible for displaying the 3 × 3 board.

Responsibilities:

* Display nine cells
* Display X/O values
* Handle cell clicks
* Highlight winning cells
* Disable unavailable cells
* Emit the selected cell to the parent Game component

Conceptually:

```text
Game
 |
 +---- Board
        |
        +---- Cell 0
        +---- Cell 1
        +---- Cell 2
        +---- ...
        +---- Cell 8
```

---

## Move History Component

Displays the moves made during the current game.

Each move contains:

* Move number
* Player
* Row
* Column

Example:

```text
#   Player   Position
1   X        Row 1, Column 1
2   O        Row 2, Column 2
```

The component receives the move history from the Game component.

---

## Scoreboard Component

Displays the session-level scoreboard:

```text
X Wins    O Wins    Draws
   2         1         3
```

The scoreboard is retrieved from the backend.

The frontend does not independently calculate scoreboard values.

---

## Status Component

Displays the current game status.

Examples:

```text
X's Turn
```

```text
O's Turn
```

```text
X Wins!
```

```text
Game Draw
```

It can also display the relevant game information such as the current game ID.

---

# 6. Service Layer

## Game Service

The Angular Game Service is responsible for communication with the game REST APIs.

Typical operations include:

```text
createGame()
getGame()
makeMove()
undo()
resetGame()
```

The service uses Angular's `HttpClient`.

Example communication flow:

```text
User clicks cell
       |
       v
Game Component
       |
       v
Game Service
       |
       | HTTP POST
       v
.NET API
       |
       v
Updated GameState
       |
       v
Game Service
       |
       v
Game Component
       |
       v
UI updated
```

---

## Scoreboard Service

The Scoreboard Service communicates with the scoreboard API.

Responsibilities:

* Retrieve scoreboard
* Reset scoreboard

The backend owns the scoreboard state.

---

# 7. Backend API Integration

The frontend communicates with the .NET backend through REST APIs.

Typical endpoints:

| Method | Endpoint                | Purpose          |
| ------ | ----------------------- | ---------------- |
| POST   | `/api/games`            | Create game      |
| GET    | `/api/games/{id}`       | Get game         |
| POST   | `/api/games/{id}/moves` | Make move        |
| POST   | `/api/games/{id}/undo`  | Undo             |
| POST   | `/api/games/{id}/reset` | Reset game       |
| GET    | `/api/scoreboard`       | Get scoreboard   |
| POST   | `/api/scoreboard/reset` | Reset scoreboard |

The frontend sends requests and renders the response returned by the backend.

---

# 8. Game State Flow

A typical move follows this flow:

```text
User clicks cell
       |
       v
Game Component
       |
       v
Validate UI state
       |
       v
Game Service
       |
       | POST /api/games/{id}/moves
       v
.NET Backend
       |
       +---- Validate move
       |
       +---- Apply move
       |
       +---- Detect winner/draw
       |
       +---- Update scoreboard
       |
       +---- Computer move if applicable
       |
       v
GameState response
       |
       v
Angular Game Component
       |
       v
Board / Status / History / Scoreboard
```

---

# 9. Error Handling

The frontend handles errors returned by the backend.

Examples include:

* Invalid move
* Occupied cell
* Wrong player
* Game already completed
* Invalid game session
* Network/API failure

The frontend displays an appropriate error message and restores the UI to a usable state.

Loading flags are used for operations such as:

```text
Making move...
Resetting...
```

This prevents duplicate user actions while an API request is in progress.

---

# 10. Game Modes

The frontend supports two modes.

## Two Player Mode

```text
Player X → Human
Player O → Human
```

Players alternate turns.

Undo removes one move.

---

## Computer Mode

```text
Player X → Human
Player O → Computer
```

After the human player's move:

```text
Human X
   |
   v
Backend
   |
   v
Computer O
```

The computer move is generated by the backend.

The frontend does not implement the computer strategy.

---

# 11. Undo Behavior

Undo behavior depends on the game mode.

### Two Player Mode

Undo removes one move.

```text
X → O → Undo

Result:

X
O removed
O's turn
```

### Computer Mode

Undo removes the human and computer move pair.

```text
X → O Computer → Undo

Result:

Both moves removed
X's turn
```

Undo is disabled when:

* There are no moves
* The game is being processed
* The game has already completed

The implementation follows the selected backend behavior where Undo is disabled after a completed game.

---

# 12. Testing Strategy

The frontend uses **Vitest** with Angular's testing utilities.

The objective is to test:

* Component behavior
* UI rendering
* User interaction
* Service/API interaction
* Loading states
* Error handling
* Child component behavior

The frontend tests are intentionally separated from backend game-rule tests.

```text
                 Frontend Tests
                       |
        ┌──────────────┼──────────────┐
        |              |              |
        v              v              v
   Component       Service/API     UI behavior
     Tests            Tests           Tests
        |              |              |
        v              v              v
    Game/Board      HTTP mocks      Rendering
    Status          Responses       Buttons
    History         Errors          States
    Scoreboard      Success         Events
```

The backend separately tests the authoritative game rules and state transitions.

---

# 13. Frontend Tests Covered

## Game Component Tests

The Game component tests cover areas such as:

* Component creation
* Initial game creation
* Game state loading
* Game mode selection
* Two Player mode
* Computer mode
* Cell click handling
* Move submission
* Current player handling
* Completed game handling
* Winner handling
* Draw handling
* Winning cells
* Move history updates
* Undo behavior
* Reset Game behavior
* Reset Scoreboard behavior
* Loading states
* Button disabled states
* Error handling
* API service interaction
* Game state refresh after operations

---

## Board Component Tests

Board tests cover:

* Board rendering
* Nine cells
* Empty cell rendering
* X rendering
* O rendering
* Occupied cell behavior
* Cell click events
* Winning cell highlighting
* Non-winning cell behavior
* Disabled cells
* Completed game behavior
* Correct row/column positioning
* Event emission to parent component

---

## Move History Tests

Move History tests cover:

* Rendering move history
* Move numbers
* Player names
* Row/column positions
* Empty history
* Multiple moves
* Correct ordering
* Undo-related history state
* Button state
* Interaction events

---

## Scoreboard Component Tests

Scoreboard tests cover:

* Initial scoreboard
* X wins
* O wins
* Draws
* Rendering updated values
* Reset scoreboard interaction
* Button behavior
* Service interaction
* API response handling

---

## Status Component Tests

Status tests cover:

* In-progress state
* X turn
* O turn
* Won state
* Draw state
* Winner display
* Appropriate status text

---

## Frontend Game Service Tests

Service tests cover REST API interaction such as:

* Creating a game
* Getting a game
* Making a move
* Undo
* Reset game
* Correct HTTP method
* Correct endpoint
* Request payload
* Response handling
* API errors

These tests mock HTTP/API behavior rather than requiring the .NET backend to be running.

---

# 14. Why API Calls Are Mocked in Unit Tests

Frontend unit tests should not depend on a running backend.

For example:

```text
GameComponent
     |
     v
Mock GameService
     |
     v
Mock Observable
```

This provides:

* Fast tests
* Deterministic tests
* No dependency on backend availability
* No dependency on network connectivity
* Easier failure diagnosis

End-to-end or integration testing can be used separately to validate the actual Angular-to-.NET communication.

---

# 15. Running the Frontend

## Prerequisites

Install:

* Node.js
* npm
* Angular CLI

Verify:

```powershell
node --version
npm --version
ng version
```

---

# 16. Install Dependencies

Navigate to the frontend project:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

If the project uses the Vitest V8 coverage provider, make sure it is installed:

```powershell
npm install -D @vitest/coverage-v8
```

---

# 17. Configure Backend URL

The Angular application needs to point to the locally running .NET API.

For example:

```text
http://localhost:5000
```

or whatever URL/port is configured by the backend.

The API URL should be configured in the Angular environment/configuration rather than hard-coded throughout components.

---

# 18. Start the Angular Application

Run:

```powershell
ng serve
```

The application will normally be available at:

```text
http://localhost:4200
```

The exact port can vary if another application is already using port 4200.

---

# 19. Start the Backend

The .NET backend must also be running.

From the backend directory:

```powershell
dotnet run
```

Use the API URL configured in the Angular application.

The overall local setup is:

```text
Browser
   |
   | http://localhost:4200
   v
Angular
   |
   | REST API
   |
   | http://localhost:<api-port>
   v
.NET Web API
```

---

# 20. Running Frontend Tests

Run all frontend tests:

```powershell
ng test
```

For a single non-watch execution:

```powershell
ng test --watch=false
```

This is recommended for CI/submission verification.

---

# 21. Run a Specific Test File

For example, to run only Game component tests:

```powershell
ng test --watch=false --include="src/app/components/game/game.spec.ts"
```

For Board:

```powershell
ng test --watch=false --include="src/app/components/board/board.spec.ts"
```

For Move History:

```powershell
ng test --watch=false --include="src/app/components/move-history/move-history.spec.ts"
```

---

# 22. Save Test Results to a Log

PowerShell can save the complete test output:

```powershell
ng test --watch=false 2>&1 | Tee-Object -FilePath test-results.log
```

This allows the output to be:

* Viewed in the terminal
* Saved to `test-results.log`

For Game component debugging:

```powershell
ng test --watch=false --include="src/app/components/game/game.spec.ts" 2>&1 | Tee-Object -FilePath game-test-results.log
```

---

# 23. Code Coverage

The project uses Vitest's V8 coverage provider.

First install the coverage package if required:

```powershell
npm install -D @vitest/coverage-v8
```

Run coverage:

```powershell
ng test --watch=false --coverage
```

Coverage normally generates a:

```text
coverage/
```

directory.

The HTML report can normally be opened at:

```text
coverage/index.html
```

From PowerShell:

```powershell
Start-Process .\coverage\index.html
```

---

# 24. Coverage Metrics

The coverage report provides metrics such as:

```text
Statements
Branches
Functions
Lines
```

Coverage should be interpreted together with test quality.

High coverage does not automatically mean high-quality tests.

The goal is to cover important application behavior and meaningful failure paths.

---

# 25. Recommended Test Workflow

For development:

```powershell
ng test
```

For final verification:

```powershell
ng test --watch=false
```

For final coverage:

```powershell
ng test --watch=false --coverage
```

For troubleshooting:

```powershell
ng test --watch=false 2>&1 | Tee-Object -FilePath test-results.log
```

Recommended workflow:

```text
Run tests
   |
   v
Fix failures
   |
   v
Confirm 0 failed tests
   |
   v
Run coverage
   |
   v
Review coverage/index.html
   |
   v
Review important uncovered code
```

---

# 26. Testing Architecture

The overall application testing strategy is divided into three levels.

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

For the Angular frontend, the primary focus is component and service unit testing.

The .NET backend contains the authoritative game-rule tests and API/controller tests.

---

# 27. Frontend vs Backend Testing Responsibility

| Area                       | Frontend        | Backend       |
| -------------------------- | --------------- | ------------- |
| Board rendering            | Yes             | No            |
| Button behavior            | Yes             | No            |
| Component state            | Yes             | No            |
| User interaction           | Yes             | No            |
| HTTP service calls         | Yes             | No            |
| Move validation            | No              | Yes           |
| Turn validation            | No              | Yes           |
| Win detection              | No              | Yes           |
| Draw detection             | No              | Yes           |
| Computer strategy          | No              | Yes           |
| Move history rules         | Display         | Authoritative |
| Undo rules                 | UI behavior     | Authoritative |
| Scoreboard rules           | Display         | Authoritative |
| REST controller behavior   | Service mocking | Yes           |
| End-to-end API integration | Optional        | Optional      |

This separation avoids duplicating business rules between frontend and backend.

---

# 28. Design Decisions

## Backend as Source of Truth

Game rules are deliberately kept in the backend.

This prevents the frontend and backend from maintaining separate versions of:

* Turn state
* Winner state
* Draw state
* Move history
* Scoreboard
* Computer strategy

---

## Thin Frontend

The Angular application primarily handles:

```text
Presentation
Interaction
API communication
UI state
```

rather than duplicating business logic.

---

## Service-Based API Communication

Components communicate with the backend through Angular services.

This avoids putting HTTP calls directly into every component and makes the services easier to mock during testing.

---

## Component Separation

The UI is separated into focused components:

```text
Game
 ├── Board
 ├── Status
 ├── Move History
 └── Scoreboard
```

This improves:

* Maintainability
* Testability
* Separation of concerns
* Reusability

---

# 29. Loading State

The UI prevents duplicate operations while an API request is in progress.

Examples:

```text
Making move...
Resetting...
```

Buttons may be disabled during these operations.

This prevents multiple requests from being submitted accidentally.

---

# 30. Error Handling

API errors are surfaced to the user through the Game component.

Typical errors include:

```text
Invalid move
Cell is already occupied
It is O's turn
Game is already completed
Game not found
```

The frontend does not attempt to independently override backend validation.

---

# 31. Known Limitations

The current frontend has the following limitations:

* The backend uses in-memory state, so game state is lost when the backend restarts.
* The application is designed for local execution.
* Authentication and authorization are not implemented.
* There is no persistent user account/session management.
* Computer strategy is implemented by the backend and is intentionally basic.
* No real-time multiplayer communication is implemented.
* Automated browser end-to-end testing is not currently included.
* Production deployment configuration is outside the scope of this assessment.

---

# 32. Future Improvements

Potential improvements include:

* Add Playwright/Cypress end-to-end tests
* Add CI pipeline for frontend tests
* Publish coverage reports from CI
* Add environment-specific API configuration
* Add centralized HTTP error handling
* Add stronger accessibility support
* Add keyboard navigation
* Add animations for moves
* Add persistent backend storage
* Add authenticated multiplayer games
* Add real-time multiplayer using SignalR/WebSockets
* Add stronger computer AI such as Minimax
* Add responsive/mobile-specific UX improvements

---

# 33. AI-Assisted Development

AI-assisted development tools were used during implementation.

AI was primarily used for:

* Breaking requirements into implementation tasks
* Generating initial test cases
* Identifying missing test scenarios
* Troubleshooting TypeScript/Vitest errors
* Improving test coverage
* Reviewing component/service responsibilities
* Generating documentation drafts

The generated code was reviewed and adjusted manually.

Particular attention was given to:

* Backend ownership of game rules
* API contracts
* Undo semantics
* Computer move behavior
* Angular/Vitest compatibility
* Mocking asynchronous Observables
* Angular change detection
* Error handling

AI-generated tests were not treated as automatically correct; they were reviewed against the actual implementation.

---

# 34. AI Prompt / Workflow Summary

The development workflow followed this pattern:

```text
Requirements
     |
     v
Break requirements into features
     |
     v
Design backend API
     |
     v
Implement backend game rules
     |
     v
Implement Angular services
     |
     v
Implement UI components
     |
     v
Generate initial tests
     |
     v
Run tests
     |
     v
Analyze failures
     |
     v
Correct tests / implementation
     |
     v
Run complete test suite
     |
     v
Generate coverage
     |
     v
Manual review
```

The important engineering decision was to use AI as an implementation and review assistant while retaining manual ownership of the final design and code.

---

# 35. Local Development Checklist

Before demonstrating the application:

### Backend

```powershell
cd backend
dotnet restore
dotnet build
dotnet test
dotnet run
```

### Frontend

```powershell
cd frontend
npm install
ng test --watch=false
ng test --watch=false --coverage
ng serve
```

### Browser

Open:

```text
http://localhost:4200
```

Verify:

* [ ] Game loads
* [ ] Two Player Mode works
* [ ] Computer Mode works
* [ ] X and O turns alternate
* [ ] Invalid moves are rejected
* [ ] Winner is displayed
* [ ] Winning cells are highlighted
* [ ] Draw is detected
* [ ] Move history updates
* [ ] Undo works
* [ ] Reset Game works
* [ ] Scoreboard updates
* [ ] Reset Scoreboard works

---

# 36. Assessment Demonstration Flow

For a panel/demo, the following sequence demonstrates the main functionality efficiently:

### 1. Start the backend

```powershell
dotnet run
```

### 2. Start Angular

```powershell
ng serve
```

### 3. Demonstrate Two Player Mode

```text
X → O → X → O
```

Show:

* Board
* Turn indicator
* Move history
* Undo

### 4. Demonstrate Winning Game

Complete a winning row/column/diagonal.

Show:

* Winner
* Winning cells
* Scoreboard
* Board locked after completion

### 5. Demonstrate Draw

Play a draw scenario.

Show:

* Draw status
* Scoreboard update
* Board locked

### 6. Demonstrate Computer Mode

Show:

```text
Human X
Computer O
```

Demonstrate the computer's automatic move.

### 7. Demonstrate Undo

In Computer Mode:

```text
X move
Computer O move
Undo
```

Show that both moves are removed.

### 8. Demonstrate Reset

Reset the game and show:

```text
Empty board
X's turn
Empty move history
Scoreboard unchanged
```

### 9. Demonstrate Tests

Run:

```powershell
ng test --watch=false
```

Then:

```powershell
ng test --watch=false --coverage
```

Open:

```text
coverage/index.html
```

---

# 37. Summary

The Angular frontend follows a simple architecture where:

```text
Angular UI
    |
    v
Components
    |
    v
Angular Services
    |
    v
REST API
    |
    v
.NET Backend
```

The frontend focuses on presentation and interaction while the backend owns the authoritative game state and business rules.

The frontend test suite focuses on component behavior, rendering, user interaction, service communication, loading states and error handling.

The backend test suite independently validates the game rules, state transitions, computer strategy, undo behavior and scoreboard.

This separation keeps the solution maintainable, testable and easy to explain during technical review.
