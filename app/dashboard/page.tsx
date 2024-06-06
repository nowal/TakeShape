'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { timestampPairsAtom } from '../../atom/atom';
import { userDataAtom, isPainterAtom, documentIdAtom, checkingAuthAtom, userTypeLoadingAtom, videoURLAtom, uploadStatusAtom, uploadProgressAtom } from '../../atom/atom'; // Import all required atoms
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, setDoc, getDoc, arrayUnion, DocumentReference, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import PainterDashboard from '../../components/painterDashboard';
import QuoteButtonDashboard from '../../components/quoteButtonDashboard';
import PainterCard from '../../components/painterCard';
import RoomCard from '@/components/roomCard';
import { TimestampPair, UserData, PaintPreferences } from '@/types/types';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePayment from "@/components/stripePayment";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';


type ModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    price: number | null;
    phoneNumber: string;
    setPhoneNumber: (number: string) => void;
    painterId: string;
};

type Price = {
    painterId: string;
    amount: number;
    timestamp: number;
    accepted?: boolean; // Optional because it will not exist on all objects initially
  };

const Modal: React.FC<ModalProps> = ({ showModal, setShowModal, price, phoneNumber, setPhoneNumber, painterId }) => {
    if (!showModal) return null;

    const [modalStep, setModalStep] = useState(1);
    const firestore = getFirestore();
    const auth = getAuth();

    const depositAmount = price ? parseFloat((price * 0.02).toFixed(2)) : 0;

    const handlePhoneSubmit = async () => {
        // Assuming phoneNumber is already set and you have the painterId and documentId
    
        // Step 1: Update the homeowner's document with the phone number

        if (auth.currentUser) {
            // First, get the document reference for the userImages document
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);
    
            if (!querySnapshot.empty) {
                // Assuming there's only one document per user in the userImages collection
                const userImageDoc = querySnapshot.docs[0];
                const documentId = userImageDoc.id;

                try {
                    if (documentId && phoneNumber) {
                        const userImageRef = doc(firestore, "userImages", documentId);
                        let prices = userImageDoc.data().prices; // Assuming this gets you the array of prices
                        let updatedPrices = prices.map((price: Price) => {
                            if (price.painterId === painterId) {
                                return { ...price, accepted: true }; // Update the accepted field for the matched painterId
                            }
                            return price;
});
                        await updateDoc(userImageRef, {
                            phoneNumber: phoneNumber,
                            prices: updatedPrices,
                        });
                    }
                } catch (error) {
                    console.error("Error updating homeowner's document: ", error);
                }
            
                // Step 2: Add the quote's document ID to the painter's acceptedQuotes array
                try {
                    const painterQuery = query(collection(firestore, "painters"), where("userId", "==", painterId));
                    const querySnapshot = await getDocs(painterQuery);
            
                    if (!querySnapshot.empty) {
                        const painterDocRef = querySnapshot.docs[0].ref;

                        const painterDoc = querySnapshot.docs[0];
            
                        // Use arrayUnion to add the documentId to the acceptedQuotes array without duplicates
                        await updateDoc(painterDocRef, {
                            acceptedQuotes: arrayUnion(documentId),
                        });
            
                        // Move to the payment step after successfully updating both documents
                        //setModalStep(2);
                        setShowModal(false);
                        window.location.reload();
                    }
                } catch (error) {
                    console.error("Error adding quote to painter's acceptedQuotes: ", error);
                }
            }
        }
    };

    const handlePayment = async () => {
        const stripePromise = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

        return (
            <Elements stripe={stripePromise}>
                <StripePayment price={depositAmount} />
            </Elements>
        );
        
    }

    return (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            {modalStep === 1 && (
    <div className="modal-content bg-white p-8 rounded-lg shadow-lg relative w-96 max-w-95-percent">
      <h2 className="text-center text-xl font-semibold mb-4">Congrats on accepting your quote!</h2>
      <p className="mb-4">Please enter your phone number below so that we can connect you with:</p>
      <PainterCard painterId={painterId}/>
      <input 
        type="tel" 
        value={phoneNumber} 
        onChange={(e) => setPhoneNumber(e.target.value)} 
        placeholder="Your phone number"
        className="input-field border-2 border-gray-300 focus:border-green-500 w-full py-2 px-4 mb-6 mt-4" 
      />
      <button onClick={() => setShowModal(false)} className="close-modal absolute top-3 right-3 text-2xl">X</button>
      <button onClick={handlePhoneSubmit} className="block shadow button-color hover:bg-green-900 text-white rounded py-2 px-4 mx-auto">Submit</button>
    </div>
  )}

  {modalStep === 2 && (
    <div className="modal-content bg-white p-8 rounded-lg shadow-lg relative w-96 max-w-95-percent">
      <PainterCard painterId={painterId}/>
      <p className="mt-4 mb-6">We hold a 2% deposit for the painter that is fully applied to your quoted price. Securely pay this deposit with Stripe.</p>
      <button onClick={() => setShowModal(false)} className="close-modal absolute top-3 right-3 text-2xl">X</button>
      <button onClick={() => handlePayment()} className="stripe-pay-button bg-blue-500 hover:bg-blue-700 text-white rounded py-2 px-4 mx-auto block">Pay with Stripe</button>
    </div>
  )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    position: relative; /* Ensures that the absolute positioning of children is relative to this container */
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    width: 500px;
                    max-width: 95%;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                h2, p {
                    font-size: 1.25rem; /* Increased text size */
                }
                input[type="tel"], .submit-phone-btn {
                    font-size: 1rem; /* Adjust the font size as needed */
                    margin-top: 0.5rem; /* Space between the input and the label/text */
                }
                .submit-phone-btn {
                    padding: 10px 20px; /* Larger button padding */
                    margin-top: 1rem; /* More space above the button */
                }
                .close-modal {
                    position: absolute; /* Positions the button absolutely within the relative container */
                    top: 10px; /* Adjusts the top position */
                    right: 10px; /* Adjusts the right position */
                    background-color: transparent;
                    border: none;
                    font-size: 1.5rem; /* Increases the size of the 'X' */
                    cursor: pointer;
                    z-index: 10; /* Ensures it's above other elements */
                }
                .stripe-pay-button {
                    background-color: #6772e5;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                }
                .stripe-pay-button:hover {
                    background-color: #5469d4;
                }
            `}</style>
        </div>
    );
};

const Dashboard = () => {
    const [userData, setUserData] = useAtom(userDataAtom);
    const [timestampPairs, setTimestampPairs] = useAtom(timestampPairsAtom);
    const [isPainter, setIsPainter] = useAtom(isPainterAtom);
    const [checkingAuth, setCheckingAuth] = useAtom(checkingAuthAtom);
    const [userTypeLoading, setUserTypeLoading] = useAtom(userTypeLoadingAtom); // Atom to manage loading state of user type check and data fetching
    const [phoneNumber, setPhoneNumber] = useState('');
    const [painterId, setPainterId] = useState('');
    const [uploadProgress, setUploadProgress] = useAtom(uploadProgressAtom);
    const [videoURL, setVideoURL] = useAtom(videoURLAtom);
    const [uploadStatus, setUploadStatus] = useAtom(uploadStatusAtom);
    const [documentId] = useAtom(documentIdAtom);
    const [acceptedQuote, setAcceptedQuote] = useState<Price | null>(null);
    const [defaultPaintColor, setDefaultPaintColor] = useState('');
    const [defaultPaintFinish, setDefaultPaintFinish] = useState('');
    const [ceilingPaint, setCeilingPaint] = useState(false);
    const [doorsAndTrimPaint, setDoorsAndTrimPaint] = useState(false);
    const [currentTimestampPair, setCurrentTimestampPair] = useState<TimestampPair>({
        startTime: 0,
        endTime: 0,
        color: '',
        finish: '',
        ceilings: false,
        trim: false,
        roomName: '',
      });
    const [currentPreferences, setCurrentPreferences] = useState<PaintPreferences>({
        color: '', // Default values or fetched from your initial data
        finish: '',
        ceilings: false,
        trim: false,
      });
    const [addingRoom, setAddingRoom] = useState(false);
    const [laborAndMaterial, setLaborAndMaterial] = useState(true); // Default to true
    const [morePreferences, setMorePreferences] = useState(true);
    const [videoSelectionStart, setVideoSelectionStart] = useState<number | null>(null);
    const firestore = getFirestore();
    const [userImageRef, setUserImageRef] = useState<DocumentReference | null>(null);
    const auth = getAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomCardsContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchUserData = async () => {
        if (!auth.currentUser) return;
        const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(userImagesQuery);
      
        if (!querySnapshot.empty) {
          const userImageDocRef = querySnapshot.docs[0].ref; // Get the document reference
          setUserImageRef(userImageDocRef); // Store it in state
        }
      };

      useEffect(() => {
        const fetchUserImagePreferences = async () => {
            if (!auth.currentUser) return;
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);
      
            if (!querySnapshot.empty) {
                // Assuming there's only one userImages document per user
                const userImageDocData = querySnapshot.docs[0].data();
                setLaborAndMaterial(userImageDocData.laborAndMaterial ?? true); // Use nullish coalescing to default to true
                setMorePreferences(userImageDocData.morePreferences ?? true); // Use nullish coalescing to default to true
            }
        };

        fetchUserImagePreferences();
    }, [auth.currentUser, firestore]);

      useEffect(() => {
        const currentTime = videoRef.current?.currentTime || 0;
        const matchingPairs = timestampPairs.filter(pair => currentTime >= pair.startTime);
        const highestStartPair = matchingPairs.reduce((acc, pair) => (acc.startTime > pair.startTime ? acc : pair), matchingPairs[0]);

        if (highestStartPair) {
            setCurrentTimestampPair(highestStartPair); // Make sure this includes roomName
        } else {
            // Default or fallback logic, ensure roomName is handled appropriately here too
            setCurrentTimestampPair({
                startTime: currentTime,
                endTime: undefined,
                color: defaultPaintColor,
                finish: defaultPaintFinish,
                ceilings: ceilingPaint,
                trim: doorsAndTrimPaint,
                roomName: 'Default Room', // Example fallback roomName
            });
        }
    }, [videoRef.current, timestampPairs, defaultPaintColor, defaultPaintFinish, ceilingPaint, doorsAndTrimPaint]);
    

      useEffect(() => {
        // Declare intervalId outside the attemptAccessVideo function to control its scope
        let intervalId: NodeJS.Timeout | null = null;
    
        const attemptAccessVideo = () => {
            const video = videoRef.current;
            if (video) {
                // Once the video is available, clear the interval
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null; // Reset intervalId to null after clearing it
                }
    
                // Define your event handlers here as before
                const handleTimeUpdate = () => {
                    const currentTime = video.currentTime;
                
                    const matchingPairs = timestampPairs.filter(pair => currentTime >= pair.startTime);
                    const highestStartPair = matchingPairs.reduce((acc, pair) => (acc.startTime > pair.startTime ? acc : pair), matchingPairs[0]);
                    
                    if (highestStartPair) {
                        setCurrentTimestampPair(highestStartPair);
                    } else {
                        setCurrentTimestampPair({
                            startTime: currentTime,
                            color: defaultPaintColor,
                            finish: defaultPaintFinish,
                            ceilings: ceilingPaint,
                            trim: doorsAndTrimPaint,
                            roomName: '',
                        });
                    }
                };
    
                video.addEventListener('timeupdate', handleTimeUpdate);
                video.addEventListener('seeked', handleTimeUpdate);
    
                return () => {
                    video.removeEventListener('timeupdate', handleTimeUpdate);
                    video.removeEventListener('seeked', handleTimeUpdate);
                };
            } else {
                if (!intervalId) {
                    intervalId = setInterval(attemptAccessVideo, 100);
                }
            }
        };
    
        attemptAccessVideo();
    
        // Cleanup function to clear the interval when the component unmounts
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [timestampPairs, defaultPaintColor, defaultPaintFinish, ceilingPaint, doorsAndTrimPaint, videoRef]);
    
    

    useEffect(() => {
        // Function to determine the current timestamp pair or revert to defaults
        const determineCurrentTimestampOrRevertToDefaults = () => {
            const currentTime = videoRef.current?.currentTime || 0;
            const matchingPairs = timestampPairs.filter(pair => currentTime >= pair.startTime);
            const highestStartPair = matchingPairs.reduce((acc, pair) => (acc.startTime > pair.startTime ? acc : pair), matchingPairs[0]);
    
            if (highestStartPair) {
                setCurrentTimestampPair(highestStartPair);
            } else {
                setCurrentTimestampPair({
                    startTime: currentTime,
                    color: defaultPaintColor,
                    finish: defaultPaintFinish,
                    ceilings: ceilingPaint,
                    trim: doorsAndTrimPaint,
                    roomName: '',
                });
            }
        };
    
        // Invoke immediately to adjust based on the current state of timestampPairs
        determineCurrentTimestampOrRevertToDefaults();
    
        // Additionally, you might want to listen to 'timeupdate' or 'seeked' events of the video
        // to ensure the displayed RoomCard always reflects the correct timestamp pair or defaults
        const video = videoRef.current;
        if (video) {
            video.addEventListener('timeupdate', determineCurrentTimestampOrRevertToDefaults);
            video.addEventListener('seeked', determineCurrentTimestampOrRevertToDefaults);
    
            // Cleanup
            return () => {
                video.removeEventListener('timeupdate', determineCurrentTimestampOrRevertToDefaults);
                video.removeEventListener('seeked', determineCurrentTimestampOrRevertToDefaults);
            };
        }
    }, [timestampPairs, defaultPaintColor, defaultPaintFinish, ceilingPaint, doorsAndTrimPaint, videoRef]);

    
    
      
      useEffect(() => {
        if (auth.currentUser) {
          fetchUserData();
        }
      }, [auth.currentUser]);

      useEffect(() => {
        // Your existing useEffect hooks here.

        // New useEffect hook for setting video playback speed.
        if (videoRef.current) {
            videoRef.current.playbackRate = 2.0;
        }
    }, [videoRef.current]);

    useEffect(() => {
        const fetchTimestampPairs = async () => {
          if (auth.currentUser) {
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);
      
            if (!querySnapshot.empty) {
              // Assuming the structure { timestampPairs: [{ start, end, roomName, color, finish }, ...] }
              const userImageDoc = querySnapshot.docs[0].data();
              const fetchedTimestampPairs = userImageDoc.timestampPairs || [];
              setTimestampPairs(fetchedTimestampPairs.map((pair: number[], index: number) => ({ ...pair, id: `pair-${index}` }))); // Adding a temporary ID
            }
          }
        };
      
        fetchTimestampPairs();
      }, [auth.currentUser, firestore, setTimestampPairs]);

      useEffect(() => {
        const fetchPaintPreferences = async () => {
          if (auth.currentUser) {
            const docRef = doc(firestore, "paintPreferences", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              // Assume paintPreferences fields exist
              const { color, finish, ceilings, trim } = docSnap.data();
              setDefaultPaintColor(color);
              setDefaultPaintFinish(finish);
              setCeilingPaint(ceilings); // Assuming you want to invert the boolean
              setDoorsAndTrimPaint(trim); // Assuming you want to invert the boolean
            }
          }
        };
      
        fetchPaintPreferences();
      }, [auth.currentUser, firestore]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            const checkIfPainter = async (userId: string) => {
                const painterQuery = query(collection(firestore, "painters"), where("userId", "==", userId));
                const querySnapshot = await getDocs(painterQuery);
                return !querySnapshot.empty;
            };
            if (currentUser) {
                setUserTypeLoading(true); // Start loading user type
                setIsPainter(false); // Reset isPainter state
                setUserData(null); // Reset userData state
    
                // Fetch painter or user data
                const painterQuery = query(collection(firestore, "painters"), where("userId", "==", currentUser.uid));
                const painterSnapshot = await getDocs(painterQuery);
                const isPainterValue = sessionStorage.getItem('isPainter') === 'true' || await checkIfPainter(currentUser.uid);
                setIsPainter(isPainterValue);
    
                if (isPainterValue) {
                    // Fetch painter-specific data
                    // ... (Painter-specific logic here)
                } else {
                    // Fetch regular user data
                    const dataQuery = query(collection(firestore, "userImages"), where("userId", "==", currentUser.uid));
                    const querySnapshot = await getDocs(dataQuery);
                    if (!querySnapshot.empty) {
                        const userDataDoc = querySnapshot.docs[0].data();
                        setUserData(userDataDoc); // Set user data
                    }
                }
                setUserTypeLoading(false); // Finish loading user type
            } else {
                setUserData(null);
                setIsPainter(false);
                setUserTypeLoading(false);
            }
            setCheckingAuth(false);
            setUserTypeLoading(false);
        });
    
        return () => {
            unsubscribe();
            // Reset states when component unmounts or user logs out
            setUserData(null);
            setIsPainter(false);
            setCheckingAuth(true);
            setUserTypeLoading(true);
        };
    }, [setUserData, setIsPainter, setCheckingAuth, setUserTypeLoading, auth, firestore]);

    useEffect(() => {
        if (uploadStatus === 'completed' && videoURL && documentId) {
          const docRef = doc(firestore, "userImages", documentId);
          updateDoc(docRef, {
            video: videoURL
          }).then(() => {
            window.location.reload()
          }).catch((error) => {
            console.error("Error updating document: ", error);
          });
        }
      }, [uploadStatus, videoURL, documentId, firestore]);

    useEffect(() => {
        // Ensure userData and userData.prices are defined before proceeding
        if (userData && userData.prices) {
            const accepted = userData.prices.find((price) => price.accepted);
            setAcceptedQuote(accepted || null);
        }
    }, [userData, userData?.prices]);


    const [showModal, setShowModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<number>(0);

    if (uploadStatus === 'uploading') {
        return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-2xl font-bold mb-14 px-6 py-4 bg-white rounded shadow-lg text-center">
                Uploading Video. Please leave page open: <br />
                {Math.round(uploadProgress)}%
            </p>
          </div>
          
        );
      }

    // ... (rest of your useEffect)

    const displayPreferences = (preferences: PaintPreferences) => {
        setCurrentPreferences(preferences);
    };

    const handleVideoSelection = async () => {
        if (!auth.currentUser) return;
        if (videoRef.current) {
            videoRef.current.pause();
            const currentTime = videoRef.current.currentTime;
    
            // Check if currentTime falls within any existing timestamp pair
            const isWithinExistingPair = timestampPairs.some(pair => {
                const endTime = pair.endTime === undefined ? Infinity : pair.endTime;
                return currentTime >= pair.startTime && currentTime <= endTime;
            });
    
            if (isWithinExistingPair) {
                alert("You cannot add a new room within the time range of an existing room. Please choose a different time.");
                return; // Prevent further execution
            }
    
            // If not within an existing pair, proceed to handle adding a new room
            setAddingRoom(true);
    
            // Fetch default paint preferences if any, and proceed with saving the timestamp to Firestore
            // This could involve fetching additional data like user paint preferences or using defaults
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);
            if (!querySnapshot.empty) {
                const userImageDoc = querySnapshot.docs[0].data();
                if (userImageDoc.paintPreferencesId) {
                    const paintPreferencesRef = doc(firestore, "paintPreferences", userImageDoc.paintPreferencesId);
                    const paintPreferencesSnap = await getDoc(paintPreferencesRef);
                    if (paintPreferencesSnap.exists()) {
                        const { color, finish, ceilings, trim } = paintPreferencesSnap.data();
                        saveTimestampToFirestore(currentTime, color, finish, ceilings, trim);
                    }
                }
            }
            if (roomCardsContainerRef.current) {
                roomCardsContainerRef.current.scrollTo(0, 0);
            }
        }
    };
    

    const handleTimestampPairDelete = async (startTime: number) => {
    setTimestampPairs(prevPairs => {
        const updatedPairs = prevPairs.filter(pair => pair.startTime !== startTime);

        // Update Firestore document
        if (userImageRef) {
            updateDoc(userImageRef, {
                timestampPairs: updatedPairs
            }).then(() => {
            }).catch(error => {
                console.error('Error updating Firestore: ', error);
            });
        }

        return updatedPairs;
    });
};

    const saveTimestampToFirestore = async (startTime:number, color = defaultPaintColor, finish = defaultPaintFinish, ceilings = ceilingPaint, trim = doorsAndTrimPaint) => {
        if (!auth.currentUser || !userImageRef) {
            console.error('No authenticated user or user image document reference.');
            return;
        }

        const newRoomName = "shouldn't";

        const newTimestampPair = { 
            startTime,
            color,
            finish,
            ceilings, // Use "ceilings" directly without inverting the value
            trim, // Use "trim" directly without inverting the value
            roomName: newRoomName,
        };
    
        try {
            await updateDoc(userImageRef, {
                timestampPairs: arrayUnion(newTimestampPair)
            });
    
            // Update the local state to reflect the new timestamp pair addition
            setTimestampPairs(prevPairs => [...prevPairs, newTimestampPair]);
        } catch (error) {
            console.error("Error adding timestamp pair: ", error);
        }
    };

    const endRoomAndReturnToDefaults = async () => {
        
        if (!auth.currentUser || !videoRef.current || timestampPairs.length === 0 || !userImageRef) {
            console.error("Missing required references or no timestamp pairs available.");
            return;
        }
        if (videoRef.current) {
            videoRef.current.pause(); 
        }
    
        const currentTime = videoRef.current.currentTime;
        // Find the index of the timestamp pair that was most recently added without an endTime.
        const mostRecentPairIndex = timestampPairs.findIndex(pair => pair.endTime === undefined || pair.endTime === 0);
    
        if (mostRecentPairIndex !== -1) {
            // Clone the current timestampPairs to avoid direct state mutation.
            let updatedTimestampPairs = [...timestampPairs];
            updatedTimestampPairs[mostRecentPairIndex] = {
                ...updatedTimestampPairs[mostRecentPairIndex],
                endTime: currentTime, // Update only the endTime.
            };
    
            try {
                await updateDoc(userImageRef, {
                    timestampPairs: updatedTimestampPairs,
                });
                // Fetch the latest data again to synchronize
                const updatedDoc = await getDoc(userImageRef);
                if (updatedDoc.exists()) {
                    const updatedTimestampPairs = updatedDoc.data().timestampPairs;
                    setTimestampPairs(updatedTimestampPairs); // This updates the local state with the latest from Firestore
                }
            } catch (error) {
                console.error("Error updating timestamp pair with endTime: ", error);
            }
        } else {
            console.error("No active timestamp pair to end.");
        }
    
        // Toggle addingRoom state to show "New Room" button again.
        setAddingRoom(false);
    };
    

    const handleAcceptQuote = async (painterId: string, price: number) => {
        setPainterId(painterId);
        if (auth.currentUser) {
            // First, get the document reference for the userImages document
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);
    
            if (!querySnapshot.empty) {
                // Assuming there's only one document per user in the userImages collection
                const userImageDoc = querySnapshot.docs[0];
                const userImageRef = userImageDoc.ref;
    
                // Update the document with the phone number
                await updateDoc(userImageRef, { phoneNumber: phoneNumber });
    
                // Proceed to show the payment modal
                setSelectedQuote(price);
                setShowModal(true);
            } else {
                console.error('No user image document found for the current user.');
                // Handle the error - no document found
            }
        } else {
            console.error('No authenticated user.');
            // Handle the error - no user logged in
        }
    };
    
      

    if (checkingAuth || userTypeLoading) {
        return <div className="loading text-center text-lg mt-20">Retrieving Information...</div>;
    }

    if (!auth.currentUser) {
        return <div className="loading">Please log in to view this page.</div>;
    }

    const renderQuotes = (prices: UserData['prices']) => {
        if (!prices || prices.length === 0) {
            return (
                <div className="text-2xl mb-14 mt-8 font-bold">
                    <p>Gathering Quotes...</p>
                </div>
            );
        }
        
        if (acceptedQuote) return null;
    
        return (
            <div className="quotes mb-12" style={{ width: '95%', maxWidth: '95%', margin: '0 auto' }}>
                {prices.map((price, index) => (
                    <div key={index} className="quote-item flex flex-col sm:flex-row items-center justify-between mb-5 p-3 border border-gray-300 rounded shadow-md">
                        <PainterCard painterId={price.painterId}/>
                        <div className="quote-details flex-1 flex flex-col sm:flex-row items-center justify-between pl-5 border-l-2 border-gray-300 gap-4">
                            <div className="quote-info">
                                <p className="text-lg font-bold">Quote: <span className="text-xl">${price.amount.toFixed(2)}</span></p>
                                {prices.find(price => price.painterId)?.invoiceUrl && (
                                    <a href={prices.find(price => price.painterId)?.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        Invoice
                                    </a>
                                )}
                            </div>
                            <button 
                                onClick={() => handleAcceptQuote(price.painterId, price.amount)} 
                                className="button-color hover:bg-green-900 text-white py-2 px-4 rounded transition duration-300 mt-2 sm:mt-0">
                                Accept Quote
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleRoomCardClick = (startTime: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = startTime;
        }
      };

    const updateAdditionalInfo = async () => {
        const user = auth.currentUser;
        if (!user) return; // Check if user is signed in

        try {
            // Step 1: Update Paint Preferences
            const paintPrefDocRef = doc(firestore, 'paintPreferences', user.uid);
            await setDoc(paintPrefDocRef, {
                color: defaultPaintColor,
                finish: defaultPaintFinish,
                ceilings: ceilingPaint,
                trim: doorsAndTrimPaint,
            }, { merge: true });

            // Step 2: Link Paint Preferences to User Images
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);
    
            if (!querySnapshot.empty) {
                // Assuming there's only one document per user in the userImages collection
                const userImageDoc = querySnapshot.docs[0];
                const documentId = userImageDoc.id;
                const userImageRef = doc(firestore, "userImages", documentId);
                await updateDoc(userImageRef, {
                    paintPreferencesId: paintPrefDocRef.id // Save the ID of the paint preferences document
                });
            }
        } catch (error) {
            console.error('Error updating paint preferences or linking: ', error);
        }
    };

    /*<div className="mt-4 ml-4">
                                    <label className="block mb-2">Set your most used wall paint color and finish:</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Color"
                                            value={defaultPaintColor}
                                            onChange={(e) => setDefaultPaintColor(e.target.value)}
                                            className="input input-bordered w-full max-w-xs"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Finish"
                                            value={defaultPaintFinish}
                                            onChange={(e) => setDefaultPaintFinish(e.target.value)}
                                            className="input input-bordered w-full max-w-xs"
                                        />
                                    </div>
                                </div>
                                <div className="ml-4 mt-4 flex gap-4 items-center">
                                    <label>Do you want any of your ceilings painted?</label>
                                    <input type="checkbox" checked={ceilingPaint} onChange={(e) => setCeilingPaint(e.target.checked)} />
                                </div>
                                <div className="ml-4 mt-4 flex gap-4 items-center">
                                    <label>Do you want any doors and trim painted?</label>
                                    <input type="checkbox" checked={doorsAndTrimPaint} onChange={(e) => setDoorsAndTrimPaint(e.target.checked)} />
                                </div>
                                <button onClick={updateAdditionalInfo} className="ml-4 button mt-4 button-color hover:bg-green-900 text-white py-2 px-4 rounded transition duration-300">
                                    Set Defaults
                                </button>*/

    

                                return (
                                    <div className='dashboard flex flex-col items-center mt-10 w-full'>
                                        <GoogleAnalytics gaId="G-47EYLN83WE" />
                                        <Modal showModal={showModal} setShowModal={setShowModal} price={selectedQuote} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} painterId={painterId}/>
                                        {isPainter ? (
                                            <PainterDashboard />
                                        ) : (
                                            <div className="dashboard-content flex flex-col items-center w-full max-w-4xl">
                                                {userData && userData.video && (
                                                    <div className="video-container mb-2" style={{ maxWidth: '100%' }}>
                                                    <video
                                                      autoPlay
                                                      controls
                                                      playsInline
                                                      muted={true}
                                                      ref={videoRef}
                                                      src={userData.video}
                                                      className="video"
                                                      style={{ width: '100%', maxWidth: '100%' }} // Adjust video size dynamically
                                                      onLoadedMetadata={() => {
                                                        if (videoRef.current) {
                                                          videoRef.current.playbackRate = 2.0;
                                                        }
                                                      }}
                                                    />
                                                  </div>
                                                )}
                                                {/*currentTimestampPair && userImageRef && laborAndMaterial && (
                                                    <RoomCard
                                                        key={`${currentTimestampPair.startTime}-${currentTimestampPair.endTime}`}
                                                        startTime={currentTimestampPair.startTime}
                                                        endTime={currentTimestampPair.endTime}
                                                        defaultColor={currentTimestampPair.color || defaultPaintColor}
                                                        defaultFinish={currentTimestampPair.finish || defaultPaintFinish}
                                                        defaultCeilings={currentTimestampPair.ceilings}
                                                        defaultTrim={currentTimestampPair.trim}
                                                        userImageRef={userImageRef}
                                                        onDelete={handleTimestampPairDelete}
                                                        editable={false}
                                                        roomName={currentTimestampPair.roomName}
                                                        onClick={() => handleRoomCardClick(currentTimestampPair.startTime)}
                                                    />
                                                )*/}
                                                {acceptedQuote ? (
                                                    <div className="text-center my-10">
                                                        <h2 className="text-2xl font-medium">Congrats on accepting your quote with:</h2>
                                                        <PainterCard painterId={acceptedQuote.painterId}/>
                                                        <h2 className="">They will reach out within two business days to schedule your job. If you have any questions, please contact us at:</h2>
                                                        <a href="mailto:dwelldonehelp@gmail.com?subject=Contact%20DwellDone" className="text-center text-sm">dwelldonehelp@gmail.com</a>
                                                        <h2 className=""> or </h2>
                                                        <a href="tel:+16158096429" className="text-center text-sm mt-2">(615) 809-6429</a>
                                                    </div>
                                                ) : (
                                                    userData && userData.prices && renderQuotes(userData.prices)
                                                )}
                                
                                                {/* Button row */}
                                                <div className="button-group my-4 flex justify-center gap-4">
                                                    <button 
                                                        onClick={() => router.push('/quote')} 
                                                        className="button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                                                    >
                                                        Resubmit Video
                                                    </button>
                                                        <button 
                                                            onClick={() => router.push('/defaultPreferences')} 
                                                            className="button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                                                        >
                                                            Reset Preferences
                                                        </button>
                                                    {/*morePreferences && ( // Only render Reset Rooms if morePreferences is true
                                                        <button 
                                                            onClick={() => router.push('/roomPreferences')} 
                                                            className="button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                                                        >
                                                            Reset Rooms
                                                        </button>
                                                    )*/}
                                                </div>
                                            </div>
                                        )}
                                
                                        <style jsx>{`
                                            .dashboard-content {
                                                display: flex;
                                                flex-direction: column;
                                                align-items: center;
                                            }
                                
                                            .video-container {
                                                width: 100%;
                                                max-width: 450px; // Adjust as needed
                                            }
                                
                                            .video {
                                                width: 100%; // Ensure video width matches the container
                                                max-width: 768px; // Adjust as needed
                                            }
                                            .button-group {
                                                display: flex;
                                                gap: 1rem;
                                            }
                                            .quote-item {
                                                display: flex;
                                                flex-direction: column;
                                                gap: 0.5rem;
                                            }
                                        
                                            @media (min-width: 640px) {
                                                .quote-item {
                                                    flex-direction: row;
                                                }
                                            }
                                        
                                            .quote-details {
                                                display: flex;
                                                flex-direction: column;
                                                gap: 0.5rem;
                                            }
                                        
                                            @media (min-width: 640px) {
                                                .quote-details {
                                                    flex-direction: row;
                                                    align-items: center;
                                                }
                                            }
                                        `}</style>
                                    </div>
                                );
                                
    
    
    
};

export default Dashboard;