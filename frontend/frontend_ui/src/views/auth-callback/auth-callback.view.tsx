import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { triggerSync } from '@/services/sync';
import { useAuth } from '@/contexts/auth-context';
import type { AuthSession } from '@/types/auth';
import { AuthCallbackUI } from './auth-callback.ui';

type VerifyStatus = 'idle' | 'verifying' | 'syncing' | 'done' | 'error';

export function AuthCallbackView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setVerifyStatus('error');
      setErrorMessage(
        'This sign-in link is missing or invalid. Please request a new one.',
      );
      return;
    }

    async function processCallback() {
      setVerifyStatus('verifying');

      try {
        // TODO: endpoint GET /auth/v1/verify not found in openapi-specs — verify with backend team
        // Stub: simulate token verification with Supabase
        await new Promise<void>((resolve) => setTimeout(resolve, 800));

        // Simulate a session response
        const mockSession: AuthSession = {
          accessToken: `mock-jwt-${Date.now()}`,
          refreshToken: `mock-refresh-${Date.now()}`,
          user: { id: 'user-uuid-stub', email: 'user@example.com' },
        };

        signIn(mockSession);
        setVerifyStatus('syncing');

        // Trigger sync after auth — this uses the real sync-service
        try {
          await triggerSync();
        } catch {
          // Sync failure is non-fatal: user still proceeds
          console.warn('Sync failed after auth — will retry on next connection');
        }

        setVerifyStatus('done');
        navigate('/', { replace: true });
      } catch (err) {
        const error = err as { status?: number; message?: string };
        setVerifyStatus('error');
        if (error.status === 401) {
          setErrorMessage(
            'This sign-in link has expired or already been used. Please request a new one.',
          );
        } else {
          setErrorMessage('Something went wrong. Please try again.');
        }
      }
    }

    void processCallback();
  }, [searchParams, signIn, navigate]);

  return <AuthCallbackUI verifyStatus={verifyStatus} errorMessage={errorMessage} />;
}
