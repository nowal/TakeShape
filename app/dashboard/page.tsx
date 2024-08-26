'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useAtom } from 'jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { timestampPairsAtom, userDataAtom, isPainterAtom, documentIdAtom, checkingAuthAtom, userTypeLoadingAtom, videoURLAtom, uploadStatusAtom, uploadProgressAtom } from '../../atom/atom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, getDoc, query, where, getDocs, collection, doc, updateDoc, DocumentReference } from 'firebase/firestore';
import PainterDashboard from '../../components/painterDashboard';
import PainterCard from '../../components/painterCard';
import CheckoutButton from '../../components/checkoutButton';
import { TimestampPair, UserData, PaintPreferences, UserImage } from '@/types/types';
import { GoogleAnalytics } from '@next/third-parties/google';

type Price = {
    painterId: string;
    amount: number;
    timestamp: number;
    invoiceUrl?: string;
    accepted?: boolean; // Optional because it will not exist on all objects initially
};

const Dashboard = () => {
    const [userData, setUserData] = useAtom(userDataAtom);
    const [showModal, setShowModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<number>(0);
    const [timestampPairs, setTimestampPairs] = useAtom(timestampPairsAtom);
    const [isPainter, setIsPainter] = useAtom(isPainterAtom);
    const [checkingAuth, setCheckingAuth] = useAtom(checkingAuthAtom);
    const [userTypeLoading, setUserTypeLoading] = useAtom(userTypeLoadingAtom);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
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
        color: '',
        finish: '',
        ceilings: false,
        trim: false,
        laborAndMaterial: false,
    });
    const [addingRoom, setAddingRoom] = useState(false);
    const [laborAndMaterial, setLaborAndMaterial] = useState(true);
    const [morePreferences, setMorePreferences] = useState(true);
    const [videoSelectionStart, setVideoSelectionStart] = useState<number | null>(null);
    const firestore = getFirestore();
    const [userImageRef, setUserImageRef] = useState<DocumentReference | null>(null);
    const [selectedUserImage, setSelectedUserImage] = useState<string>(''); // Initialize as empty string
    const [userImageList, setUserImageList] = useState<{ id: string, title: string }[]>([]);
    const auth = getAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomCardsContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [agentInfo, setAgentInfo] = useState<{ name: string; profilePictureUrl: string; preferredPainters: string[] } | null>(null);
    const [preferredPainterUserIds, setPreferredPainterUserIds] = useState<string[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserData();
            } else {
                setUserData(null);
                setIsPainter(false);
                setCheckingAuth(false);
                setUserTypeLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const fetchUserData = async () => {
        if (!auth.currentUser) {
            setCheckingAuth(false);
            return;
        }
        console.log("Fetching user data...");
        const userDocRef = doc(firestore, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
    
        if (userDoc.exists()) {
            const userDocData = userDoc.data() as UserData;
            console.log("User data:", userDocData); // Add this log
    
            // Since the user exists in the users collection, we set isPainter to false
            setIsPainter(false);
    
            const userImageIds = userDocData.userImages || [];
            const userImagesData = await Promise.all(userImageIds.map(async (id) => {
                const userImageDocRef = doc(firestore, "userImages", id);
                const userImageDoc = await getDoc(userImageDocRef);
                const title = userImageDoc.data()?.title || 'Untitled';
                console.log(`Fetched title for userImage ${id}: ${title}`);
                return { id, title };
            }));
            setUserImageList(userImagesData);
    
            const userImageIdFromParams = searchParams.get('userImageId');
            const initialUserImageId = userImageIdFromParams || (userImageIds.length > 0 ? userImageIds[0] : '');
    
            if (initialUserImageId) {
                fetchUserImageData(initialUserImageId);
                setSelectedUserImage(initialUserImageId);
            }
    
            if (userDocData.reAgent) {
                const reAgentId = userDocData.reAgent;
                const agentDocRef = doc(firestore, "reAgents", reAgentId);
                const agentDoc = await getDoc(agentDocRef);
    
                if (agentDoc.exists()) {
                    const agentData = agentDoc.data();
                    setAgentInfo({
                        name: agentData.name,
                        profilePictureUrl: agentData.profilePictureUrl,
                        preferredPainters: agentData.preferredPainters || [],
                    });
                    console.log("Agent info fetched successfully:", agentData);
    
                    if (agentData.preferredPainters && agentData.preferredPainters.length > 0) {
                        const paintersQuery = query(
                            collection(firestore, "painters"),
                            where("phoneNumber", "in", agentData.preferredPainters)
                        );
                        const paintersSnapshot = await getDocs(paintersQuery);
                        const painterUserIds = paintersSnapshot.docs.map(doc => doc.data().userId);
                        setPreferredPainterUserIds(painterUserIds);
                        console.log("Preferred Painter User IDs fetched:", painterUserIds);
                    }
                }
            }
        } else {
            // Check if the user exists in the painters collection
            console.log(auth.currentUser.uid);
            const paintersQuery = query(
                collection(firestore, "painters"),
                where("userId", "==", auth.currentUser.uid)
            );
            const paintersSnapshot = await getDocs(paintersQuery);
    
            if (!paintersSnapshot.empty) {
                // User exists in the painters collection
                setIsPainter(true);
                console.log("User is a painter"); // Add this log
            } else {
                console.error('No user document found for the current user.');
            }
        }
    
        setCheckingAuth(false);
        setUserTypeLoading(false);
    };
    
    
    
    const fetchUserImageData = async (userImageId: string) => {
        const userImageDocRef = doc(firestore, "userImages", userImageId);
        const userImageDoc = await getDoc(userImageDocRef);
    
        if (userImageDoc.exists()) {
            const userImageData = userImageDoc.data() as UserImage;
            const prices = userImageData.prices;
            const video = userImageData.video;
            const title = userImageData.title || 'Untitled'; // Ensure title is fetched
            console.log("Fetched prices:", prices);
            console.log("Fetched video:", video);
            console.log("Fetched title:", title);
            setUserData({ ...userImageData, prices, video, title }); // Include title in user data
            console.log("User data set:", { ...userImageData, prices, video, title });
        } else {
            console.error('No user image document found for the current user image ID.');
        }
    };
    

    useEffect(() => {
        if (auth.currentUser) {
            fetchUserData();
        } else {
            setCheckingAuth(false);
            setUserTypeLoading(false);
        }
    }, [auth.currentUser]);

    useEffect(() => {
        if (uploadStatus === 'completed') {
            window.location.reload();
        }
    }, [uploadStatus]);

    const handleQuoteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userImageId = e.target.value;
        setSelectedUserImage(userImageId);
        await fetchUserImageData(userImageId);
    };

    const handleAcceptQuote = async (painterId: string, price: number) => {
        setPainterId(painterId);
        if (auth.currentUser) {
          if (selectedUserImage) {
            const userImageDocRef = doc(firestore, "userImages", selectedUserImage);
            await updateDoc(userImageDocRef, { phoneNumber: phoneNumber });
            console.log('Selected User Image:', selectedUserImage); // Add this line
            console.log('Painter ID:', painterId); // Add this line
            setSelectedQuote(price);
            setShowModal(true);
          } else {
            console.error('No selected user image.');
          }
        } else {
          console.error('No authenticated user.');
        }
      };

    const renderQuotes = (prices: UserData['prices']) => {
        console.log("Rendering quotes with prices:", prices);
        console.log("Agent info:", agentInfo);
    
        if (!prices || prices.length === 0) {
            return (
                <div className="text-2xl mb-14 mt-8 font-bold">
                    <p>Gathering Quotes...</p>
                </div>
            );
        }

        const acceptedQuote = prices.find(price => price.accepted);
        if (acceptedQuote) {
            // Redirect to /congrats if a quote is accepted
            router.push(`/congrats?userImageId=${selectedUserImage}&painterId=${acceptedQuote.painterId}`);
            return null; 
        }
    
        return (
            <div className="quotes mb-12" style={{ width: '95%', maxWidth: '95%', margin: '0 auto' }}>
                {prices.map((price, index) => {
                    const isPreferredPainter = preferredPainterUserIds.includes(price.painterId);
                    console.log(`Price ${index}: Painter ID ${price.painterId}, isPreferredPainter: ${isPreferredPainter}`);
                    if (isPreferredPainter) {
                        console.log("Rendering agent info for painter:", price.painterId);
                    }
                    return (
                        <div key={index} className="quote-item flex flex-col sm:flex-row items-center justify-between mb-5 p-3 border border-gray-300 rounded shadow-md">
                            <PainterCard painterId={price.painterId} />
                            <div className="quote-details flex-1 flex flex-col sm:flex-row items-center justify-between pl-5 border-l-2 border-gray-300 gap-4">
                                <div className="quote-info">
                                    <p className="text-lg font-bold">Quote: <span className="text-xl">${price.amount.toFixed(2)}</span></p>
                                    {price.invoiceUrl && (
                                        <a href={price.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                            Invoice
                                        </a>
                                    )}
                                    {agentInfo && isPreferredPainter && (
                                        <div className="recommended flex items-center mt-2">
                                            <img src={agentInfo.profilePictureUrl} alt="Agent" className="w-8 h-8 rounded-full mr-2" />
                                            <p className="text-sm text-green-600">Recommended by {agentInfo.name}</p>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleAcceptQuote(price.painterId, price.amount)} 
                                    className="button-color hover:bg-green-900 text-white py-2 px-4 rounded transition duration-300 mt-2 sm:mt-0">
                                    Accept Quote
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };
    
    
    return (
        <div className='dashboard flex flex-col items-center mt-10 w-full'>
            <GoogleAnalytics gaId="G-47EYLN83WE" />
            {isPainter ? (
                <PainterDashboard />
            ) : (
                <div className="dashboard-content flex flex-col items-center w-full max-w-4xl">
                    <div className="flex items-center mb-4">
                        <select 
                            className="text-3xl font-medium p-2 underline"
                            value={selectedUserImage} 
                            onChange={handleQuoteChange}
                            style={{ fontSize: '2rem', fontWeight: 'bold' }}
                        >
                            {userImageList.map((image, index) => (
                                <option key={index} value={image.id}>
                                    {image.title}
                                </option>
                            ))}
                        </select>
                        <button 
                            onClick={() => router.push('/quote')} 
                            className="ml-2 text-3xl font-bold text-green-700 hover:text-green-900"
                            title="Add New Quote"
                        >
                            +
                        </button>
                    </div>
                    {uploadStatus === 'uploading' && (
                        <div className="upload-progress mb-4 text-center">
                            <p className="text-xl font-bold p-2">Uploading: {uploadProgress.toFixed(2)}%</p>
                        </div>
                    )}
                    {userData && userData.video && (
                        <div className="video-container mb-2" style={{ maxWidth: '100%' }}>
                            <video
                                controls
                                playsInline
                                muted={true}
                                ref={videoRef}
                                src={`${userData.video}#t=0.001`}
                                className="video"
                                style={{ width: '100%', maxWidth: '100%' }}
                                onLoadedMetadata={() => {
                                    if (videoRef.current) {
                                        videoRef.current.playbackRate = 1.0;
                                    }
                                }}
                            />
                        </div>
                    )}
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
    
                    <div className="button-group my-4 flex justify-center gap-4">
                        <button 
                            onClick={() => router.push('/quote')} 
                            className="button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                        >
                            Resubmit Video
                        </button>
                        <button 
                            onClick={() => router.push(`/defaultPreferences?userImageId=${selectedUserImage}`)} 
                            className="button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                        >
                            Reset Preferences
                        </button>
                    </div>
                </div>
            )}

{showModal && (
    <div className="modal-overlay">
        <div className="modal-content">
            <button 
                onClick={() => setShowModal(false)} 
                className="close-button"
                aria-label="Close"
            >
                &times;
            </button>
            <h2>Congrats on accepting your quote!</h2>
            <p>
                We hold a 10% deposit in order to protect our painter's time. This will be applied towards your quoted price after the work is completed!
            </p>
            <CheckoutButton
                amount={selectedQuote * 0.1} 
                painterId={painterId} // Make sure this is the correct painterId
                userImageId={selectedUserImage} // Make sure this is the correct userImageId
                userId={selectedUserImage} 
            />

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
        max-width: 450px;
    }

    .video {
        width: 100%;
        max-width: 768px;
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

    .recommended {
        display: flex;
        align-items: center;
    }

    .recommended img {
        margin-right: 8px;
    }

    .upload-progress {
        padding: 20px;
        background-color: #f0f4f8;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        position: relative;
        width: 90%;
        max-width: 500px;
        text-align: center;
    }

    .modal-content h2 {
        margin-bottom: 20px;
    }

    .modal-content p {
        margin-bottom: 20px;
    }

    .modal-content button {
        margin-top: 20px;
        background-color: #ccc;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
    }

    .close-button {
        position: absolute;
        top: -10px; /* Adjusted to move it higher */
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
    }
`}</style>
        </div>
    );
};

const DashboardWithSuspense: React.FC = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
    </Suspense>
);

export default DashboardWithSuspense;