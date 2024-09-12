'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { timestampPairsAtom } from '../../atom/atom';
import { userDataAtom, isPainterAtom, documentIdAtom, checkingAuthAtom, userTypeLoadingAtom, videoURLAtom, uploadStatusAtom, uploadProgressAtom } from '../../atom/atom'; // Import all required atoms
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, setDoc, getDoc, arrayUnion, DocumentReference, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import PainterDashboard from '../../components/painterDashboard';
import QuoteButtonDashboard from '../../components/buttons/quote/quoteButtonDashboard';
import PainterCard from '../../components/painterCard';
import RoomCard from '@/components/roomCard';
import { TimestampPair, UserData, PaintPreferences } from '@/types/types';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePayment from "@/components/stripePayment";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

type Price = {
    painterId: string;
    amount: number;
    timestamp: number;
    accepted?: boolean; // Optional because it will not exist on all objects initially
  };

const RoomPreferences = () => {
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
    const [roomNumber, setRoomNumber] = useState(1);
    const [showTooltip, setShowTooltip] = useState(false);
    const [currentTimestampPair, setCurrentTimestampPair] = useState<TimestampPair>({
        startTime: 0,
        endTime: 0,
        color: '',
        finish: '',
        ceilings: false,
        trim: false,
        roomName:'',
      });
    const [currentPreferences, setCurrentPreferences] = useState<PaintPreferences>({
        color: '', // Default values or fetched from your initial data
        finish: '',
        ceilings: false,
        trim: false,
        laborAndMaterial: false,
      });
    const [addingRoom, setAddingRoom] = useState(false);
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
        // Function to hide tooltip
        const hideTooltip = () => setShowTooltip(false);
    
        // Automatically show the tooltip when the component mounts
        setShowTooltip(true);
    
        // Add event listeners
        document.addEventListener('click', hideTooltip);
        window.addEventListener('scroll', hideTooltip, true); // Using capture phase for better detection
    
        // Cleanup function to remove event listeners
        return () => {
            document.removeEventListener('click', hideTooltip);
            window.removeEventListener('scroll', hideTooltip, true);
        };
    }, []);

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
                    const matchedPair = timestampPairs.find(pair => currentTime >= pair.startTime && (pair.endTime === undefined || currentTime <= pair.endTime));
                    
                    if (matchedPair) {
                        setCurrentTimestampPair(matchedPair);
                    } else {
                        setCurrentTimestampPair({
                            startTime: currentTime,
                            endTime: undefined,
                            color: defaultPaintColor,
                            finish: defaultPaintFinish,
                            ceilings: ceilingPaint,
                            trim: doorsAndTrimPaint,
                            roomName: 'bad',
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
            const matchedPair = timestampPairs.find(pair => currentTime >= pair.startTime && (!pair.endTime || currentTime <= pair.endTime));
    
            if (matchedPair) {
                setCurrentTimestampPair(matchedPair);
            } else {
                setCurrentTimestampPair({
                    startTime: currentTime,
                    endTime: undefined,
                    color: defaultPaintColor,
                    finish: defaultPaintFinish,
                    ceilings: ceilingPaint,
                    trim: doorsAndTrimPaint,
                    roomName: 'Bad',
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
        // Check for and potentially add an initial timestampPair when the component mounts
        // and only if the video has been fully uploaded
        if (timestampPairs.length === 0 && auth.currentUser && userImageRef && uploadStatus === 'completed') {
            const initialPair = {
                startTime: 0,
                color: defaultPaintColor,
                finish: defaultPaintFinish,
                ceilings: ceilingPaint,
                trim: doorsAndTrimPaint,
            };
            // This adds the initial timestamp pair to Firestore and local state
            saveTimestampToFirestore(0); // Passing 0 to start at the beginning of the video
        }
    }, [auth.currentUser, timestampPairs, userImageRef, uploadStatus]);

    const changePreferences = async () => {
        if (!videoRef.current || !userImageRef) return;
    
        videoRef.current.pause();
        const currentTime = videoRef.current.currentTime;
    
        const updatedPairs = timestampPairs ? [...timestampPairs] : [];
    
        const newRoomNumber = updatedPairs.length + 1; // Dynamically calculate the new room number
    
        // Define the room name based on the new room number
        const newRoomName = `Room ${newRoomNumber}`;
    
        const newTimestampPair = {
            startTime: currentTime,
            color: defaultPaintColor,
            finish: defaultPaintFinish,
            ceilings: ceilingPaint,
            trim: doorsAndTrimPaint,
            dontPaintAtAll: false,
            roomName: newRoomName, // Use the dynamically generated room name
        };
    
        // Add the new timestamp pair
        updatedPairs.push(newTimestampPair);
    
        await updateDoc(userImageRef, {
            timestampPairs: updatedPairs
        });
    
        setTimestampPairs(updatedPairs); // Update local state with the new list of timestamp pairs
    };
    

    
    
      
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

const saveTimestampToFirestore = async (startTime: number, color: string = defaultPaintColor, finish: string = defaultPaintFinish, dontPaintCeilings: boolean = ceilingPaint, dontPaintTrimAndDoors: boolean = doorsAndTrimPaint) => {
    if (!auth.currentUser || !userImageRef) {
      console.error('No authenticated user or user image document reference.');
      return;
    }

    // Generate the room name based on the current roomNumber state
    const roomName = `Room ${roomNumber}`;

    const newTimestampPair: TimestampPair = { 
        startTime,
        color, 
        finish,
        ceilings: dontPaintCeilings, 
        trim: dontPaintTrimAndDoors,
        roomName // Including the dynamically generated roomName
    };

    try {
        await updateDoc(userImageRef, {
            timestampPairs: arrayUnion(newTimestampPair)
        });

        // Update the local state to reflect the new timestamp pair addition
        setTimestampPairs(prevPairs => [...prevPairs, newTimestampPair]);

        // Increment the room number for subsequent rooms
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
        // Find the index of the timestamp pair that is being ended
        const endingPairIndex = timestampPairs.findIndex(pair => pair.startTime === videoSelectionStart);
    
        // Check if the intended endTime falls within any existing timestamp pair (excluding the one being ended)
        const isWithinExistingPair = timestampPairs.some((pair, index) => {
            if (index !== endingPairIndex) { // Exclude the pair being ended from the check
                const startTime = pair.startTime;
                const endTime = pair.endTime || Infinity; // Treat pairs without an endTime as extending to Infinity
                return currentTime > startTime && currentTime < endTime;
            }
            return false;
        });
    
        if (isWithinExistingPair) {
            alert("You cannot end a room within the time range of an existing room. Please choose an earlier time.");
            return; // Prevent further execution
        }
    
        if (endingPairIndex !== -1) {
            // Clone the current timestampPairs to avoid direct state mutation.
            const updatedTimestampPairs = [...timestampPairs];
            updatedTimestampPairs[endingPairIndex] = {
                ...updatedTimestampPairs[endingPairIndex],
                endTime: currentTime, // Update only the endTime.
            };
    
            try {
                await updateDoc(userImageRef, {
                    timestampPairs: updatedTimestampPairs,
                });
                // Fetch the latest data again to synchronize
                const updatedDoc = await getDoc(userImageRef);
                if (updatedDoc.exists()) {
                    setTimestampPairs(updatedDoc.data().timestampPairs);
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
            <div className="quotes mb-12">
        {prices.map((price, index) => (
            <div key={index} className="flex items-center justify-between mb-5 p-3 border border-gray-300 rounded shadow-md">
                <PainterCard painterId={price.painterId}/>
                <div className="flex-2 flex items-center justify-between pl-5 border-l-2 border-gray-300 gap-10">
                    <p className="text-lg font-bold">Quote: <span className="text-xl">${price.amount.toFixed(2)}</span>
                    <div className="ml-10">
                    {prices.find(price => price.painterId)?.invoiceUrl && (
                                <a href={prices.find(price => price.painterId)?.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Invoice
                                </a>
                            )}
                    </div>
                    </p>
                    <button 
                        onClick={() => handleAcceptQuote(price.painterId, price.amount)} 
                        className="button-green transition duration-300">
                        Accept Quote
                    </button>
                </div>
            </div>
        ))}
    </div>
        );
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

    const handleRoomCardClick = (startTime: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = startTime;
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
                                <button onClick={updateAdditionalInfo} className="ml-4 button mt-4 button-green transition duration-300">
                                    Set Defaults
                                </button>*/

    

                                return (
                                    <div className='dashboard flex flex-col items-center mt-10 w-full'>
                                        <GoogleAnalytics gaId="G-47EYLN83WE" />
                                        {isPainter ? (
                                            <PainterDashboard />
                                        ) : (
                                            <div className="dashboard-content flex flex-col items-center w-full max-w-4xl mb-16">
                                                {userData && userData.video && (
                                                    <div className="video-container mb-2" style={{ maxWidth: '100%' }}>
                                                        <video
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
                                                <div className="new-room-container text-center mt-4 mb-4">
                                                    <button onClick={changePreferences} className="button-green transition duration-300">
                                                        New Room
                                                    </button>
                                                    <div className="tooltip-container ml-2 inline-block relative">
    <span className="tooltip-icon">?</span>
    <span className={`tooltip-text ${showTooltip ? 'visible' : ''}`}>
        Click the Change Preferences button whenever the video enters a room or space that you want different preferences for.
    </span>
</div>
                                                </div>
                                                {/*{currentTimestampPair && userImageRef && (
                                                    <RoomCard
                                                        key={`${currentTimestampPair.startTime}-${currentTimestampPair.endTime}`}
                                                        startTime={currentTimestampPair.startTime}
                                                        endTime={currentTimestampPair.endTime}
                                                        defaultColor={currentTimestampPair.color || defaultPaintColor}
                                                        defaultFinish={currentTimestampPair.finish || defaultPaintFinish}
                                                        defaultCeilings={currentTimestampPair.ceilings !== undefined ? currentTimestampPair.ceilings : ceilingPaint}
                                                        defaultTrim={currentTimestampPair.trim !== undefined ? currentTimestampPair.trim : doorsAndTrimPaint}
                                                        userImageRef={userImageRef}
                                                        onDelete={handleTimestampPairDelete}
                                                        editable={true}
                                                    />
                                                )}*/}
                                                <div className="overflow-auto" style={{ maxHeight: '350px' }} ref={roomCardsContainerRef}>
                                                    {userImageRef && [...timestampPairs]
                                                        .sort((a, b) => b.startTime - a.startTime) // Sort timestampPairs by startTime in descending order
                                                        .map((pair, index) => (
                                                            <RoomCard
                                                                key={index} // Consider using a more unique key if possible
                                                                startTime={pair.startTime}
                                                                userImageRef={userImageRef}
                                                                onDelete={() => handleTimestampPairDelete(pair.startTime)}
                                                                defaultColor={pair.color || defaultPaintColor}
                                                                defaultFinish={pair.finish || defaultPaintFinish}
                                                                defaultCeilings={pair.ceilings !== undefined ? pair.ceilings : ceilingPaint}
                                                                defaultTrim={pair.trim !== undefined ? pair.trim : doorsAndTrimPaint}
                                                                roomName={pair.roomName}
                                                                editable={true}
                                                                onClick={() => handleRoomCardClick(pair.startTime)}
                                                            />
                                                        ))}
                                                </div>
                                                <div className="button-group mt-4 flex justify-center gap-4"> {/* Flex container for buttons */}
                                                    <button 
                                                        onClick={() => router.push('/defaultPreferences')} 
                                                        className="reset-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                                                    >
                                                        Reset Defaults
                                                    </button>
                                                    <button 
                                                        onClick={() => router.push('/dashboard')} 
                                                        className="submit-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                                                    >
                                                        Set Rooms
                                                    </button>
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
                                    }

                                    .video {
                                        width: 100%;
                                        max-width: 100%;
                                    }

                                    .new-room-btn {
                                        margin-top: 1rem;
                                    }

                                    .button-group {
                                        display: flex;
                                        gap: 1rem;
                                    }

                                    .tooltip-container .tooltip-icon {
                                        cursor: pointer;
                                        display: inline-block;
                                        font-weight: bold;
                                    }
                                    
                                    .tooltip-text {
                                        min-width: 200px;
                                        background-color: black;
                                        color: white;
                                        text-align: center;
                                        border-radius: 6px;
                                        padding: 5px 0;
                                        position: absolute;
                                        z-index: 1;
                                        bottom: 100%;
                                        left: 50%;
                                        transform: translateX(-50%);
                                        opacity: 0;
                                        transition: opacity 0.5s ease-in-out;
                                        pointer-events: none;
                                    }

                                    .tooltip-container:hover .tooltip-text, .tooltip-text.visible {
                                        opacity: 1;
                                        pointer-events: auto;
                                    }
                                `}</style>
                                    </div>
                                );
                                 
    
    
};

export default RoomPreferences;













/*'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { timestampPairsAtom, userDataAtom } from '../../atom/atom';
import RoomCard from '@/components/roomCard';
import { getFirestore, setDoc, getDoc, arrayUnion, arrayRemove, DocumentReference, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { TimestampPair } from '@/types/types';

const RoomPreferences = () => {
    const firestore = getFirestore();
    const auth = getAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [userData, setUserData] = useAtom(userDataAtom);
    const [timestampPairs, setTimestampPairs] = useAtom(timestampPairsAtom);
    const [userImageRef, setUserImageRef] = useState<DocumentReference | null>(null);
    const [currentTimestampPair, setCurrentTimestampPair] = useState<TimestampPair | null>(null);
    const [defaultColor, setDefaultColor] = useState('DefaultColor');
    const [defaultFinish, setDefaultFinish] = useState('DefaultFinish');
    const [defaultCeilings, setDefaultCeilings] = useState(false);
    const [defaultTrim, setDefaultTrim] = useState(false);

    useEffect(() => {
        if (userData && userData.paintPreferencesId) {
            const prefDocRef = doc(firestore, "paintPreferences", userData.paintPreferencesId);
            getDoc(prefDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    const prefs = docSnap.data();
                    setDefaultColor(prefs.color);
                    setDefaultFinish(prefs.finish);
                    setDefaultCeilings(prefs.ceilings);
                    setDefaultTrim(prefs.trim);
    
                    // Once defaults are fetched, set currentTimestampPair with these values
                    setCurrentTimestampPair({
                        startTime: 0, // Assuming start time of 0 for new selection
                        endTime: undefined, // No end time for new selection
                        color: prefs.color,
                        finish: prefs.finish,
                        ceilings: prefs.ceilings,
                        trim: prefs.trim,
                    });
                }
            }).catch(error => console.error("Error fetching paint preferences:", error));
        }
    }, [userData, firestore]);

    useEffect(() => {
        if (auth.currentUser) {
            const dataQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            getDocs(dataQuery).then(querySnapshot => {
                if (!querySnapshot.empty) {
                    const userDataDoc = querySnapshot.docs[0].data();
                    setUserData(userDataDoc);
                } else {
                    console.log("No user data found");
                    setUserData(null);
                }
            }).catch(error => {
                console.error("Error fetching user data:", error);
                setUserData(null);
            });
        }
    }, [auth.currentUser, firestore]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed. Current User: ", user);
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                const uid = user.uid;
                // Now fetch user data and set up userImageRef
                const docRef = doc(firestore, "userImages", uid);
                setUserImageRef(docRef);
                // Fetch user data as before
                const dataQuery = query(collection(firestore, "userImages"), where("userId", "==", uid));
                getDocs(dataQuery).then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        const userDataDoc = querySnapshot.docs[0].data();
                        setUserData(userDataDoc);
                    } else {
                        console.log("No user data found");
                        setUserData(null);
                    }
                }).catch(error => {
                    console.error("Error fetching user data:", error);
                    setUserData(null);
                });
            } else {
                // User is signed out
                setUserData(null);
            }
        });
    
        // Unsubscribe from the listener when the component unmounts
        return unsubscribe;
    }, [auth, firestore]);

    useEffect(() => {
        console.log("Current User: ", auth.currentUser);
        if (auth.currentUser) {
            const docRef = doc(firestore, "userImages", auth.currentUser.uid);
            console.log("DocRef: ", docRef);
            setUserImageRef(docRef);
        }
    }, [auth.currentUser, firestore]);

    useEffect(() => {
        console.log("UserData: ", userData);
        console.log("Video URL: ", userData?.video);
    }, [userData]);

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;

        //const currentTime = video.currentTime;
        console.log('Time update or seeked event fired');
        //const matchedPair = timestampPairs.find(pair => currentTime >= pair.startTime && (!pair.endTime || currentTime <= pair.endTime));
        const currentTime = videoRef.current?.currentTime || 0;
        const matchedPair = timestampPairs.find(pair => currentTime >= pair.startTime && (!pair.endTime || currentTime <= pair.endTime));

        if (matchedPair) {
            setCurrentTimestampPair(matchedPair);
            console.log(matchedPair);
        } else {
            setCurrentTimestampPair({
                startTime: currentTime,
                endTime: undefined,
                color: defaultColor,
                finish: defaultFinish,
                ceilings: defaultCeilings,
                trim: defaultTrim,
            });
        }
    };

    const handleNewRoomSelection = async () => {
        if (!auth.currentUser || !videoRef.current || !userImageRef) return;
    
        // Example values for missing properties - adjust these as necessary based on your application's logic
        const defaultColor = 'DefaultColor';
        const defaultFinish = 'DefaultFinish';
        const defaultCeilings = false;
        const defaultTrim = false;
    
        const currentTime = videoRef.current.currentTime;
        const newPair = {
            startTime: currentTime, // Assuming this is the start time for the new room
            endTime: currentTime + 10, // Just an example, adjust this based on how you determine end time
            color: defaultColor,
            finish: defaultFinish,
            ceilings: defaultCeilings,
            trim: defaultTrim,
        };
    
        setTimestampPairs(prev => [...prev, newPair]);

        // Update Firestore
        try {
            await updateDoc(userImageRef, {
                timestampPairs: arrayUnion(newPair)
            });
            console.log("New room timestamp added successfully");
        } catch (error) {
            console.error("Error adding new room timestamp:", error);
        }
    };

    const handleTimestampPairDelete = async (startTime: number) => {
        // Update local state
        const updatedPairs = timestampPairs.filter(pair => pair.startTime !== startTime);
        setTimestampPairs(updatedPairs);

        // Update Firestore
        if (userImageRef) {
            try {
                await updateDoc(userImageRef, {
                    timestampPairs: arrayRemove({ startTime })
                });
                console.log('Firestore updated successfully');
            } catch (error) {
                console.error('Error updating Firestore: ', error);
            }
        }
    };

    return (
        <div className='dashboard flex flex-col items-center mt-10 w-full'>
                <div className="dashboard-content w-full max-w-4xl">
                    {userData && userData.video && (
                        <div className="video-container">
                            <video
                            ref={videoRef}
                            controls
                            playsInline
                            muted
                            src={userData?.video}
                            className="video"
                            onLoadedMetadata={() => {
                                if (videoRef.current) {
                                    videoRef.current.playbackRate = 2.0;
                                }
                            }}
                            onTimeUpdate={handleTimeUpdate} // Directly use React event handler
                            onSeeked={handleTimeUpdate}    // Directly use React event handler
                        />
                            {currentTimestampPair && userImageRef && (
                                <RoomCard
                                key={`${currentTimestampPair.startTime}-${currentTimestampPair.endTime}`}
                                startTime={currentTimestampPair.startTime}
                                endTime={currentTimestampPair.endTime}
                                defaultColor={currentTimestampPair.color || defaultColor}
                                defaultFinish={currentTimestampPair.finish || defaultFinish}
                                defaultCeilings={currentTimestampPair.ceilings !== undefined ? currentTimestampPair.ceilings : defaultCeilings}
                                defaultTrim={currentTimestampPair.trim !== undefined ? currentTimestampPair.trim : defaultTrim}
                                userImageRef={userImageRef}
                                onDelete={handleTimestampPairDelete}
                              />
                            )}
                        </div>
                    )}
                    <div className="new-room-container text-center">
                    <p>{"Add any room or area that does not match your defaults"}</p>
                        <button onClick={handleNewRoomSelection} className="new-room-btn button-green transition duration-300">
                            {"New Room"}
                        </button>
                    </div>
                </div>
    
            <style jsx>{`
                .dashboard-content {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
    
                @media (min-width: 768px) {
                    .dashboard-content {
                        grid-template-columns: repeat(2, 1fr);
                        grid-template-rows: auto auto;
                        gap: 20px;
                    }
    
                    .video-container {
                        grid-column: 1 / 2;
                        grid-row: 1 / 2;
                    }
    
                    .defaults-form-container {
                        grid-column: 1 / 2;
                        grid-row: 2 / 3;
                    }
    
                    .new-room-container {
                        grid-column: 2 / 3;
                        grid-row: 1 / 2;
                    }
    
                    .room-cards-container {
                        grid-column: 2 / 3;
                        grid-row: 2 / 3;
                        max-height: none;
                    }
                }
    
                .video {
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default RoomPreferences;
*/