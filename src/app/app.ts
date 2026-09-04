import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserContextService } from '@ep-crm/devkit';
import { interfaceCulture } from '@app/app.config';
import { LoadingIndicator } from '@app/loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingIndicator],
  template: '<router-outlet /><app-loading-indicator />',
})
export class App {
  private readonly userContext = inject(UserContextService);
  private readonly translate = inject(TranslateService);

  constructor() {
    effect(() => {
      this.translate.use(interfaceCulture(this.userContext));
    });
  }
}
