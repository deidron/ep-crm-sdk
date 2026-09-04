import { Component, inject, Signal } from '@angular/core';
import { LoadingService } from '@app/loading/loading';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.html',
  styleUrl: './loading-indicator.css',
})
export class LoadingIndicator {
  private readonly loader = inject(LoadingService);

  readonly show: Signal<boolean> = this.loader.loading;
}
