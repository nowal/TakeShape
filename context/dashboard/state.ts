import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useSearchParams } from 'next/navigation';
import {
  userDataAtom,
  isPainterAtom,
  userTypeLoadingAtom,
  uploadStatusAtom,
  uploadProgressAtom,
} from '@/atom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  getDoc,
  query,
  where,
  getDocs,
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  TUserData,
  TUserImageRecord,
  TPrice,
  TAgentInfo,
  TUserImage,
  TAcceptQuoteHandler,
  TQuoteChangeHandler,
} from '@/types';
import { notifyError } from '@/utils/notifications';
import { usePreferences } from '@/context/preferences/provider';
import { useQueryParamsSet } from '@/hooks/query-params/set';

export const useDashboardState = () => {
  const [userData, setUserData] = useAtom(userDataAtom);
  const [isShowModal, setShowModal] = useState(false);
  const [
    isAcceptQuoteSubmitting,
    setAcceptQuoteSubmitting,
  ] = useState(false);

  const [selectedQuoteAmount, setSelectedQuoteAmount] =
    useState<number>(0);
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  const [isUserDataLoading, setUserDataLoading] = useAtom(
    userTypeLoadingAtom
  );
  const [isVideoLoading, setVideoLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [painterId, setPainterId] = useState('');
  const [
    uploadProgress,
    //  setUploadProgress
  ] = useAtom(uploadProgressAtom);
  const [uploadStatus, setUploadStatus] = useAtom(
    uploadStatusAtom
  );
  const [acceptedQuote, setAcceptedQuote] =
    useState<TPrice | null>(null);
  const firestore = getFirestore();
  const [selectedUserImage, setSelectedUserImage] =
    useState<string>(''); // Initialize as empty string
  const [userImageList, setUserImageList] = useState<
    TUserImage[]
  >([]);
  const auth = getAuth();

  const searchParams = useSearchParams();
  const [agentInfo, setAgentInfo] =
    useState<TAgentInfo>(null);
  const [
    preferredPainterUserIds,
    setPreferredPainterUserIds,
  ] = useState<string[]>([]);
  const { onFetchUserPreferences } = usePreferences();
  const handleSetParam = useQueryParamsSet();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('There is user');
        fetchUserData();
      } else {
        setUserData(null);
        setPainter(false);
        setUserDataLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    // Check if there's an accepted quote in userData.prices
    if (userData && userData.prices) {
      const acceptedQuoteFromPrices = userData.prices.find(
        (price) => price.accepted
      );
      setAcceptedQuote(acceptedQuoteFromPrices || null);
    }
  }, [userData?.prices]);

  useEffect(() => {
    setVideoLoading(true);
  }, [userData?.video]);

  const fetchUserData = async () => {
    try {
      setUserDataLoading(true);
      if (!auth.currentUser) {
        console.log('NO USER');
        return;
      }
      console.log('Fetching user data...');
      const userDocRef = doc(
        firestore,
        'users',
        auth.currentUser.uid
      );
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userDocData = userDoc.data() as TUserData;
        console.log('User data:', userDocData); // Add this log
        // Since the user exists in the users collection, we set isPainter to false
        setPainter(false);

        const userImageIds = userDocData.userImages || [];
        const userImagesData = await Promise.all(
          userImageIds.map(async (id) => {
            const userImageDocRef = doc(
              firestore,
              'userImages',
              id
            );
            const userImageDoc = await getDoc(
              userImageDocRef
            );
            const title =
              userImageDoc.data()?.title || 'Untitled';
            // console.log(
            //   `Fetched title for userImage ${id}: ${title}`
            // );
            return { id, title };
          })
        );
        setUserImageList(userImagesData);

        const userImageIdFromParams =
          searchParams.get('userImageId');
        const initialUserImageId =
          userImageIdFromParams ||
          (userImageIds.length > 0 ? userImageIds[0] : '');
        // console.log('right after search params');

        if (initialUserImageId) {
          // console.log('Initial');
          // console.log(initialUserImageId);
          setSelectedUserImage(initialUserImageId);
          handleSetParam('userImageId', initialUserImageId);
          fetchUserImageData(initialUserImageId);
        }

        if (userDocData.reAgent) {
          const reAgentId = userDocData.reAgent;
          const agentDocRef = doc(
            firestore,
            'reAgents',
            reAgentId
          );
          const agentDoc = await getDoc(agentDocRef);

          if (agentDoc.exists()) {
            const agentData = agentDoc.data();
            setAgentInfo({
              name: agentData.name,
              profilePictureUrl:
                agentData.profilePictureUrl,
              preferredPainters:
                agentData.preferredPainters || [],
            });
            // console.log(
            //   'Agent info fetched successfully:',
            //   agentData
            // );

            if (
              agentData.preferredPainters &&
              agentData.preferredPainters.length > 0
            ) {
              const paintersQuery = query(
                collection(firestore, 'painters'),
                where(
                  'phoneNumber',
                  'in',
                  agentData.preferredPainters
                )
              );
              const paintersSnapshot = await getDocs(
                paintersQuery
              );
              const painterUserIds =
                paintersSnapshot.docs.map(
                  (doc) => doc.data().userId
                );
              setPreferredPainterUserIds(painterUserIds);
              console.log(
                'Preferred Painter User IDs fetched:',
                painterUserIds
              );
            }
          }
        }
      } else {
        // Check if the user exists in the painters collection
        // console.log(auth.currentUser.uid);
        const paintersQuery = query(
          collection(firestore, 'painters'),
          where('userId', '==', auth.currentUser.uid)
        );
        const paintersSnapshot = await getDocs(
          paintersQuery
        );

        if (!paintersSnapshot.empty) {
          // User exists in the painters collection
          setPainter(true);
          console.log('User is a painter'); // Add this log
        } else {
          const logMessage =
            'No user document found for the current user.';
          console.log(logMessage);
        }
      }
    } catch (error) {
      const errorMessage = 'Failed to fetch User Data.';
      console.error(error, errorMessage);
      notifyError(errorMessage);
    } finally {
      setUserDataLoading(false);
    }
  };

  const fetchUserImageData = async (
    userImageId: string
  ) => {
    const userImageDocRef = doc(
      firestore,
      'userImages',
      userImageId
    );
    const userImageDoc = await getDoc(userImageDocRef);

    if (userImageDoc.exists()) {
      const userImageData =
        userImageDoc.data() as TUserImageRecord;
      const prices = userImageData.prices;
      const video = userImageData.video;
      const title = userImageData.title || 'Untitled'; // Ensure title is fetched
      // console.log('Fetched prices:', prices);
      // console.log('Fetched video:', video);
      // console.log('Fetched title:', title);
      setUserData({
        ...userImageData,
        prices,
        video,
        title,
      }); // Include title in user data
      // console.log('User data set:', {
      //   ...userImageData,
      //   prices,
      //   video,
      //   title,
      // });
    } else {
      const errorMessage =
        'No user image document found for the current user image ID.';
      console.error(errorMessage);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserData();
    } else {
      setUserDataLoading(false);
    }
  }, [auth.currentUser]);

  const handleSelectedUserImage = (next: string) => {
    setSelectedUserImage(next);
    handleSetParam('userImageId', next);
  };
  const handleQuoteChange: TQuoteChangeHandler = async (
    userImageId: string
  ) => {
    handleSelectedUserImage(userImageId);
    onFetchUserPreferences(userImageId);
    await fetchUserImageData(userImageId);
  };

  const handleAcceptQuote: TAcceptQuoteHandler = async (
    painterId: string,
    amount: number
  ) => {
    setPainterId(painterId);

    try {
      setAcceptQuoteSubmitting(true);
      // console.log(
      //   'auth.currentUser selectedUserImage',
      //   auth.currentUser,
      //   selectedUserImage
      // );

      if (auth.currentUser) {
        if (selectedUserImage) {
          const userImageDocRef = doc(
            firestore,
            'userImages',
            selectedUserImage
          );
          console.log('userImageDocRef ', userImageDocRef);
          await updateDoc(userImageDocRef, {
            phoneNumber,
          });
          console.log(
            'Selected User Image:',
            selectedUserImage
          ); // Add this line
          console.log('Painter ID:', painterId); // Add this line
          setSelectedQuoteAmount(amount);
          setShowModal(true);
        } else {
          const errorMessage = 'No selected user image';
          console.error(errorMessage);
          notifyError(errorMessage);
        }
      } else {
        const errorMessage = 'No authenticated user';
        console.error(errorMessage);
        notifyError(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Error accepting quote';
      console.error(errorMessage, error);
      notifyError(errorMessage);
    } finally {
      setAcceptQuoteSubmitting(false);
    }
  };

  return {
    isAcceptQuoteSubmitting,
    isUserDataLoading,
    isShowModal,
    isPainter,
    isVideoLoading,
    painterId,
    userImageList,
    uploadStatus,
    userData,
    uploadProgress,
    acceptedQuote,
    preferredPainterUserIds,
    agentInfo,
    selectedUserImage,
    selectedQuoteAmount,
    dispatchShowModal: setShowModal,
    dispatchVideoLoading: setVideoLoading,
    dispatchUserImageList: setUserImageList,
    dispatchUserData: setUserData,
    onAcceptQuote: handleAcceptQuote,
    onSelectedUserImage: handleSelectedUserImage,
    onQuoteChange: handleQuoteChange,
  };
};
