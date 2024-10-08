
import { useEffect, FC } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  ButtonsCvaLink,
  TButtonsCvaLinkProps,
} from '@/components/cva/link';
import { useAuth } from '@/context/auth/provider';

type TProps = TButtonsCvaLinkProps;
export const QuoteButton: FC<TProps> = ({ ...props }) => {
  const auth = useAuth();
  const firebaseAuth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user) => {
        auth.dispatchUserSignedIn(Boolean(user));
      }
    );
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [firebaseAuth]);

  if (auth.isUserSignedIn || auth.signIn.isAuthLoading) {
    return null; // Don't render the button if user is not signed in
  }

  const title = props.title ?? 'Get Quote';
  return (
    <ButtonsCvaLink
      href="/quote"
      title={title}
      intent="primary"
      size="sm"
      weight="bold"
      {...props}
    >
      {title}
    </ButtonsCvaLink>
  );
};
