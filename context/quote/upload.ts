import { useState, Dispatch } from 'react';
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
} from 'firebase/storage';
import { notifyError } from '@/utils/notifications';
import { useDashboard } from '@/context/dashboard/provider';
import { useTimebomb } from '@/hooks/time-bomb';

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
  const [progress, setUploadProgress] = useAtom(
    uploadProgressAtom
  );
  const [videoUrl, setVideoURL] = useAtom(videoURLAtom);
  const [uploadStatus, setUploadStatus] = useAtom(
    uploadStatusAtom
  );
  const [isUploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string|null>(null);
  const { dispatchUserData } = useDashboard();
  const { trigger } = useTimebomb(4000, () => {
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
    const uploadTask = uploadBytesResumable(fileRef, file);
    setFileName(name);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress
        const progress =
          (snapshot.bytesTransferred /
            snapshot.totalBytes) *
          100;
        setUploadProgress(progress);
        setUploadStatus('uploading');
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        const errorMessage = 'Error uploading video';
        console.error(errorMessage, error);
        const userErrorMessage =
          'Error uploading video. Please try again.';
        dispatchErrorMessage(userErrorMessage);
        notifyError(userErrorMessage);
        setUploading(false);
      },
      async () => {
        // Handle successful uploads on complete
        const url = await getDownloadURL(
          uploadTask.snapshot.ref
        );
        console.log('File available at', url);
        setUploadStatus('completed');
        trigger();

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

  return {
    progress,
    videoUrl,
    uploadStatus,
    onUpload: handler,
    fileName,
    isUploading,
  };
};
