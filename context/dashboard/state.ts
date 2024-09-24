'use client';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useSearchParams } from 'next/navigation';
import {
  userDataAtom,
  isPainterAtom,
  checkingAuthAtom,
  userTypeLoadingAtom,
  uploadStatusAtom,
  uploadProgressAtom,
} from '../../atom';
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

export const useDashboardState = () => {
  const [userData, setUserData] = useAtom(userDataAtom);
  const [isShowModal, setShowModal] = useState(false);
  const [selectedQuoteAmount, setSelectedQuoteAmount] =
    useState<number>(0);
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  const [checkingAuth, setCheckingAuth] = useAtom(
    checkingAuthAtom
  );
  const [userTypeLoading, setUserTypeLoading] = useAtom(
    userTypeLoadingAtom
  );
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('There is user');
        fetchUserData();
      } else {
        setUserData(null);
        setPainter(false);
        setCheckingAuth(false);
        setUserTypeLoading(false);
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

  const fetchUserData = async () => {
    if (!auth.currentUser) {
      setCheckingAuth(false);
      return;
    }
    console.log('Fetching user data...');
    const userDocRef = doc(
      firestore,
      'users',
      auth.currentUser.uid
    );
    const userDoc = await getDoc(userDocRef);
    console.log(
      '▁▁▁▁▂▂▂▂▃▃▃▃▄▄▄▅▅▅▅▆▆▆▆▇▇▇▇██▓▒░ 🧨 ░▒▓█▓▒░ 🧨 ░▒▓██▇▇▇▇▆▆▆▆▅▅▅▅▄▄▄▃▃▃▃▂▂▂▂▁▁▁▁'
    );
    console.dir(userDoc);
    console.log(
      '██████████████▓▒░ 🧨 ░▒ line: 110, file: state.ts ▓▒░ 🧨 ░▒██████████████'
    );

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
          console.log(
            `Fetched title for userImage ${id}: ${title}`
          );
          return { id, title };
        })
      );
      setUserImageList(userImagesData);

      const userImageIdFromParams =
        searchParams.get('userImageId');
      const initialUserImageId =
        userImageIdFromParams ||
        (userImageIds.length > 0 ? userImageIds[0] : '');
      console.log('right after search params');

      if (initialUserImageId) {
        console.log('Initial');
        console.log(initialUserImageId);
        fetchUserImageData(initialUserImageId);
        setSelectedUserImage(initialUserImageId);
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
            profilePictureUrl: agentData.profilePictureUrl,
            preferredPainters:
              agentData.preferredPainters || [],
          });
          console.log(
            'Agent info fetched successfully:',
            agentData
          );

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
      console.log(auth.currentUser.uid);
      const paintersQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', auth.currentUser.uid)
      );
      const paintersSnapshot = await getDocs(paintersQuery);

      if (!paintersSnapshot.empty) {
        // User exists in the painters collection
        setPainter(true);
        console.log('User is a painter'); // Add this log
      } else {
        console.error(
          'No user document found for the current user.'
        );
      }
    }

    setCheckingAuth(false);
    setUserTypeLoading(false);
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
      console.log('Fetched prices:', prices);
      console.log('Fetched video:', video);
      console.log('Fetched title:', title);
      setUserData({
        ...userImageData,
        prices,
        video,
        title,
      }); // Include title in user data
      console.log('User data set:', {
        ...userImageData,
        prices,
        video,
        title,
      });
    } else {
      console.error(
        'No user image document found for the current user image ID.'
      );
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

  const handleQuoteChange: TQuoteChangeHandler = async (
    userImageId: string
  ) => {
    setSelectedUserImage(userImageId);
    await fetchUserImageData(userImageId);
  };

  const handleAcceptQuote: TAcceptQuoteHandler = async (
    painterId: string,
    amount: number
  ) => {
    setPainterId(painterId);

    try {
      console.log(
        'auth.currentUser selectedUserImage',
        auth.currentUser,
        selectedUserImage
      );

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
          console.error('No selected user image.');
        }
      } else {
        console.error('No authenticated user.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    isShowModal,
    isPainter,
    painterId,
    userImageList,
    uploadStatus,
    userData,
    uploadProgress,
    acceptedQuote,
    onAcceptQuote: handleAcceptQuote,
    preferredPainterUserIds,
    agentInfo,
    selectedUserImage,
    selectedQuoteAmount,
    dispatchShowModal: setShowModal,
    onQuoteChange: handleQuoteChange,
  };
};
