'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PainterDashboard from '../../components/painterDashboard'; // Adjust the import path as necessary
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const PainterDashboardPage = () => {
    // Adjust the state to accept both a Firebase User object or null
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // User is signed in, set user state with the User object
                setUser(currentUser);
            } else {
                // No user is signed in, redirect or handle accordingly
                router.push('/login'); // Adjust as needed for your routing
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    return user ? <PainterDashboard /> : <div>Loading...</div>; // Optionally handle loading state
};

export default PainterDashboardPage;
