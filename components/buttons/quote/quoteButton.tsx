
import { useEffect, FC } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  CvaLink,
  TCvaLinkProps,
} from '@/components/cva/link';
import { useAuth } from '@/context/auth/provider';

type TProps = Omit<TCvaLinkProps, 'ref' | 'href'> & { href?: string };
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

  if (auth.isUserSignedIn || auth.isAuthLoading) {
    return null; // Don't render the button if user is not signed in
  }

  const title = props.title ?? 'Get Quotes';
  // In quoteButton.tsx
  const { href = "/quote", ...restProps } = props;
  return (
    <CvaLink
      href={href}
      title={title}
      intent="primary"
      size="sm"
      weight="bold"
      {...restProps}
    >
      {title}
    </CvaLink>
  );
};
