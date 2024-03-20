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
    const [showCeilingFields, setShowCeilingFields] = useState(defaultPreferences.ceilings || false);
    const [showTrimFields, setShowTrimFields] = useState(defaultPreferences.trim || false);

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

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setDefaultPreferences((prev) => ({
            ...prev,
            [name]: checked,
        }));

        if (name === "ceilings") {
            setShowCeilingFields(checked);
        } else if (name === "trim") {
            setShowTrimFields(checked);
        }
    };

    // Update the handleChange function to include handleCheckboxChange for checkbox fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const { name, value } = target;
        const isCheckbox = target.type === "checkbox";

        if (isCheckbox) {
            handleCheckboxChange(e as React.ChangeEvent<HTMLInputElement>);
        } else {
            setDefaultPreferences((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };
    

    return (
        <div className="defaultPreferences flex flex-col justify-start items-center h-screen">
            <div className="form-container text-center mt-10 md:mt-20">
                <h2 className="text-2xl font-bold mb-8">Set Your Default Painting Preferences</h2>
                <div className="preferences-row flex flex-col items-center gap-2 mb-6">
                    <input type="text" name="color" placeholder="Wall Color" value={defaultPreferences.color || ''} onChange={handleChange} className="input-field" />
                    {/* Style the link as a traditional hyperlink */}
                    <a href="https://www.thisoldhouse.com/painting/21015206/how-to-choose-the-right-colors-for-your-rooms" target="_blank" rel="noopener noreferrer" className="help-link">
                        Need help picking a paint color?
                    </a>
                    <div className="select-container flex items-center gap-4 w-full">
                        <select name="finish" value={defaultPreferences.finish || ''} onChange={handleChange} className="input-field select-field">
                            <option value="Eggshell">Eggshell</option>
                            <option value="Flat">Flat</option>
                            <option value="Satin">Satin</option>
                            <option value="Semi-gloss">Semi-Gloss</option>
                            <option value="High-gloss">High Gloss</option>
                        </select>
                        <span className="tooltip">?
                            <span className="tooltiptext">We default to eggshell finish because of its versatility, but you are welcome to pick whatever finish you prefer</span>
                        </span>
                    </div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="ceilings" checked={defaultPreferences.ceilings || false} onChange={handleChange} /> Do you any of your ceilings painted?
                    </label>
                    {showCeilingFields && (
                        <div className="extra-fields-row flex justify-between w-full">
                            <input type="text" name="ceilingColor" placeholder="Ceiling Color" value={defaultPreferences.ceilingColor || ''} onChange={handleChange} className="input-field" />
                            <select name="ceilingFinish" value={defaultPreferences.ceilingFinish || ''} onChange={handleChange} className="input-field select-field">
                                <option value="Flat">Flat</option>
                                <option value="Eggshell">Eggshell</option>
                                <option value="Satin">Satin</option>
                                <option value="Semi-gloss">Semi-Gloss</option>
                                <option value="High-gloss">High Gloss</option>
                            </select>
                        </div>
                    )}
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="trim" checked={defaultPreferences.trim || false} onChange={handleChange} /> Do you want any of your trim and doors painted?
                    </label>
                    {showTrimFields && (
                        <div className="extra-fields-row flex justify-between w-full">
                            <input type="text" name="trimColor" placeholder="Trim Color" value={defaultPreferences.trimColor || ''} onChange={handleChange} className="input-field" />
                            <select name="trimFinish" value={defaultPreferences.trimFinish || ''} onChange={handleChange} className="input-field select-field">
                                <option value="Semi-gloss">Semi-Gloss</option>
                                <option value="Flat">Flat</option>
                                <option value="Eggshell">Eggshell</option>
                                <option value="Satin">Satin</option>
                                <option value="High-gloss">High Gloss</option>
                            </select>
                        </div>
                    )}
                    <select name="trimFinish" value={defaultPreferences.trimFinish || ''} onChange={handleChange} className="input-field select-field">
                                <option value="Semi-gloss">Paint Quality</option>
                                <option value="Flat">Budget Quality</option>
                                <option value="Eggshell">Medium Quality</option>
                                <option value="Satin">High Quality</option>
                            </select>
                    <p className="note-text px-4">Each painter will specify the type of paint that they will use in their quote.</p>
                </div>
                <div className="button-group flex justify-center gap-4">
                    <button 
                        onClick={() => router.push('/quote')} 
                        className="resubmit-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                    >
                        Resubmit Video
                    </button>
                    <button 
                        disabled={!isSubmitEnabled}
                        onClick={updateAdditionalInfo} 
                        className={`submit-btn ${!isSubmitEnabled ? 'disabled-btn' : 'button-color'} hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300`}
                    >
                        Set Defaults
                    </button>
                </div>
            </div>
    
            <style jsx>{`
                .disabled-btn {
                    background-color: grey;
                }
                .defaultPreferences {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    height: 100vh;
                }
                .form-container {
                    width: 100%;
                    max-width: 500px;
                    padding: 2rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    margin-top: 10vh;
                }
                .input-field, .select-field {
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
                .tooltip {
                    position: relative;
                    display: inline-block;
                    border-bottom: 1px dotted black;
                }
                .tooltip .tooltiptext {
                    visibility: hidden;
                    width: 120px;
                    background-color: black;
                    color: #fff;
                    text-align: center;
                    border-radius: 6px;
                    padding: 5px 0;
                    position: absolute;
                    z-index: 1;
                    bottom: 100%;
                    left: 50%;
                    margin-left: -60px;
                }
                .tooltip:hover .tooltiptext {
                    visibility: visible;
                }
                .help-link {
                    color: blue; /* Change the color to blue */
                    text-decoration: underline; /* Add underline */
                    cursor: pointer; /* Change cursor to pointer on hover */
                    margin-bottom: 1rem; /* Adjust spacing */
                }
                .note-text {
                    text-align: center;
                    color: #666; /* You can adjust the color as needed */
                    font-size: 0.875rem; /* Adjust the font size as needed */
                    max-width: 90%; /* Ensure it doesn't stretch too wide on larger screens */
                    margin: 20px auto; /* Add some spacing around the note */
                }
            `}</style>
        </div>
    );
    
    
    
};

export default DefaultPreferences;
