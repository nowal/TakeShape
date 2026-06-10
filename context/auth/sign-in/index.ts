import {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from '@/lib/auth';
import firebase from '@/lib/firebase';
import { TAuthConfig } from '@/context/auth/types';
import { useApp } from '@/context/app/provider';
import { getCommunicationDashboardPath } from '@/lib/provider-dashboard/links';
import { takeshapeAppSupabaseBrowser } from '@/lib/supabase/takeshape-app-browser';
import { useSearchParams } from 'next/navigation';

export const useSignIn = ({
  isUserSignedIn,
  dispatchUserSignedIn,
  dispatchAuthLoading,
  onSignOut,
}: TAuthConfig) => {
  const AUTH_INIT_TIMEOUT_MS = 5000;
  const SIGN_IN_TIMEOUT_MS = 15000;
  const { onNavigateScrollTopClick } = useApp();
  const searchParams = useSearchParams();
  const [isShowModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignInSubmitting, setSignInSubmitting] =
    useState(false); // Loading state for login button
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null); // Error message state
  const auth = getAuth(firebase);
  const requestedProviderId =
    searchParams.get('provider') || searchParams.get('providerId');

  const withTimeout = async <T,>(
    promise: Promise<T>,
    timeoutMs: number,
    message: string
  ): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  };

  const getCurrentAccessToken = async () => {
    const { data, error } =
      await takeshapeAppSupabaseBrowser.auth.getSession();
    if (error) throw error;
    return data.session?.access_token || '';
  };

  const completeProviderClaim = async (providerId: string) => {
    const accessToken = await getCurrentAccessToken();
    if (!accessToken) {
      throw new Error('A signed-in Supabase session is required.');
    }

    const response = await fetch('/api/provider-auth/complete', {
      body: JSON.stringify({
        providerId,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const payload = (await response.json().catch(() => ({}))) as {
      dashboardPath?: string;
      error?: string;
      ok?: boolean;
    };

    if (!response.ok || !payload.ok || !payload.dashboardPath) {
      throw new Error(
        payload.error || 'Provider dashboard setup failed.'
      );
    }

    return payload.dashboardPath;
  };

  const getSignedInProviderPath = async (userId: string) => {
    const response = await fetch(
      `/api/providers/by-user?userId=${encodeURIComponent(userId)}`
    );
    const payload = await response.json().catch(() => ({}));
    const providerData = payload?.provider as
      | { id?: unknown }
      | null
      | undefined;
    const providerId = providerData?.id
      ? String(providerData.id)
      : '';

    return providerId
      ? getCommunicationDashboardPath(providerId)
      : null;
  };

  useEffect(() => {
    let isMounted = true;
    const authInitTimeout = setTimeout(() => {
      if (!isMounted) return;
      console.warn(
        'Auth state initialization timed out. Continuing as signed out.'
      );
      dispatchUserSignedIn(false);
      dispatchAuthLoading(false);
    }, AUTH_INIT_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!isMounted) return;
        clearTimeout(authInitTimeout);
        const isUser = Boolean(user);
        dispatchUserSignedIn(isUser);
        dispatchAuthLoading(false); // Authentication state is confirmed, loading is done
      },
      (error) => {
        if (!isMounted) return;
        console.error('Error while initializing auth state:', error);
        clearTimeout(authInitTimeout);
        dispatchUserSignedIn(false);
        dispatchAuthLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(authInitTimeout);
      unsubscribe();
    };
  }, [auth, dispatchAuthLoading, dispatchUserSignedIn]);

  const handleSignIn = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSignInSubmitting(true); // Set loading state to true
    setErrorMessage(null); // Reset error message state
    try {
      const signInDirect = () =>
        withTimeout(
          signInWithEmailAndPassword(auth, email, password),
          SIGN_IN_TIMEOUT_MS,
          'Sign-in timed out. Please try again.'
        );

      try {
        await signInDirect();
      } catch (signInError) {
        const signInMessage =
          signInError instanceof Error
            ? signInError.message
            : String(signInError || '');
        const shouldTryMigrationBridge =
          signInMessage.toLowerCase().includes('invalid login credentials');

        if (!shouldTryMigrationBridge) {
          throw signInError;
        }

        const bridgeResponse = await fetch(
          '/api/auth/migrate-signin',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        if (!bridgeResponse.ok) {
          throw signInError;
        }

        await signInDirect();
      }
      setShowModal(false);

      // Check if the signed-in user is in the reAgents collection
      const currentUser = auth.currentUser;
      const isUser = currentUser !== null;

      if (isUser) {
        dispatchUserSignedIn(isUser);
        const dashboardPath = requestedProviderId
          ? await completeProviderClaim(requestedProviderId)
          : await getSignedInProviderPath(currentUser.uid);
        onNavigateScrollTopClick(dashboardPath || '/call');
        dispatchAuthLoading(false);
      } else {
        console.error('Error current user is null');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to sign in right now. Please try again.';
      if (
        message.includes('timed out') ||
        message.includes('network-request-failed')
      ) {
        setErrorMessage(
          'Sign-in timed out on this browser. Please refresh, then try again.'
        );
      } else if (
        message.toLowerCase().includes('provider') ||
        message.toLowerCase().includes('dashboard') ||
        message.toLowerCase().includes('supabase')
      ) {
        setErrorMessage(message);
      } else {
        setErrorMessage(
          'Incorrect email or password. Please try again.'
        );
      }
    } finally {
      setSignInSubmitting(false); // Reset loading state
    }
  };

  // const handleSignOut = async () => {
  //   try {
  //     await signOut(auth);
  //     onNavigateScrollTopClick('/');
  //   } catch (error) {
  //     console.error('Error signing out:', error);
  //   } finally {
  //     setProfilePictureUrl(null);
  //   }
  //   sessionStorage.clear();
  // };

  const handleEmailChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  const handleClick = () => {
    if (isUserSignedIn) {
      onSignOut();
      return;
    } else {
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return {
    isSignInSubmitting,
    isShowModal,
    email,
    password,
    errorMessage,
    onEmailChange: handleEmailChange,
    onPasswordChange: handlePasswordChange,
    onClose: handleClose,
    onSignInButtonClick: handleClick,
    onSignIn: handleSignIn,
    dispatchSignInModalOpen: setShowModal,
  };
};
