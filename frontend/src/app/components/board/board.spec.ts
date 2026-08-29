import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardComponent } from './board';
import { GameState } from '../../models/game.model';
import { vi } from 'vitest';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  const createGame = (
    overrides: Partial<GameState> = {}
  ): GameState => ({
    gameId: 'test-game',
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    mode: 'TwoPlayer',
    status: 'InProgress',
    winner: null,
    winningCells: [],
    moveHistory: [],
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'game',
      createGame()
    );

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render 9 board cells', () => {
    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells.length).toBe(9);
  });

  it('should render an empty board initially', () => {
    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    cells.forEach((cell: HTMLButtonElement) => {
      expect(cell.textContent.trim()).toBe('');
    });
  });

  it('should display X in the correct cell', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', '', '',
          '', '', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[0].textContent.trim()).toBe('X');
  });

  it('should display O in the correct cell', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          '', '', '',
          '', 'O', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[4].textContent.trim()).toBe('O');
  });

  it('should apply x class to X cells', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', '', '',
          '', '', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[0].classList.contains('x')).toBe(true);
  });

  it('should apply o class to O cells', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          '', '', '',
          '', 'O', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[4].classList.contains('o')).toBe(true);
  });

  it('should not apply x class to O cells', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'O', '', '',
          '', '', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[0].classList.contains('x')).toBe(false);
  });

  it('should not apply o class to X cells', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', '', '',
          '', '', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[0].classList.contains('o')).toBe(false);
  });

  it('should identify a winning cell', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        winningCells: [0, 1, 2]
      })
    );

    expect(component.isWinningCell(0)).toBe(true);
    expect(component.isWinningCell(1)).toBe(true);
    expect(component.isWinningCell(2)).toBe(true);
  });

  it('should identify a non-winning cell', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        winningCells: [0, 1, 2]
      })
    );

    expect(component.isWinningCell(3)).toBe(false);
    expect(component.isWinningCell(4)).toBe(false);
  });

  it('should apply winning class to winning cells', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', 'X', 'X',
          '', '', '',
          '', '', ''
        ],
        status: 'Won',
        winner: 'X',
        winningCells: [0, 1, 2]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[0].classList.contains('winning')).toBe(true);
    expect(cells[1].classList.contains('winning')).toBe(true);
    expect(cells[2].classList.contains('winning')).toBe(true);
  });

  it('should not apply winning class to non-winning cells', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        winningCells: [0, 1, 2]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[3].classList.contains('winning')).toBe(false);
    expect(cells[4].classList.contains('winning')).toBe(false);
  });

  it('should enable empty cells during an active game', () => {
    fixture.componentRef.setInput(
      'game',
      createGame()
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    for (let i = 0; i < 9; i++) {
      expect(cells[i].disabled).toBe(false);
    }
  });

  it('should disable an occupied cell', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', '', '',
          '', '', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    expect(cells[0].disabled).toBe(true);
    expect(cells[1].disabled).toBe(false);
  });

  it('should disable all cells when game is completed', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', 'X', 'X',
          'O', 'O', '',
          '', '', ''
        ],
        status: 'Won',
        winner: 'X',
        winningCells: [0, 1, 2]
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    for (let i = 0; i < 9; i++) {
      expect(cells[i].disabled).toBe(true);
    }
  });

  it('should disable all cells when game is drawn', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', 'O', 'X',
          'X', 'O', 'O',
          'O', 'X', 'X'
        ],
        status: 'Draw'
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    for (let i = 0; i < 9; i++) {
      expect(cells[i].disabled).toBe(true);
    }
  });

  it('should disable cells when computer is the current player', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        mode: 'Computer',
        currentPlayer: 'O'
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    for (let i = 0; i < 9; i++) {
      expect(cells[i].disabled).toBe(true);
    }
  });

  it('should enable cells when computer mode is waiting for X', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        mode: 'Computer',
        currentPlayer: 'X'
      })
    );

    fixture.detectChanges();

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    for (let i = 0; i < 9; i++) {
      expect(cells[i].disabled).toBe(false);
    }
  });

  it('should emit cellClicked when an enabled cell is clicked', () => {
    vi.spyOn(component.cellClicked, 'emit');

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    cells[0].click();

    expect(
      component.cellClicked.emit
    ).toHaveBeenCalledWith(0);
  });

  it('should emit the correct index when different cells are clicked', () => {
    vi.spyOn(component.cellClicked, 'emit');

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    cells[4].click();

    expect(
      component.cellClicked.emit
    ).toHaveBeenCalledWith(4);
  });

  it('should not emit when an occupied cell is clicked', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        board: [
          'X', '', '',
          '', '', '',
          '', '', ''
        ]
      })
    );

    fixture.detectChanges();

    vi.spyOn(component.cellClicked, 'emit');

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    cells[0].click();

    expect(
      component.cellClicked.emit
    ).not.toHaveBeenCalled();
  });

  it('should not emit when game is completed', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        status: 'Won',
        winner: 'X',
        winningCells: [0, 1, 2]
      })
    );

    fixture.detectChanges();

    vi.spyOn(component.cellClicked, 'emit');

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    cells[3].click();

    expect(
      component.cellClicked.emit
    ).not.toHaveBeenCalled();
  });

  it('should not emit when computer is making its move', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        mode: 'Computer',
        currentPlayer: 'O'
      })
    );

    fixture.detectChanges();

    vi.spyOn(component.cellClicked, 'emit');

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    cells[0].click();

    expect(
      component.cellClicked.emit
    ).not.toHaveBeenCalled();
  });

  it('should allow click when computer mode is waiting for X', () => {
    fixture.componentRef.setInput(
      'game',
      createGame({
        mode: 'Computer',
        currentPlayer: 'X'
      })
    );

    fixture.detectChanges();

    vi.spyOn(component.cellClicked, 'emit');

    const cells =
      fixture.nativeElement.querySelectorAll('.cell');

    cells[0].click();

    expect(
      component.cellClicked.emit
    ).toHaveBeenCalledWith(0);
  });
});