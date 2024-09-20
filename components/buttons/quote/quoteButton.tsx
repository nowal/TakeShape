import { useState, useEffect, FC } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  ButtonsCvaLink,
  TButtonsCvaLinkProps,
} from '@/components/cva/link';

type TProps = TButtonsCvaLinkProps;
const QuoteButton: FC<TProps> = ({ ...props }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth]);

  if (isSignedIn) {
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

export default QuoteButton;
