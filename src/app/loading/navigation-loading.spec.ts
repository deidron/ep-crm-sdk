import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subject } from 'rxjs';
import { LoadingService } from '@app/loading/loading';
import { provideNavigationLoading } from '@app/loading/navigation-loading';

const showDelayMs: number = 150;

interface Setup {
  events: Subject<Event>;
  loader: LoadingService;
}

function configure(): Setup {
  const events = new Subject<Event>();
  TestBed.configureTestingModule({
    providers: [provideNavigationLoading(), { provide: Router, useValue: { events } }],
  });
  TestBed.inject(ApplicationInitStatus);
  return { events, loader: TestBed.inject(LoadingService) };
}

describe('provideNavigationLoading', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('shows nothing while a navigation is quicker than the delay', () => {
    const { events, loader } = configure();

    events.next(new NavigationStart(1, '/dashboard'));
    vi.advanceTimersByTime(showDelayMs - 1);

    expect(loader.loading()).toBe(false);
  });

  it('shows the overlay once the navigation outlasts the delay', () => {
    const { events, loader } = configure();

    events.next(new NavigationStart(1, '/dashboard'));
    vi.advanceTimersByTime(showDelayMs);

    expect(loader.loading()).toBe(true);
  });

  it.each([
    ['end', () => new NavigationEnd(1, '/dashboard', '/dashboard')],
    ['cancel', () => new NavigationCancel(1, '/dashboard', '')],
    ['error', () => new NavigationError(1, '/dashboard', new Error('failed'))],
  ])('hides the overlay when a navigation comes to an %s', (_name, finish) => {
    const { events, loader } = configure();
    events.next(new NavigationStart(1, '/dashboard'));
    vi.advanceTimersByTime(showDelayMs);

    events.next(finish());

    expect(loader.loading()).toBe(false);
  });

  it('drops a pending overlay when the navigation finishes first', () => {
    const { events, loader } = configure();
    events.next(new NavigationStart(1, '/dashboard'));

    events.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    vi.advanceTimersByTime(showDelayMs * 10);

    expect(loader.loading()).toBe(false);
  });
});
