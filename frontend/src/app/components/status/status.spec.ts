import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { StatusComponent } from './status';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusComponent]
    }).compileComponents();

    fixture =
      TestBed.createComponent(StatusComponent);

    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.componentRef.setInput(
      'currentPlayer',
      'X'
    );

    fixture.componentRef.setInput(
      'winner',
      null
    );

    fixture.detectChanges();
  });

  // ====================================================
  // COMPONENT
  // ====================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ====================================================
  // IN PROGRESS
  // ====================================================

  it('should display X turn when current player is X', () => {
    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.componentRef.setInput(
      'currentPlayer',
      'X'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      "Player X's turn"
    );
  });

  it('should display O turn when current player is O', () => {
    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.componentRef.setInput(
      'currentPlayer',
      'O'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      "Player O's turn"
    );
  });

  it('should not display winner message while game is in progress', () => {
    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.componentRef.setInput(
      'currentPlayer',
      'X'
    );

    fixture.componentRef.setInput(
      'winner',
      null
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).not.toContain('wins');
  });

  // ====================================================
  // WON
  // ====================================================

  it('should display X wins when X is the winner', () => {
    fixture.componentRef.setInput(
      'status',
      'Won'
    );

    fixture.componentRef.setInput(
      'winner',
      'X'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Player X wins!'
    );
  });

  it('should display O wins when O is the winner', () => {
    fixture.componentRef.setInput(
      'status',
      'Won'
    );

    fixture.componentRef.setInput(
      'winner',
      'O'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Player O wins!'
    );
  });

  it('should apply winner CSS class when game is won', () => {
    fixture.componentRef.setInput(
      'status',
      'Won'
    );

    fixture.componentRef.setInput(
      'winner',
      'X'
    );

    fixture.detectChanges();

    const statusElement =
      fixture.nativeElement.querySelector(
        '.status'
      );

    expect(
      statusElement.classList.contains('winner')
    ).toBe(true);
  });

  it('should not apply draw CSS class when game is won', () => {
    fixture.componentRef.setInput(
      'status',
      'Won'
    );

    fixture.componentRef.setInput(
      'winner',
      'X'
    );

    fixture.detectChanges();

    const statusElement =
      fixture.nativeElement.querySelector(
        '.status'
      );

    expect(
      statusElement.classList.contains('draw')
    ).toBe(false);
  });

  // ====================================================
  // DRAW
  // ====================================================

  it('should display draw message', () => {
    fixture.componentRef.setInput(
      'status',
      'Draw'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Game Draw!'
    );
  });

  it('should apply draw CSS class when game is drawn', () => {
    fixture.componentRef.setInput(
      'status',
      'Draw'
    );

    fixture.detectChanges();

    const statusElement =
      fixture.nativeElement.querySelector(
        '.status'
      );

    expect(
      statusElement.classList.contains('draw')
    ).toBe(true);
  });

  it('should not apply winner CSS class when game is drawn', () => {
    fixture.componentRef.setInput(
      'status',
      'Draw'
    );

    fixture.detectChanges();

    const statusElement =
      fixture.nativeElement.querySelector(
        '.status'
      );

    expect(
      statusElement.classList.contains('winner')
    ).toBe(false);
  });

  // ====================================================
  // STATUS TRANSITIONS
  // ====================================================

  it('should update from InProgress to Won', () => {
    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.componentRef.setInput(
      'currentPlayer',
      'X'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      "Player X's turn"
    );

    fixture.componentRef.setInput(
      'status',
      'Won'
    );

    fixture.componentRef.setInput(
      'winner',
      'X'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Player X wins!'
    );

    expect(
      fixture.nativeElement.textContent
    ).not.toContain(
      "Player X's turn"
    );
  });

  it('should update from InProgress to Draw', () => {
    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.componentRef.setInput(
      'currentPlayer',
      'X'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      "Player X's turn"
    );

    fixture.componentRef.setInput(
      'status',
      'Draw'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Game Draw!'
    );

    expect(
      fixture.nativeElement.textContent
    ).not.toContain(
      "Player X's turn"
    );
  });

  it('should update winner from X to O', () => {
    fixture.componentRef.setInput(
      'status',
      'Won'
    );

    fixture.componentRef.setInput(
      'winner',
      'X'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Player X wins!'
    );

    fixture.componentRef.setInput(
      'winner',
      'O'
    );

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent
    ).toContain(
      'Player O wins!'
    );

    expect(
      fixture.nativeElement.textContent
    ).not.toContain(
      'Player X wins!'
    );
  });

  // ====================================================
  // DOM
  // ====================================================

  it('should render exactly one status element', () => {
    const elements =
      fixture.nativeElement.querySelectorAll(
        '.status'
      );

    expect(elements.length).toBe(1);
  });

  it('should render winner class only for Won status', () => {
    fixture.componentRef.setInput(
      'status',
      'Won'
    );

    fixture.componentRef.setInput(
      'winner',
      'X'
    );

    fixture.detectChanges();

    const statusElement =
      fixture.nativeElement.querySelector(
        '.status'
      );

    expect(
      statusElement.classList.contains('winner')
    ).toBe(true);

    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.detectChanges();

    expect(
      statusElement.classList.contains('winner')
    ).toBe(false);
  });

  it('should render draw class only for Draw status', () => {
    fixture.componentRef.setInput(
      'status',
      'Draw'
    );

    fixture.detectChanges();

    const statusElement =
      fixture.nativeElement.querySelector(
        '.status'
      );

    expect(
      statusElement.classList.contains('draw')
    ).toBe(true);

    fixture.componentRef.setInput(
      'status',
      'InProgress'
    );

    fixture.detectChanges();

    expect(
      statusElement.classList.contains('draw')
    ).toBe(false);
  });
});