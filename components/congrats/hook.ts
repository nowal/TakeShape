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
import { useDashboard } from '@/context/dashboard/provider';
import { notifyError } from '@/utils/notifications';

export const useCongrats = () => {
  const dashboard = useDashboard();
  const { acceptedQuote, userData, userImageList } =
    dashboard;
  console.log(userData, userImageList, acceptedQuote);
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
  const painterId =
    acceptedQuote?.painterId ??
    searchParams.get('painterId');

  useEffect(() => {
    if (pathname !== '/congrats') return;

    const updateAcceptedQuote = async () => {
      console.log('This even fired');
      setLoading(true);

      if (userImageIdFromParams && painterId) {
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
              if (price.painterId === painterId) {
                console.log("Get's the updated accepted");
                return { ...price, accepted: true };
              }
              return price;
            });

            await updateDoc(userImageRef, {
              prices: updatedPrices,
              acceptedPainters: arrayUnion(painterId),
            });

            console.log(
              'Quote accepted and userImage updated successfully!'
            );
          } else {
            const errorMessage =
              'An error occurred while updating the quote. Please try again.';
            console.error(
              'User image document not found',
              errorMessage
            );
            setError(errorMessage);
            notifyError(errorMessage);
          }
        } catch (error) {
          const errorMessage =
            'An error occurred while updating the quote. Please try again.';
          console.error(errorMessage, error);
          setError(errorMessage);
          notifyError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
      setLoading(false);
    };

    if (painterId) {
      console.log('Where painterId coming from');
      // Update painterUserId state first
      setPainterUserId(painterId);

      // Then check if userImageIdFromParams is available and call updateAcceptedQuote
      if (userImageIdFromParams) {
        updateAcceptedQuote();
      } else {
        console.error('No userImageId found in URL params');
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    } else {
      const errorMessage =
        'An error occurred. Please try again.';

      console.error(
        'No painterId (userId) found in URL params'
      );
      setError(errorMessage);
      notifyError(errorMessage);
      setLoading(false);
    }
  }, [
    firestore,
    pathname,
    painterId,
    userImageIdFromParams,
  ]);

  return { isLoading, painterId, error };
};
