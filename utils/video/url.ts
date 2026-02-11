import {
  ref,
  getDownloadURL,
  getStorage,
} from 'firebase/storage';

export const resolveVideoUrl = async (
  url?: string | null
) => {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  const storage = getStorage();

  const videoRef = ref(storage, url);
  try {
    return await getDownloadURL(videoRef);
  } catch (error) {
    const errorMessage = 'Error getting video URL';
    console.error(errorMessage, error);
    // notifyError(errorMessage);
    return '';
  }
};
