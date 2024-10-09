import { useState, Dispatch, useRef } from 'react';
import {
  uploadProgressAtom,
  uploadStatusAtom,
  videoURLAtom,
} from '@/atom';
import { useAtom } from 'jotai';
import { updateDoc, doc } from 'firebase/firestore';
import firebase from '@/lib/firebase';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
} from 'firebase/storage';
import { useDashboard } from '@/context/dashboard/provider';
import { useTimebomb } from '@/hooks/time-bomb';
import { usePreferences } from '@/context/preferences/provider';

type TConfig = {
  auth: any;
  firestore: any;
  dispatchErrorMessage: Dispatch<string>;
};
export const useQuoteUpload = ({
  auth,
  firestore,
  dispatchErrorMessage,
}: TConfig) => {
  const { dispatchResubmitting } = usePreferences();
  const { dispatchUserData } = useDashboard();
  const [progress, setUploadProgress] = useAtom(
    uploadProgressAtom
  );
  const [uploadStatus, setUploadStatus] = useAtom(
    uploadStatusAtom
  );
  const uploadTaskRef = useRef<UploadTask | null>(null);
  const [isUploading, setUploading] = useState(false);

  const [videoUrl, setVideoURL] = useAtom(videoURLAtom);

  const [fileName, setFileName] = useState<string | null>(
    null
  );

  const { trigger: delayReset } = useTimebomb(4000, () => {
    setUploadStatus('idle');
    setFileName('');
  });

  const handler = (file: File) => {
    if (auth.currentUser === null) {
      const errorMessage = 'No authenticated user';
      console.log(errorMessage);
    } else {
      console.log(
        'Authenticated user UID: ',
        auth.currentUser.uid
      );
    }
    setUploading(true);
    const name = file.name;
    const storage = getStorage(firebase);
    const fileRef = storageRef(storage, `uploads/${name}`);
    uploadTaskRef.current = uploadBytesResumable(
      fileRef,
      file
    );
    setFileName(name);

    uploadTaskRef.current.on(
      'state_changed',
      (snapshot) => {
        // Handle progress
        const progress =
          (snapshot.bytesTransferred /
            snapshot.totalBytes) *
          100;
        setUploadProgress(progress);
        setUploadStatus('uploading');
        console.log('Upload is ' + progress + '% uploaded');
      },
      (error) => {
        const errorMessage = 'Error uploading video';
        console.error(errorMessage, error);
        const userErrorMessage =
          'Error uploading video. Please try again.';
        dispatchErrorMessage(userErrorMessage);
        // notifyError(userErrorMessage);
        setUploading(false);
        setUploadStatus('idle');
      },
      async () => {
        // Handle successful uploads on complete
        if (!uploadTaskRef.current) return;
        const url = await getDownloadURL(
          uploadTaskRef.current.snapshot.ref
        );
        console.log('File available at', url);
        setUploadStatus('completed');
        delayReset();

        setVideoURL(url);
        setUploading(false);
        dispatchUserData((prev) => ({
          ...prev,
          video: url,
        }));
        // Update the userImage document with the video URL
        const docId = sessionStorage.getItem('userImageId');
        if (docId) {
          await updateDoc(
            doc(firestore, 'userImages', docId),
            {
              video: url,
            }
          );
          console.log(
            `Updated userImage document ${docId} with video URL`
          );
        }
      }
    );
  };

  const handleResubmit = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
    }
    setFileName('');
    setUploading(false);
    setUploadProgress(0);
    setUploadStatus('idle');
    dispatchResubmitting(true);
  };

  return {
    progress,
    videoUrl,
    uploadStatus,
    onUpload: handler,
    dispatchUploadStatus: setUploadStatus,
    dispatchUploading: setUploading,
    dispatchUploadProgress: setUploadProgress,
    dispatchFileName: setFileName,
    fileName,
    isUploading,
    uploadTaskRef,
    onResubmit: handleResubmit,
  };
};
