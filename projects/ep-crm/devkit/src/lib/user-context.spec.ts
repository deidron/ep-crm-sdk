import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { PlatformUrlProvider, UserInfo } from '@ep-crm/core';
import { UserContextService } from './user-context';

const userInfo = {
  id: 'admin-unit-id',
  contactId: 'contact-id',
  contactName: 'Test',
  cultureInfo: { sysCultureName: 'ru-RU' },
} as UserInfo;

function firstValue<T>(source: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => source.subscribe({ next: resolve, error: reject }));
}

describe('UserContextService', () => {
  let service: UserContextService;
  let post: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    post = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: { post } },
        { provide: PlatformUrlProvider, useValue: { resolve: (alias: string) => `/crm/${alias}` } },
      ],
    });
    service = TestBed.inject(UserContextService);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('has no user before the context is loaded', () => {
    expect(service.userInfo()).toBeNull();
    expect(service.currentCulture()).toBe('en-US');
  });

  it('remembers the user from the service response', async () => {
    post.mockReturnValue(of({ success: true, userInfo }));
    await expect(firstValue(service.initialize())).resolves.toBe(true);
    expect(service.userInfo()).toEqual(userInfo);
    expect(service.currentCulture()).toBe('ru-RU');
  });

  it('does not go to the server on a repeated call', async () => {
    post.mockReturnValue(of({ success: true, userInfo }));
    await firstValue(service.initialize());
    await expect(firstValue(service.initialize())).resolves.toBe(true);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('leaves the context empty on an unsuccessful response', async () => {
    post.mockReturnValue(of({ success: false }));
    await expect(firstValue(service.initialize())).resolves.toBe(false);
    expect(service.userInfo()).toBeNull();
  });

  it('propagates a service failure to the outside', async () => {
    post.mockReturnValue(throwError(() => new Error('no session')));
    await expect(firstValue(service.initialize())).rejects.toThrow('no session');
  });

  it('requests the context again after destroy', async () => {
    post.mockReturnValue(of({ success: true, userInfo }));
    await firstValue(service.initialize());
    service.destroy();
    expect(service.userInfo()).toBeNull();
    await firstValue(service.initialize());
    expect(post).toHaveBeenCalledTimes(2);
  });
});
