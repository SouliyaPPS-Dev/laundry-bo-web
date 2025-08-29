import {
  UserManagerSettings,
  UserManager,
  WebStorageStateStore,
} from 'oidc-client-ts';

export type ZitadelConfig = Partial<UserManagerSettings> & {
  project_resource_id?: string;
};

export interface ZitadelAuth {
  authorize(): Promise<void>;
  signout(): Promise<void>;
  userManager: UserManager;
}

export function createZitadelAuth(zitadelConfig: ZitadelConfig): ZitadelAuth {
  const authConfig: UserManagerSettings = {
    authority: `${zitadelConfig.authority}`,
    client_id: `${zitadelConfig.client_id}`,
    redirect_uri: `${zitadelConfig.redirect_uri}`,
    post_logout_redirect_uri: `${zitadelConfig.post_logout_redirect_uri}`,
    response_type: zitadelConfig.response_type ?? 'code',
    scope:
      zitadelConfig.scope ??
      `openid profile email ${
        zitadelConfig.project_resource_id
          ? `urn:zitadel:iam:org:project:id:${zitadelConfig.project_resource_id}:aud urn:zitadel:iam:org:projects:roles`
          : ''
      }`,
    prompt: zitadelConfig.prompt ?? '',
    response_mode: zitadelConfig.response_mode ?? 'query',
    disablePKCE: zitadelConfig.disablePKCE,
    extraQueryParams: zitadelConfig.extraQueryParams,
  };

  const userManager = new UserManager({
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    loadUserInfo: true,
    ...authConfig,
  });

  const authorize = () => {
    return userManager.signinRedirect();
  };

  const signout = () => {
    // Delegate logout to API to handle SSO end-session and local token revocation
    const rawBase = (typeof process !== 'undefined' && (process as any).env?.VITE_BASE_URL) || '';
    const base = rawBase.replace(/\/$/, '');
    const target = `${base}/api/v1/auth/sso/logout`;
    window.location.href = target;
    return Promise.resolve();
  };

  const oidc = {
    authorize,
    signout,
    userManager,
  };

  return oidc;
}
