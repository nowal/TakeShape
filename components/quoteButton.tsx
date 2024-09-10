import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ButtonsCvaLink } from '@/components/cva/link';

type QuoteButtonProps = {
  text: string;
  className?: string;
};

const QuoteButton: React.FC<QuoteButtonProps> = ({
  text,
  className,
}) => {
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
  const title = 'Get Quote';
  return (
    <ButtonsCvaLink
      href="/quote"
      title={title}
      intent="primary"
      size="sm"
      weight='bold'
    >
      {title}
    </ButtonsCvaLink>
    // <Link href="/quote">
    //   <button className={`shadow button-color hover:bg-green-900 text-white rounded ${className || ''}`}>
    //     {text}
    //   </button>
    //   <style jsx>{`
    //     .shadow {
    //       box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    //     }
    //   `}</style>
    // </Link>
  );
};

export default QuoteButton;
