import { FC, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { PainterCardData } from '../../components/painter/card/data';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePayment from '@/components/stripePayment';

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

export const PaymentModal: FC<ModalProps> = ({
  showModal,
  setShowModal,
  price,
  phoneNumber,
  setPhoneNumber,
  address,
  setAddress,
  painterId,
}) => {
  const [modalStep, 
    // setModalStep
  ] = useState(1);
  if (!showModal) return null;
  const firestore = getFirestore();
  const auth = getAuth();

  const depositAmount = price
    ? parseFloat((price * 0.02).toFixed(2))
    : 0;

  const handlePhoneSubmit = async () => {
    if (auth.currentUser) {
      const userImagesQuery = query(
        collection(firestore, 'userImages'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(userImagesQuery);

      if (!querySnapshot.empty) {
        const userImageDoc = querySnapshot.docs[0];
        const documentId = userImageDoc.id;

        try {
          if (documentId && phoneNumber && address) {
            const userImageRef = doc(
              firestore,
              'userImages',
              documentId
            );
            const prices = userImageDoc.data().prices;
            const updatedPrices = prices.map(
              (price: Price) => {
                if (price.painterId === painterId) {
                  return { ...price, accepted: true };
                }
                return price;
              }
            );
            await updateDoc(userImageRef, {
              phoneNumber: phoneNumber,
              address: address,
              prices: updatedPrices,
            });
          }
        } catch (error) {
          console.error(
            "Error updating homeowner's document: ",
            error
          );
        }

        try {
          const painterQuery = query(
            collection(firestore, 'painters'),
            where('userId', '==', painterId)
          );
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
          console.error(
            "Error adding quote to painter's acceptedQuotes: ",
            error
          );
        }
      }
    }
  };

  const handlePayment = async () => {
    const stripePromise = await loadStripe(
      process.env
        .NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
    );
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
          <h2 className="text-center text-xl font-semibold mb-4">
            Congrats on accepting your quote!
          </h2>
          <p className="mb-4">
            Please enter your phone number and address below
            so that we can connect you with:
          </p>
          <PainterCardData painterId={painterId} />
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
          <button
            onClick={() => setShowModal(false)}
            className="close-modal absolute top-3 right-3 text-2xl"
          >
            X
          </button>
          <button
            onClick={handlePhoneSubmit}
            className="block shadow button-color hover:bg-green-900 text-white rounded py-2 px-4 mx-auto"
          >
            Submit
          </button>
        </div>
      )}

      {modalStep === 2 && (
        <div className="modal-content bg-white p-8 rounded-lg shadow-lg relative w-96 max-w-95-percent">
          <PainterCardData painterId={painterId} />
          <p className="mt-4 mb-6">
            We hold a 2% deposit for the painter that is
            fully applied to your quoted price. Securely pay
            this deposit with Stripe.
          </p>
          <button
            onClick={() => setShowModal(false)}
            className="close-modal absolute top-3 right-3 text-2xl"
          >
            X
          </button>
          <button
            onClick={() => handlePayment()}
            className="stripe-pay-button bg-blue-500 hover:bg-blue-700 text-white rounded py-2 px-4 mx-auto block"
          >
            Pay with Stripe
          </button>
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
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        h2,
        p {
          font-size: 1.25rem; /* Increased text size */
        }
        input[type='tel'],
        .submit-phone-btn {
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
