import { useZitadelAuth } from '@/hooks/auth/useZitadelAuth';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { handleTokenError, localStorageToken } from 'services/cache';

export const Route = createFileRoute('/logout')({
  component: () => {
    const navigate = useNavigate();
    const { userManager } = useZitadelAuth();

    useEffect(() => {
      const doCleanup = async () => {
        try {
          // Clear app tokens/local state
          localStorageToken.removeToken();
          // Remove OIDC user from storage to ensure isAuthenticated becomes false
          await userManager.removeUser();
        } catch (e) {
          // Fallback: clear all local storage if needed
          handleTokenError();
        } finally {
          navigate({ to: '/login', replace: true });
        }
      };
      doCleanup();
    }, [navigate, userManager]);

    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
        <span style={{ marginLeft: 8 }}>Signing out…</span>
      </div>
    );
  },
});

