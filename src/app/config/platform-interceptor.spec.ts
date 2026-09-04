import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { sessionProbeContext } from '@ep-crm/devkit';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlatformHost } from '@ep-crm/devkit';
import { AuthorizationService } from '@app/authorization/authorization';
import { isSessionExpired, platformInterceptor } from './platform-interceptor';

describe('isSessionExpired', () => {
  function parseFailureAt200(): HttpErrorResponse {
    return new HttpErrorResponse({
      error: new SyntaxError('Unexpected token \'<\', "<!doctype "... is not valid JSON'),
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:4200/Login/Login.html',
    });
  }

  it('recognises the login page delivered with status 200', () => {
    expect(isSessionExpired(parseFailureAt200())).toBe(true);
  });

  it('recognises the older HttpClient response shape — the { error, text } wrapper', () => {
    const error = new HttpErrorResponse({
      error: { error: new SyntaxError('bad json'), text: '<!doctype html>' },
      status: 200,
      statusText: 'OK',
    });
    expect(isSessionExpired(error)).toBe(true);
  });

  it('treats a plain 401 as an expired session as well', () => {
    expect(
      isSessionExpired(new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    ).toBe(true);
  });

  it('does not mistake a plain server failure for an expired session', () => {
    expect(
      isSessionExpired(new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    ).toBe(false);
    expect(isSessionExpired(new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }))).toBe(
      false,
    );
  });

  it('does not mistake a 200 response with a parsed body for an expired session', () => {
    const error = new HttpErrorResponse({
      error: { success: false },
      status: 200,
      statusText: 'OK',
    });
    expect(isSessionExpired(error)).toBe(false);
  });
});

describe('platformInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let logout: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.fn>;
  let host: { isStandalone: boolean; isEmbedded: boolean };

  function configure(isStandalone: boolean): void {
    logout = vi.fn();
    navigateByUrl = vi.fn();
    host = { isStandalone, isEmbedded: !isStandalone };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([platformInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthorizationService, useValue: { logout } },
        { provide: Router, useValue: { navigateByUrl } },
        { provide: PlatformHost, useValue: host },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    backend.verify();
    TestBed.resetTestingModule();
  });

  it('marks the request with the ajax provider header', () => {
    configure(true);
    http.post('/crm/select', {}).subscribe({ error: () => undefined });
    const request = backend.expectOne('/crm/select');
    expect(request.request.headers.get('X-Request-Source')).toBe('ajax-provider');
    request.flush({ success: true });
  });

  it('signs the user out on a 401 in standalone mode', () => {
    configure(true);
    http.post('/crm/select', {}).subscribe({ error: () => undefined });
    backend.expectOne('/crm/select').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(logout).toHaveBeenCalled();
  });

  it('leaves the platform session alone on a 401 inside a platform page', () => {
    configure(false);
    http.post('/crm/select', {}).subscribe({ error: () => undefined });
    backend.expectOne('/crm/select').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(logout).not.toHaveBeenCalled();
  });

  it('does not interfere with the session probe request', () => {
    configure(true);
    http.post('/crm/currentUserInfo', null, { context: sessionProbeContext() }).subscribe({
      error: () => undefined,
    });
    backend
      .expectOne('/crm/currentUserInfo')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(logout).not.toHaveBeenCalled();
  });

  it('goes to the access denied page on a 403', () => {
    configure(true);
    http.post('/crm/select', {}).subscribe({ error: () => undefined });
    backend.expectOne('/crm/select').flush(null, { status: 403, statusText: 'Forbidden' });
    expect(navigateByUrl).toHaveBeenCalledWith('/unauthorized');
  });

  it('passes the original error through instead of replacing it', () => {
    configure(true);
    let received: unknown = null;
    http.post('/crm/select', {}).subscribe({
      error: (error) => {
        received = error;
      },
    });
    backend.expectOne('/crm/select').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(received).toBeInstanceOf(HttpErrorResponse);
    expect((received as HttpErrorResponse).status).toBe(401);
  });
});
