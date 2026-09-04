import { Component, inject, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { PlatformName } from '@ep-crm/core';
import { PlatformHost } from '@ep-crm/devkit';
import { AuthorizationService } from '@app/authorization/authorization';
import { PlatformAvailabilityService } from '@app/config/platform-availability';

function readReturnUrl(route: ActivatedRoute): string {
  const value: unknown = route.snapshot.queryParams['returnUrl'];
  return typeof value === 'string' && value ? value : '/dashboard';
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  private readonly service = inject(AuthorizationService);
  private readonly host = inject(PlatformHost);
  private readonly availability = inject(PlatformAvailabilityService);

  private readonly returnUrl: string = readReturnUrl(inject(ActivatedRoute));

  userName: string = '';

  password: string = '';

  readonly currentYear: number = new Date().getFullYear();

  readonly loading: WritableSignal<boolean> = signal(false);

  readonly errorMessage: WritableSignal<string | null> = signal(null);

  readonly unavailable: Signal<boolean> = this.availability.unavailable;

  readonly checking: WritableSignal<boolean> = signal(false);

  private readonly signInForm = viewChild.required(NgForm);

  onRetry(): void {
    this.checking.set(true);
    this.availability
      .verify()
      .pipe(finalize(() => this.checking.set(false)))
      .subscribe();
  }

  get platformName(): PlatformName | null {
    return this.host.name;
  }

  onSignIn(): void {
    if (this.signInForm().invalid) {
      return;
    }
    this.loading.set(true);
    this.service
      .login({ UserName: this.userName, UserPassword: this.password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.errorMessage.set(null);
          void this.router.navigateByUrl(this.returnUrl);
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
          console.error(error);
        },
      });
  }
}
