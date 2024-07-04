'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { timestampPairsAtom, userDataAtom, isPainterAtom, documentIdAtom, checkingAuthAtom, userTypeLoadingAtom, videoURLAtom, uploadStatusAtom, uploadProgressAtom } from '../../atom/atom';
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
    address: string;
    setAddress: (address: string) => void;
    painterId: string;
};

type Price = {
    painterId: string;
    amount: number;
    timestamp: number;
    accepted?: boolean; // Optional because it will not exist on all objects initially
};

const Modal: React.FC<ModalProps> = ({ showModal, setShowModal, price, phoneNumber, setPhoneNumber, address, setAddress, painterId }) => {
    if (!showModal) return null;

    const [modalStep, setModalStep] = useState(1);
    const firestore = getFirestore();
    const auth = getAuth();

    const depositAmount = price ? parseFloat((price * 0.02).toFixed(2)) : 0;

    const handlePhoneSubmit = async () => {
        if (auth.currentUser) {
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);

            if (!querySnapshot.empty) {
                const userImageDoc = querySnapshot.docs[0];
                const documentId = userImageDoc.id;

                try {
                    if (documentId && phoneNumber && address) {
                        const userImageRef = doc(firestore, "userImages", documentId);
                        let prices = userImageDoc.data().prices;
                        let updatedPrices = prices.map((price: Price) => {
                            if (price.painterId === painterId) {
                                return { ...price, accepted: true };
                            }
                            return price;
                        });
                        await updateDoc(userImageRef, {
                            phoneNumber: phoneNumber,
                            address: address,
                            prices: updatedPrices,
                        });
                    }
                } catch (error) {
                    console.error("Error updating homeowner's document: ", error);
                }

                try {
                    const painterQuery = query(collection(firestore, "painters"), where("userId", "==", painterId));
                    const querySnapshot = await getDocs(painterQuery);

                    if (!querySnapshot.empty) {
                        const painterDocRef = querySnapshot.docs[0].ref;
                        await updateDoc(painterDocRef, {
                            acceptedQuotes: arrayUnion(documentId),
                        });

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
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            {modalStep === 1 && (
                <div className="modal-content bg-white p-8 rounded-lg shadow-lg relative w-96 max-w-95-percent">
                    <h2 className="text-center text-xl font-semibold mb-4">Congrats on accepting your quote!</h2>
                    <p className="mb-4">Please enter your phone number and address below so that we can connect you with:</p>
                    <PainterCard painterId={painterId} />
                    <input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        placeholder="Your phone number"
                        className="input-field border-2 border-gray-300 focus:border-green-500 w-full py-2 px-4 mb-6 mt-4" 
                    />
                    <input 
                        type="text" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder="Your address"
                        className="input-field border-2 border-gray-300 focus:border-green-500 w-full py-2 px-4 mb-6" 
                    />
                    <button onClick={() => setShowModal(false)} className="close-modal absolute top-3 right-3 text-2xl">X</button>
                    <button onClick={handlePhoneSubmit} className="block shadow button-color hover:bg-green-900 text-white rounded py-2 px-4 mx-auto">Submit</button>
                </div>
            )}

            {modalStep === 2 && (
                <div className="modal-content bg-white p-8 rounded-lg shadow-lg relative w-96 max-w-95-percent">
                    <PainterCard painterId={painterId} />
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
    const auth = getAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomCardsContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<number>(0);
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
        const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(userImagesQuery);

        if (!querySnapshot.empty) {
            const userImageDocRef = querySnapshot.docs[0].ref;
            setUserImageRef(userImageDocRef);

            const userImageDoc = querySnapshot.docs[0];
            const userId = userImageDoc.data().userId;

            const userDocRef = doc(firestore, "users", userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().reAgent) {
                const reAgentId = userDoc.data().reAgent;

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

                    // Fetch preferred painters based on phone numbers
                    if (agentData.preferredPainters && agentData.preferredPainters.length > 0) {
                        const paintersQuery = query(
                            collection(firestore, "painters"),
                            where("phoneNumber", "in", agentData.preferredPainters)
                        );
                        const paintersSnapshot = await getDocs(paintersQuery);
                        const painterUserIds = paintersSnapshot.docs.map(doc => {
                            console.log("Fetched painter:", doc.id, doc.data());
                            return doc.data().userId;
                        });
                        setPreferredPainterUserIds(painterUserIds);
                        console.log("Preferred Painter User IDs fetched:", painterUserIds);
                    }
                }
            }

            const userDataFromFirestore = userDoc.data() as UserData;
            const prices = userImageDoc.data().prices;
            const video = userImageDoc.data().video;
            console.log("Fetched prices:", prices);
            console.log("Fetched video:", video);
            setUserData({ ...userDataFromFirestore, prices, video });
            console.log("User data set:", { ...userDataFromFirestore, prices, video });
        } else {
            console.error('No user image document found for the current user.');
        }

        setCheckingAuth(false);
        setUserTypeLoading(false);
    };

    useEffect(() => {
        if (auth.currentUser) {
            fetchUserData();
        } else {
            setCheckingAuth(false);
            setUserTypeLoading(false);
        }
    }, [auth.currentUser]);

    const handleAcceptQuote = async (painterId: string, price: number) => {
        setPainterId(painterId);
        if (auth.currentUser) {
            const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(userImagesQuery);

            if (!querySnapshot.empty) {
                const userImageDoc = querySnapshot.docs[0];
                const userImageRef = userImageDoc.ref;

                await updateDoc(userImageRef, { phoneNumber: phoneNumber });

                setSelectedQuote(price);
                setShowModal(true);
            } else {
                console.error('No user image document found for the current user.');
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

        if (acceptedQuote) return null;

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
                            <PainterCard painterId={price.painterId}/>
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

    if (checkingAuth || userTypeLoading) {
        return <div className="loading text-center text-lg mt-20">Retrieving Information...</div>;
    }

    if (!auth.currentUser) {
        return <div className="loading">Please log in to view this page.</div>;
    }

    return (
        <div className='dashboard flex flex-col items-center mt-10 w-full'>
            <GoogleAnalytics gaId="G-47EYLN83WE" />
            <Modal showModal={showModal} setShowModal={setShowModal} price={selectedQuote} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} address={address} setAddress={setAddress} painterId={painterId}/>
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
                            onClick={() => router.push('/defaultPreferences')} 
                            className="button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
                        >
                            Reset Preferences
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
            `}</style>
        </div>
    );
}    

export default Dashboard;
