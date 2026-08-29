import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoveHistoryComponent } from './move-history';
import { Move } from '../../models/game.model';
import { vi } from 'vitest';

describe('MoveHistoryComponent', () => {
  let component: MoveHistoryComponent;
  let fixture: ComponentFixture<MoveHistoryComponent>;

  const moves: Move[] = [
    {
      number: 1,
      player: 'X',
      row: 0,
      column: 0
    },
    {
      number: 2,
      player: 'O',
      row: 1,
      column: 1
    },
    {
      number: 3,
      player: 'X',
      row: 0,
      column: 2
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveHistoryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      MoveHistoryComponent
    );

    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'moves',
      []
    );

    fixture.detectChanges();
  });

  // ----------------------------------------------------
  // Component creation
  // ----------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ----------------------------------------------------
  // Empty state
  // ----------------------------------------------------

  it('should display empty message when there are no moves', () => {
    fixture.componentRef.setInput(
      'moves',
      []
    );

    fixture.detectChanges();

    const element =
      fixture.nativeElement as HTMLElement;

    const emptyMessage =
      element.querySelector('.empty');

    expect(emptyMessage).not.toBeNull();

    expect(
      emptyMessage?.textContent?.trim()
    ).toBe('No moves yet.');
  });

  it('should display history when moves exist', () => {
    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const history =
      fixture.nativeElement.querySelector(
        '.history'
      );

    expect(history).not.toBeNull();
  });

  // ----------------------------------------------------
  // Move count
  // ----------------------------------------------------

  it('should render the correct number of moves', () => {
    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const rows =
      fixture.nativeElement.querySelectorAll(
        '.history-row'
      );

    expect(rows.length).toBe(3);
  });

  it('should render one row for one move', () => {
    fixture.componentRef.setInput(
      'moves',
      [moves[0]]
    );

    fixture.detectChanges();

    const rows =
      fixture.nativeElement.querySelectorAll(
        '.history-row'
      );

    expect(rows.length).toBe(1);
  });

  // ----------------------------------------------------
  // Move number
  // ----------------------------------------------------

  it('should display move numbers', () => {
    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const rows =
      fixture.nativeElement.querySelectorAll(
        '.history-row'
      );

    expect(rows[0].textContent).toContain('1');
    expect(rows[1].textContent).toContain('2');
    expect(rows[2].textContent).toContain('3');
  });

  // ----------------------------------------------------
  // Player
  // ----------------------------------------------------

  it('should display X player', () => {
    fixture.componentRef.setInput(
      'moves',
      [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    );

    fixture.detectChanges();

    const player =
      fixture.nativeElement.querySelector(
        '.history-row strong'
      );

    expect(player.textContent.trim()).toBe('X');
  });

  it('should display O player', () => {
    fixture.componentRef.setInput(
      'moves',
      [
        {
          number: 1,
          player: 'O',
          row: 1,
          column: 1
        }
      ]
    );

    fixture.detectChanges();

    const player =
      fixture.nativeElement.querySelector(
        '.history-row strong'
      );

    expect(player.textContent.trim()).toBe('O');
  });

  // ----------------------------------------------------
  // Player CSS classes
  // ----------------------------------------------------

  it('should apply x class to X player', () => {
    fixture.componentRef.setInput(
      'moves',
      [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    );

    fixture.detectChanges();

    const player =
      fixture.nativeElement.querySelector(
        '.history-row strong'
      );

    expect(
      player.classList.contains('x')
    ).toBe(true);

    expect(
      player.classList.contains('o')
    ).toBe(false);
  });

  it('should apply o class to O player', () => {
    fixture.componentRef.setInput(
      'moves',
      [
        {
          number: 1,
          player: 'O',
          row: 0,
          column: 0
        }
      ]
    );

    fixture.detectChanges();

    const player =
      fixture.nativeElement.querySelector(
        '.history-row strong'
      );

    expect(
      player.classList.contains('o')
    ).toBe(true);

    expect(
      player.classList.contains('x')
    ).toBe(false);
  });

  // ----------------------------------------------------
  // Position
  // ----------------------------------------------------

  it('should display row and column using one-based positions', () => {
    fixture.componentRef.setInput(
      'moves',
      [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    );

    fixture.detectChanges();

    const row =
      fixture.nativeElement.querySelector(
        '.history-row'
      );

    expect(row.textContent).toContain(
      'Row 1, Column 1'
    );
  });

  it('should display middle cell as Row 2 Column 2', () => {
    fixture.componentRef.setInput(
      'moves',
      [
        {
          number: 1,
          player: 'O',
          row: 1,
          column: 1
        }
      ]
    );

    fixture.detectChanges();

    const row =
      fixture.nativeElement.querySelector(
        '.history-row'
      );

    expect(row.textContent).toContain(
      'Row 2, Column 2'
    );
  });

  it('should display bottom right cell as Row 3 Column 3', () => {
    fixture.componentRef.setInput(
      'moves',
      [
        {
          number: 1,
          player: 'X',
          row: 2,
          column: 2
        }
      ]
    );

    fixture.detectChanges();

    const row =
      fixture.nativeElement.querySelector(
        '.history-row'
      );

    expect(row.textContent).toContain(
      'Row 3, Column 3'
    );
  });

  // ----------------------------------------------------
  // Undo button
  // ----------------------------------------------------

  it('should render Undo button', () => {
    const button =
      fixture.nativeElement.querySelector(
        'button'
      );

    expect(button).not.toBeNull();

    expect(
      button.textContent.trim()
    ).toBe('Undo');
  });

  it('should disable Undo when there are no moves', () => {
    fixture.componentRef.setInput(
      'moves',
      []
    );

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        'button'
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should enable Undo when moves exist', () => {
    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        'button'
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(false);
  });

  it('should enable Undo when there is exactly one move', () => {
    fixture.componentRef.setInput(
      'moves',
      [moves[0]]
    );

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        'button'
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(false);
  });

  // ----------------------------------------------------
  // Undo output
  // ----------------------------------------------------

  it('should emit undoClicked when Undo is clicked', () => {
    vi.spyOn(
      component.undoClicked,
      'emit'
    );

    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        'button'
      ) as HTMLButtonElement;

    button.click();

    expect(
      component.undoClicked.emit
    ).toHaveBeenCalled();
  });

  it('should emit undoClicked only once for one click', () => {
    vi.spyOn(
      component.undoClicked,
      'emit'
    );

    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        'button'
      ) as HTMLButtonElement;

    button.click();

    expect(
      component.undoClicked.emit
    ).toHaveBeenCalledTimes(1);
  });

  // ----------------------------------------------------
  // onUndo()
  // ----------------------------------------------------

  it('should emit undoClicked when onUndo is called directly', () => {
    vi.spyOn(
      component.undoClicked,
      'emit'
    );

    component.onUndo();

    expect(
      component.undoClicked.emit
    ).toHaveBeenCalled();
  });

  // ----------------------------------------------------
  // Multiple moves
  // ----------------------------------------------------

  it('should render all players in move history', () => {
    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const players =
      fixture.nativeElement.querySelectorAll(
        '.history-row strong'
      );

    expect(players.length).toBe(3);

    expect(
      players[0].textContent.trim()
    ).toBe('X');

    expect(
      players[1].textContent.trim()
    ).toBe('O');

    expect(
      players[2].textContent.trim()
    ).toBe('X');
  });

  it('should render complete move information', () => {
    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    const rows =
      fixture.nativeElement.querySelectorAll(
        '.history-row'
      );

    expect(rows[0].textContent).toContain(
      '1'
    );

    expect(rows[0].textContent).toContain(
      'X'
    );

    expect(rows[0].textContent).toContain(
      'Row 1, Column 1'
    );

    expect(rows[1].textContent).toContain(
      '2'
    );

    expect(rows[1].textContent).toContain(
      'O'
    );

    expect(rows[1].textContent).toContain(
      'Row 2, Column 2'
    );
  });

  // ----------------------------------------------------
  // Input updates
  // ----------------------------------------------------

  it('should update displayed history when moves input changes', () => {
    fixture.componentRef.setInput(
      'moves',
      [moves[0]]
    );

    fixture.detectChanges();

    let rows =
      fixture.nativeElement.querySelectorAll(
        '.history-row'
      );

    expect(rows.length).toBe(1);

    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    rows =
      fixture.nativeElement.querySelectorAll(
        '.history-row'
      );

    expect(rows.length).toBe(3);
  });

  it('should display empty state after moves are removed', () => {
    fixture.componentRef.setInput(
      'moves',
      moves
    );

    fixture.detectChanges();

    fixture.componentRef.setInput(
      'moves',
      []
    );

    fixture.detectChanges();

    const emptyMessage =
      fixture.nativeElement.querySelector(
        '.empty'
      );

    expect(emptyMessage).not.toBeNull();

    const rows =
      fixture.nativeElement.querySelectorAll(
        '.history-row'
      );

    expect(rows.length).toBe(0);
  });
});