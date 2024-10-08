import { useEffect, useState, Suspense } from 'react';
import {
  useSearchParams,
  usePathname,
} from 'next/navigation';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { errorUpdating } from '@/utils/error';
import { notifyError } from '@/utils/notifications';

type TConfig = any;
export const useCongrats = (config?: TConfig) => {
  const [painterUserId, setPainterUserId] = useState<
    string | null
  >(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = getFirestore();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const userImageIdFromParams =
    searchParams.get('userImageId');
  const painterUserIdFromParams =
    searchParams.get('painterId');

  useEffect(() => {
    if (pathname !== '/congrats') return;

    const updateAcceptedQuote = async () => {
      console.log('This even fired');
      setLoading(true);

      if (
        userImageIdFromParams &&
        painterUserIdFromParams
      ) {
        console.log('Is this true');
        try {
          const userImageRef = doc(
            firestore,
            'userImages',
            userImageIdFromParams
          );
          const userImageDoc = await getDoc(userImageRef);

          if (userImageDoc.exists()) {
            console.log("Get's into this if");
            const userImageData = userImageDoc.data();
            const updatedPrices = (
              userImageData.prices || []
            ).map((price: any) => {
              if (
                price.painterId === painterUserIdFromParams
              ) {
                console.log("Get's the updated accepted");
                return { ...price, accepted: true };
              }
              return price;
            });

            await updateDoc(userImageRef, {
              prices: updatedPrices,
              acceptedPainters: arrayUnion(
                painterUserIdFromParams
              ),
            });

            console.log(
              'Quote accepted and userImage updated successfully!'
            );
          } else {
            console.error('User image document not found');
            setError(
              'An error occurred while updating the quote. Please try again.'
            );
          }
        } catch (error) {
          const errorMessage =
            'An error occurred while updating the quote. Please try again.';

          const errorMessage1 = errorUpdating('user image');

          console.error(errorMessage1, error);
          setError(errorMessage);
          notifyError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
      setLoading(false);
    };

    if (painterUserIdFromParams) {
      console.log('Where painterId coming from');
      // Update painterUserId state first
      setPainterUserId(painterUserIdFromParams);

      // Then check if userImageIdFromParams is available and call updateAcceptedQuote
      if (userImageIdFromParams) {
        updateAcceptedQuote();
      } else {
        console.error('No userImageId found in URL params');
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    } else {
      console.error(
        'No painterId (userId) found in URL params'
      );
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }, [
    firestore,
    pathname,
    painterUserIdFromParams,
    userImageIdFromParams,
  ]);

  return { isLoading, painterUserId, error };
};
