import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

type AvailableQuotesButtonProps = {
  text: string;
  className?: string;
};

const AvailableQuotesButton: React.FC<
  AvailableQuotesButtonProps
> = ({ text, className }) => {
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth]);

  if (!isSignedIn) {
    return null; // Don't render the button if user is not signed in
  }

  return (
    <Link href={'/dashboard'}>
      <button className={`button-green ${className || ''}`}>
        {text}
      </button>
      <style jsx>{`
        .shadow {
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </Link>
  );
};

export default AvailableQuotesButton;
