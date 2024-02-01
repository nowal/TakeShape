'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { userDataAtom, isPainterAtom, checkingAuthAtom, userTypeLoadingAtom } from '../../atom/atom'; // Import all required atoms
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import PainterDashboard from '../../components/painterDashboard';
import QuoteButton from '../../components/quoteButton';
import PainterCard from '../../components/painterCard';
import { UserData } from '@/types/types';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "@/components/stripe";

type ModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    price: number | null;
    phoneNumber: string;
    setPhoneNumber: (number: string) => void;
    painterId: string;
};

const Modal: React.FC<ModalProps> = ({ showModal, setShowModal, price, phoneNumber, setPhoneNumber, painterId }) => {
    if (!showModal) return null;

    const [modalStep, setModalStep] = useState(1);

    const depositAmount = price ? (price * 0.02).toFixed(2) : '0.00';

  const handlePhoneSubmit = async () => {
    // Save the phone number to Firestore or handle it as needed
    setModalStep(2); // Move to the payment step
  };

    const handlePayment = async () => {
        const stripePromise = await loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
          );

          return (
            <Elements stripe={stripePromise}>
              <Stripe/>
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
    const [isPainter, setIsPainter] = useAtom(isPainterAtom);
    const [checkingAuth, setCheckingAuth] = useAtom(checkingAuthAtom);
    const [userTypeLoading, setUserTypeLoading] = useAtom(userTypeLoadingAtom); // Atom to manage loading state of user type check and data fetching
    const [phoneNumber, setPhoneNumber] = useState('');
    const [painterId, setPainterId] = useState('');
    const firestore = getFirestore();
    const auth = getAuth();

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

    const [showModal, setShowModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<number>(0);

    // ... (rest of your useEffect)

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


        return (
            <div className="quotes mb-12">
        {prices.map((price, index) => (
            <div key={index} className="flex items-center justify-between mb-5 p-3 border border-gray-300 rounded shadow-md">
                <PainterCard painterId={price.painterId}/>
                <div className="flex-2 flex items-center justify-between pl-5 border-l-2 border-gray-300 gap-10">
                    <p className="text-lg font-bold">Quote: <span className="text-xl">${price.amount.toFixed(2)}</span></p>
                    <button 
                        onClick={() => handleAcceptQuote(price.painterId, price.amount)} 
                        className="button-color hover:bg-green-900 text-white py-2 px-4 rounded transition duration-300">
                        Accept Quote
                    </button>
                </div>
            </div>
        ))}
    </div>
        );
    };

    

    return (
        <div className='dashboard'>
            <Modal showModal={showModal} setShowModal={setShowModal} price={selectedQuote} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} painterId={painterId}/>
            {isPainter ? (
                <PainterDashboard />
            ) : (
                <>
                    {userData && userData.video ? (
                        <>
                            <video src={userData.video} controls className="video pb-8" />
                            {renderQuotes(userData.prices)}
                            <QuoteButton text="Resubmit quote" className='mb-14 text-xl shadow bg-green-800 hover:bg-green-900 text-white py-4 px-4 rounded'/>
                        </>
                    ) : (
                        <QuoteButton text="Submit quote" className="center-button" />
                    )}
                </>
            )}

            <style jsx>{`
                .dashboard {
                    margin-top: 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .video {
                    width: 60%;
                    max-width: 400px;
                    max-height: 300px;
                    margin-bottom: 20px;
                    object-fit: cover;
                }
                .quotes, .loading-quotes {
                    font-size: 1.5em;
                    text-align: center;
                }
                .quote-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    padding: 10px;
                    border-radius: 5px;
                    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                }
            
                .painter-card {
                    flex: 1;
                }
            
                .quote-details {
                    flex: 2;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-left: 20px; /* Add some space between the painter card and the details */
                    border-left: 2px solid #ccc; /* Thin line between painter card and details */
                }
            
                .quote-price {
                    font-size: 1.2em;
                    font-weight: bold;
                }
            
                .accept-quote-btn {
                    background-color: #4CAF50; /* A nicer shade of green */
                    color: white;
                    padding: 12px 24px; /* Larger buttons */
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.2s; /* Smooth transition for hover effect */
                    font-weight: bold;
                    font-size: 1.1em;
                }
            
                .accept-quote-btn:hover {
                    background-color: #45a049; /* Slightly darker green on hover */
                }
            `}</style>
        </div>
    );
};

export default Dashboard;

