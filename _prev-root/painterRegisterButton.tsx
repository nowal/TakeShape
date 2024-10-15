import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

const PainterRegisterButton = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsSignedIn(!!user); // !!user will be true if user is not null
        });

        // Clean up the listener on unmount
        return unsubscribe;
    }, [auth]);

    if (isSignedIn) {
        return null; // Don't render the button if user is signed in
    }

    return (
        <Link href="/painterRegister">
            <button className="shadow bg-green-800 hover:bg-green-900 text-white py-2 px-4 rounded">
                Register as a painter
            </button>
            <style jsx>{`
        .shadow {
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        }
      `}</style>
        </Link>
    );
};

export default PainterRegisterButton;

