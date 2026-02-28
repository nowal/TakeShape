import { useEffect, FC } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  CvaLink,
  TCvaLinkProps,
} from '@/components/cva/link';
import { useAuth } from '@/context/auth/provider';
import firebase from '@/lib/firebase';

type TProps = Omit<TCvaLinkProps, 'ref' | 'href'> & { href?: string };

export const SignUpButton: FC<TProps> = ({ ...props }) => {
  const auth = useAuth();
  const firebaseAuth = getAuth(firebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user) => {
        auth.dispatchUserSignedIn(Boolean(user));
      }
    );
    return () => unsubscribe();
  }, [firebaseAuth, auth]);

  if (auth.isUserSignedIn || auth.isAuthLoading) {
    return null;
  }

  const title = props.title ?? 'Sign Up';
  const { href = '/providerRegister', ...restProps } = props;

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
