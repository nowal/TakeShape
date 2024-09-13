'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion 
} from 'firebase/firestore';
import PainterCard from '../../components/painterCard';
import { FallbacksLoading } from '@/components/fallbacks/loading';

const Congrats = () => {
  const [painterUserId, setPainterUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = getFirestore();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const userImageIdFromParams = searchParams.get('userImageId');
  const painterUserIdFromParams = searchParams.get('painterId'); 

  useEffect(() => {
    if (pathname !== '/congrats') return; 
  
    const updateAcceptedQuote = async () => {
        console.log("This even fired");
      setIsLoading(true);
  
      if (userImageIdFromParams && painterUserIdFromParams) {
        console.log("Is this true");
        try {
          const userImageRef = doc(firestore, "userImages", userImageIdFromParams);
          const userImageDoc = await getDoc(userImageRef);
  
          if (userImageDoc.exists()) {
            console.log("Get's into this if")
            const userImageData = userImageDoc.data();
            const updatedPrices = (userImageData.prices || []).map((price: any) => {
              if (price.painterId === painterUserIdFromParams) {
                console.log("Get's the updated accepted");
                return { ...price, accepted: true };
              }
              return price;
            });
  
            await updateDoc(userImageRef, {
              prices: updatedPrices,
              acceptedPainters: arrayUnion(painterUserIdFromParams) 
            });
  
            console.log('Quote accepted and userImage updated successfully!');
          } else {
            console.error('User image document not found');
            setError('An error occurred while updating the quote. Please try again.');
          }
        } catch (error) {
          console.error('Error updating user image:', error);
          setError('An error occurred while updating the quote. Please try again.');
        } finally {
          setIsLoading(false); 
        }
      }
      setIsLoading(false); 
    };
  
    if (painterUserIdFromParams) {
        console.log("Where painterId coming from");
      // Update painterUserId state first
      setPainterUserId(painterUserIdFromParams); 
  
      // Then check if userImageIdFromParams is available and call updateAcceptedQuote
      if (userImageIdFromParams) {
        updateAcceptedQuote(); 
      } else {
        console.error('No userImageId found in URL params');
        setError('An error occurred. Please try again.');
        setIsLoading(false); 
      }
    } else {
      console.error('No painterId (userId) found in URL params');
      setError('An error occurred. Please try again.');
      setIsLoading(false); 
    }
  }, [firestore, pathname, painterUserIdFromParams, userImageIdFromParams]); 

  return (
    <div className="text-center my-10">
      <h2 className="text-2xl font-medium">Congrats on accepting your quote with:</h2>
      {isLoading ? (
        <FallbacksLoading />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : painterUserId && <PainterCard painterId={painterUserId} />} 
      <h2>They will reach out within two business days to schedule your job. If you have any questions, please contact us at:</h2>
      <a href="mailto:takeshapehome@gmail.com?subject=Contact%20DwellDone" className="text-center text-sm">takeshapehome@gmail.com</a>
      <h2>or</h2>
      <a href="tel:+16158096429" className="text-center text-sm mt-2">(615) 809-6429</a>
    </div>
  );
}

const CongratsWithSuspense: React.FC = () => (
    <Suspense fallback={<FallbacksLoading />}>
        <Congrats />
    </Suspense>
);

export default CongratsWithSuspense;