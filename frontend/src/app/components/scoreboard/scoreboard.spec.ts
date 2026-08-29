import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Scoreboard } from './scoreboard';
import { Scoreboard as ScoreboardModel } from '../../models/game.model';
import { vi } from 'vitest';

describe('Scoreboard', () => {
  let component: Scoreboard;
  let fixture: ComponentFixture<Scoreboard>;

  const createScoreboard = (
    overrides: Partial<ScoreboardModel> = {}
  ): ScoreboardModel => ({
    xWins: 0,
    oWins: 0,
    draws: 0,
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scoreboard]
    }).compileComponents();

    fixture = TestBed.createComponent(Scoreboard);

    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard()
    );

    fixture.detectChanges();
  });

  // ----------------------------------------------------
  // Component
  // ----------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ----------------------------------------------------
  // Scoreboard values
  // ----------------------------------------------------

  it('should display X wins', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        xWins: 5
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[0].textContent.trim()).toBe('5');
  });

  it('should display O wins', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        oWins: 3
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[1].textContent.trim()).toBe('3');
  });

  it('should display draws', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        draws: 2
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[2].textContent.trim()).toBe('2');
  });

  it('should display all scoreboard values correctly', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        xWins: 10,
        oWins: 7,
        draws: 4
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values.length).toBe(3);

    expect(values[0].textContent.trim()).toBe('10');
    expect(values[1].textContent.trim()).toBe('7');
    expect(values[2].textContent.trim()).toBe('4');
  });

  it('should display zero values initially', () => {
    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[0].textContent.trim()).toBe('0');
    expect(values[1].textContent.trim()).toBe('0');
    expect(values[2].textContent.trim()).toBe('0');
  });

  // ----------------------------------------------------
  // Labels
  // ----------------------------------------------------

  it('should display X Wins label', () => {
    const labels =
      fixture.nativeElement.querySelectorAll(
        '.score .label'
      );

    expect(
      labels[0].textContent.trim()
    ).toBe('X Wins');
  });

  it('should display O Wins label', () => {
    const labels =
      fixture.nativeElement.querySelectorAll(
        '.score .label'
      );

    expect(
      labels[1].textContent.trim()
    ).toBe('O Wins');
  });

  it('should display Draws label', () => {
    const labels =
      fixture.nativeElement.querySelectorAll(
        '.score .label'
      );

    expect(
      labels[2].textContent.trim()
    ).toBe('Draws');
  });

  it('should render three score sections', () => {
    const scores =
      fixture.nativeElement.querySelectorAll(
        '.score'
      );

    expect(scores.length).toBe(3);
  });

  // ----------------------------------------------------
  // Reset button
  // ----------------------------------------------------

  it('should render Reset Scoreboard button', () => {
    const button =
      fixture.nativeElement.querySelector(
        'button.danger'
      ) as HTMLButtonElement;

    expect(button).not.toBeNull();

    expect(
      button.textContent.trim()
    ).toBe('Reset Scoreboard');
  });

  it('should render reset button as a button element', () => {
    const button =
      fixture.nativeElement.querySelector(
        'button.danger'
      );

    expect(button).not.toBeNull();

    expect(button.tagName).toBe('BUTTON');
  });

  // ----------------------------------------------------
  // Reset output
  // ----------------------------------------------------

  it('should emit resetClicked when reset button is clicked', () => {
    vi.spyOn(
      component.resetClicked,
      'emit'
    );

    const button =
      fixture.nativeElement.querySelector(
        'button.danger'
      ) as HTMLButtonElement;

    button.click();

    expect(
      component.resetClicked.emit
    ).toHaveBeenCalled();
  });

  it('should emit resetClicked only once for one click', () => {
    vi.spyOn(
      component.resetClicked,
      'emit'
    );

    const button =
      fixture.nativeElement.querySelector(
        'button.danger'
      ) as HTMLButtonElement;

    button.click();

    expect(
      component.resetClicked.emit
    ).toHaveBeenCalledTimes(1);
  });

  // ----------------------------------------------------
  // onReset()
  // ----------------------------------------------------

  it('should emit resetClicked when onReset is called', () => {
    vi.spyOn(
      component.resetClicked,
      'emit'
    );

    component.onReset();

    expect(
      component.resetClicked.emit
    ).toHaveBeenCalled();
  });

  // ----------------------------------------------------
  // Input updates
  // ----------------------------------------------------

  it('should update X wins when scoreboard input changes', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        xWins: 8
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(
      values[0].textContent.trim()
    ).toBe('8');
  });

  it('should update O wins when scoreboard input changes', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        oWins: 6
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(
      values[1].textContent.trim()
    ).toBe('6');
  });

  it('should update draws when scoreboard input changes', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        draws: 9
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(
      values[2].textContent.trim()
    ).toBe('9');
  });

  it('should update all values when scoreboard input changes', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        xWins: 4,
        oWins: 5,
        draws: 3
      })
    );

    fixture.detectChanges();

    let values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[0].textContent.trim()).toBe('4');
    expect(values[1].textContent.trim()).toBe('5');
    expect(values[2].textContent.trim()).toBe('3');

    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        xWins: 10,
        oWins: 11,
        draws: 12
      })
    );

    fixture.detectChanges();

    values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[0].textContent.trim()).toBe('10');
    expect(values[1].textContent.trim()).toBe('11');
    expect(values[2].textContent.trim()).toBe('12');
  });

  // ----------------------------------------------------
  // Large values
  // ----------------------------------------------------

  it('should display large scoreboard values', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        xWins: 100,
        oWins: 200,
        draws: 300
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[0].textContent.trim()).toBe('100');
    expect(values[1].textContent.trim()).toBe('200');
    expect(values[2].textContent.trim()).toBe('300');
  });

  // ----------------------------------------------------
  // Combined behavior
  // ----------------------------------------------------

  it('should display scoreboard independently of reset action', () => {
    fixture.componentRef.setInput(
      'scoreboard',
      createScoreboard({
        xWins: 5,
        oWins: 4,
        draws: 2
      })
    );

    fixture.detectChanges();

    const values =
      fixture.nativeElement.querySelectorAll(
        '.score .value'
      );

    expect(values[0].textContent.trim()).toBe('5');
    expect(values[1].textContent.trim()).toBe('4');
    expect(values[2].textContent.trim()).toBe('2');

    vi.spyOn(
      component.resetClicked,
      'emit'
    );

    const button =
      fixture.nativeElement.querySelector(
        'button.danger'
      ) as HTMLButtonElement;

    button.click();

    expect(
      component.resetClicked.emit
    ).toHaveBeenCalled();
  });
});