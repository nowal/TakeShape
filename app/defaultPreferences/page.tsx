'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation'; // Make sure this import matches your routing library
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { defaultPreferencesAtom } from '../../atom/atom'; // Adjust the import paths as necessary

const DefaultPreferences = () => {
    const firestore = getFirestore();
    const auth = getAuth();
    const router = useRouter();
    const [authInitialized, setAuthInitialized] = useState(false);

    // Use the defaultPreferencesAtom directly
    const [defaultPreferences, setDefaultPreferences] = useAtom(defaultPreferencesAtom);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthInitialized(true);
            } else {
                setAuthInitialized(false);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        const fetchUserDefaultPreferences = async () => {
            if (!auth.currentUser || !authInitialized) return;
            
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);
            if (!querySnapshot.empty) {
                const userImageDoc = querySnapshot.docs[0].data();
                if (userImageDoc.paintPreferencesId) {
                    const paintPrefDocRef = doc(firestore, "paintPreferences", userImageDoc.paintPreferencesId);
                    const paintPrefDocSnap = await getDoc(paintPrefDocRef);
                    if (paintPrefDocSnap.exists()) {
                        setDefaultPreferences(paintPrefDocSnap.data());
                    }
                }
            }
        };

        if (authInitialized) {
            fetchUserDefaultPreferences();
        }
    }, [authInitialized, auth.currentUser, firestore, setDefaultPreferences]);

    const updateAdditionalInfo = async () => {
        if (!auth.currentUser) return;

        try {
            const paintPrefDocRef = doc(firestore, 'paintPreferences', auth.currentUser.uid);
            await setDoc(paintPrefDocRef, defaultPreferences, { merge: true });

            // Redirect to the roomPreferences page after setting defaults
            router.push('/roomPreferences');
        } catch (error) {
            console.error('Error updating paint preferences: ', error);
        }
    };

    useEffect(() => {
        // Check if both color and finish fields have values to enable the submit button
        setIsSubmitEnabled((defaultPreferences.color || '').trim() !== '' && (defaultPreferences.finish || '').trim() !== '');
    }, [defaultPreferences.color, defaultPreferences.finish]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === "checkbox";
        const checked = isCheckbox ? e.target.checked : false;

        setDefaultPreferences(prev => ({
            ...prev,
            [name]: isCheckbox ? checked : value,
        }));
    };

    return (
        <div className="defaultPreferences flex justify-center items-center h-screen">
            <div className="form-container text-center">
                <h2 className="text-2xl font-bold mb-8">Set Your Default Painting Preferences</h2>
                <div className="preferences-row flex flex-col items-center gap-4 mb-6">
                    <input type="text" name="color" placeholder="Color" value={defaultPreferences.color || ''} onChange={handleChange} className="input-field" />
                    <input type="text" name="finish" placeholder="Finish" value={defaultPreferences.finish || ''} onChange={handleChange} className="input-field" />
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="ceilings" checked={defaultPreferences.ceilings || false} onChange={handleChange} /> Paint Ceilings
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="trim" checked={defaultPreferences.trim || false} onChange={handleChange} /> Paint Doors and Trim
                    </label>
                </div>
                <div className="button-group flex justify-center gap-4"> {/* Flex container for buttons */}
                    <button 
                        onClick={() => router.push('/quote')} 
                        className="resubmit-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                    >
                        Resubmit Video
                    </button>
                    <button 
                        disabled={!isSubmitEnabled} // Disable the button if isSubmitEnabled is false
                        onClick={updateAdditionalInfo} 
                        className={`submit-btn ${!isSubmitEnabled ? 'disabled-btn' : 'button-color'} hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300`}
                    >
                        Set Defaults
                    </button>
                </div>
            </div>
    
            <style jsx>{`
                .disabled-btn {
                    background-color: grey; // Style for the disabled button
                }
                .defaultPreferences {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .form-container {
                    width: 100%;
                    max-width: 500px; // Adjust width as necessary
                    padding: 2rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border-radius: 8px;
                }
                .input-field {
                    width: 100%;
                    padding: 0.5rem;
                    margin-bottom: 0.5rem;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .preferences-row {
                    flex-direction: column;
                    gap: 1rem;
                }
                .button-group {
                    display: flex;
                    gap: 1rem;
                }
                .resubmit-btn, .submit-btn {
                    padding: 0.75rem;
                    font-size: 1rem;
                }
            `}</style>
        </div>
    );
    
};

export default DefaultPreferences;
