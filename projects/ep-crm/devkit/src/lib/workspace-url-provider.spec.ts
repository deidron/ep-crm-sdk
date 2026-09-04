import { PlatformName, ServiceRoutes } from '@ep-crm/core';
import { WorkspaceUrlProvider } from './workspace-url-provider';

const routes: ServiceRoutes = {
  select: { path: 'DataService/json/SyncReply/SelectQuery', scope: 'workspace' },
  entityImg: { path: 'img/entity/hash/SysImage/Data', scope: 'workspace' },
  ping: { path: 'ServiceModel/Ping.svc/Check', scope: 'application' },
  login: { path: 'ServiceModel/AuthService.svc/Login', scope: 'application', embedded: false },
};

interface Global {
  loaderBaseUrl?: string;
  workspaceBaseUrl?: string;
}

const scope = globalThis as unknown as Record<string, Global | undefined>;

function embed(global: Global): WorkspaceUrlProvider {
  scope[PlatformName.BPMSoft] = global;
  return new WorkspaceUrlProvider(routes);
}

describe('WorkspaceUrlProvider', () => {
  afterEach(() => {
    delete scope[PlatformName.BPMSoft];
  });

  describe('a workspace service', () => {
    it('keeps a base that carries the number of the workspace', () => {
      const provider = embed({ workspaceBaseUrl: 'http://localhost:1003/0' });
      expect(provider.resolve('select')).toBe(
        'http://localhost:1003/0/DataService/json/SyncReply/SelectQuery',
      );
    });

    it('keeps a base that carries no number', () => {
      const provider = embed({ workspaceBaseUrl: 'http://localhost:1002' });
      expect(provider.resolve('select')).toBe(
        'http://localhost:1002/DataService/json/SyncReply/SelectQuery',
      );
    });
  });

  describe('an application service', () => {
    it('is addressed through loaderBaseUrl, past the workspace', () => {
      const provider = embed({
        loaderBaseUrl: 'http://localhost:1003/',
        workspaceBaseUrl: 'http://localhost:1003/0',
      });
      expect(provider.resolve('ping')).toBe('http://localhost:1003/ServiceModel/Ping.svc/Check');
    });

    it('does not depend on the workspace base at all', () => {
      const provider = embed({ loaderBaseUrl: 'http://localhost:1002/' });
      expect(provider.resolve('ping')).toBe('http://localhost:1002/ServiceModel/Ping.svc/Check');
    });
  });

  describe('the separator', () => {
    it('survives a base without a trailing slash', () => {
      const provider = embed({ loaderBaseUrl: 'http://localhost:1002' });
      expect(provider.resolve('ping')).toBe('http://localhost:1002/ServiceModel/Ping.svc/Check');
    });

    it('survives a base with trailing slashes', () => {
      const provider = embed({ workspaceBaseUrl: 'http://localhost:1002///' });
      expect(provider.resolve('select')).toBe(
        'http://localhost:1002/DataService/json/SyncReply/SelectQuery',
      );
    });
  });

  describe('refusals', () => {
    it('refuses a service that is not meant to be called from a platform page', () => {
      const provider = embed({ loaderBaseUrl: 'http://localhost:1002/' });
      expect(() => provider.resolve('login')).toThrow(/not meant to be called/);
    });

    it('refuses an alias that is not in the service list', () => {
      const provider = embed({ workspaceBaseUrl: 'http://localhost:1002' });
      expect(() => provider.resolve('unknown')).toThrow(/not described/);
    });

    it('refuses a workspace address without workspaceBaseUrl', () => {
      const provider = embed({ loaderBaseUrl: 'http://localhost:1002/' });
      expect(() => provider.resolve('select')).toThrow(/workspaceBaseUrl is not available/);
    });

    it('refuses an application address without loaderBaseUrl', () => {
      const provider = embed({ workspaceBaseUrl: 'http://localhost:1002' });
      expect(() => provider.resolve('ping')).toThrow(/loaderBaseUrl is not available/);
    });
  });
});
