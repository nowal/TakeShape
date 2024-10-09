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
  const [fileName, setFileName] = useState('');

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
    setUploading(true); // Move to the next step immediately without waiting for the upload to finish
const name = file.name;
    const storage = getStorage(firebase);
    const fileRef = storageRef(
      storage,
      `uploads/${name}`
    );
    const uploadTask = uploadBytesResumable(fileRef, file);
    console.log(file)
    setFileName(name); // Save the URL once the upload is complete

    // Store the upload promise in the state or a ref
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
        console.error('Error uploading video: ', error);
        dispatchErrorMessage(
          'Error uploading video. Please try again.'
        );
        setUploading(false);
      },
      async () => {
        // Handle successful uploads on complete
        const url = await getDownloadURL(
          uploadTask.snapshot.ref
        );
        console.log('File available at', url);
        setUploadStatus('completed');
        setVideoURL(url);
        setUploading(false);

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
