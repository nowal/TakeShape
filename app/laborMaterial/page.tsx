'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { getFirestore, doc, getDocs, query, collection, where, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

const QuoteTypeSelection = () => {
    const router = useRouter();
    const firestore = getFirestore();
    const auth = getAuth();

    const handleSelection = async (selection: boolean) => {
        if (!auth.currentUser) {
            console.log('User not logged in or auth status is being checked');
            return;
        }

        const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(userImagesQuery);

        if (querySnapshot.empty) {
            console.log('No userImage document found for the current user');
            return;
        }

        const userImageDocId = querySnapshot.docs[0].id; // Assuming there's only one userImage document per user
        const userImageRef = doc(firestore, 'userImages', userImageDocId);

        try {
            await updateDoc(userImageRef, {
                laborAndMaterial: selection
            });
            console.log('Document successfully updated');
            if (selection) {
                router.push('/defaultPreferences'); // Labor and Material
            } else {
                router.push('/defaultPreferences'); // Labor Only
            }
        } catch (error) {
            console.error('Error updating document: ', error);
        }
    };

    return (
        <div className="quoteTypeSelection flex flex-col justify-start items-center h-screen">
            <GoogleAnalytics gaId="G-47EYLN83WE" />
            <div className="card-container text-center mt-10 md:mt-20">
                <h2 className="text-2xl font-bold mb-8">Do you want the painters to quote you for labor and material or just labor?</h2>
                <div className="options-row flex gap-4 justify-center">
                    <button 
                        onClick={() => handleSelection(true)} 
                        className="labor-material-btn button-color hover:bg-green-900 text-white py-2 px-4 rounded transition duration-300"
                    >
                        Labor and Material
                    </button>
                    <button 
                        onClick={() => handleSelection(false)} 
                        className="labor-only-btn button-color hover:bg-green-900 text-white py-2 px-4 rounded transition duration-300"
                    >
                        Labor Only
                    </button>
                </div>
            </div>

            <style jsx>{`
                .quoteTypeSelection {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    height: 100vh;
                }
                .card-container {
                    width: 100%;
                    max-width: 500px;
                    padding: 2rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    margin-top: 10vh;
                    background-color: #fff; // Ensure card has a white background
                }
                .options-row {
                    display: flex;
                    gap: 1rem;
                }
                .labor-only-btn, .labor-material-btn {
                    padding: 0.75rem 1.5rem; // Adjust padding for better visual appearance
                    font-size: 1rem;
                    width: fit-content; // Buttons should only be as wide as their content + padding
                }
            `}</style>
        </div>
    );
};

export default QuoteTypeSelection;
