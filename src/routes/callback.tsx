import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useZitadelAuth } from '@/hooks/auth/useZitadelAuth';
import { useEffect } from 'react';
import { localStorageToken } from 'services/cache';

export const Route = createFileRoute('/callback')({
  component: () => <Callback />,
});

const Callback: React.FC = () => {
  const { userManager } = useZitadelAuth();
  const navigate = useNavigate();

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then(async (user) => {
        try {
          // Persist tokens so API requests include Authorization header
          if (user?.access_token) {
            localStorageToken.setAccessToken(user.access_token);
          }
          // Some providers include refresh_token depending on scope/offline_access
          if ((user as any)?.refresh_token) {
            localStorageToken.setRefreshToken((user as any).refresh_token as string);
          }
        } catch (e) {
          // Non-fatal: continue to app even if storage fails
          console.warn('Token persist warning:', e);
        }
        navigate({ to: '/' });
      })
      .catch((error) => {
        console.error('Zitadel callback error:', error);
        navigate({ to: '/login' });
      });
  }, [userManager, navigate]);

  return <div>Loading...</div>;
};

export default Callback;
