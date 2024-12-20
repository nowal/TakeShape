let isScriptLoaded = false;
let scriptLoadingPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (
  apiKey: string
): Promise<void> => {
  if (isScriptLoaded) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=marker,places&mapId=4d7092f4ba346ef1`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      resolve();
    };

    script.onerror = (error) => {
      reject(error);
    };

    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
};
