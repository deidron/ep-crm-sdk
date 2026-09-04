import { Service, Signal, signal, WritableSignal } from '@angular/core';

@Service()
export class LoadingService {
  private readonly state: WritableSignal<boolean> = signal(false);

  readonly loading: Signal<boolean> = this.state.asReadonly();

  show(): void {
    this.state.set(true);
  }

  hide(): void {
    this.state.set(false);
  }
}
