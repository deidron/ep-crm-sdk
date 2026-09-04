import { Component, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './error-page.html',
  styleUrl: './error-page.css',
})
export class ErrorPage {
  readonly titleKey: InputSignal<string> = input.required<string>();

  readonly textKey: InputSignal<string> = input.required<string>();
}
