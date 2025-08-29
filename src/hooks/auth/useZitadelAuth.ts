import { createZitadelAuth, ZitadelConfig } from '@/config/zitadel';

const zitadelConfig: ZitadelConfig = {
  authority: 'https://laundry-w3ruj7.us1.zitadel.cloud',
  client_id: '335472896774358936',
  project_resource_id: '335472896774358936',
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,
};

export const zitadelAuthInstance = createZitadelAuth(zitadelConfig);

// Export the hook for use in components
export const useZitadelAuth = () => {
  return createZitadelAuth(zitadelConfig);
};
