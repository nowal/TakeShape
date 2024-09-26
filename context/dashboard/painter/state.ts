import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { TJob, TPaintPreferences } from '@/types'; // Ensure this path is correct

export const useDashboardPainterState = () => {
  const [jobList, setJobList] = useState<TJob[]>([]);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState(
    'Available Quotes'
  );
  const firestore = getFirestore();
  const storage = getStorage(); // Initialize Firebase Storage
  const auth = getAuth();
  const router = useRouter();
  const user = auth.currentUser;

  const fetchPainterData = async () => {
    if (user) {
      const painterQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', user.uid)
      );
      const painterSnapshot = await getDocs(painterQuery);
      if (!painterSnapshot.empty) {
        const painterData = painterSnapshot.docs[0].data();

        console.log('Painter Data:', painterData);

        const userImagesQuery = collection(
          firestore,
          'userImages'
        );
        const userImagesSnapshot = await getDocs(
          userImagesQuery
        );
        const jobs = await Promise.all(
          userImagesSnapshot.docs.map(async (jobDoc) => {
            const jobData = jobDoc.data() as TJob;

            if (jobData.address) {
              let { lat, lng } = jobData;

              if (lat === undefined || lng === undefined) {
                const geocodedLocation =
                  await geocodeAddress(jobData.address);
                if (geocodedLocation) {
                  lat = geocodedLocation.lat;
                  lng = geocodedLocation.lng;
                }
              }

              if (lat !== undefined && lng !== undefined) {
                const isWithinRange =
                  await isJobWithinRange(
                    painterData.address,
                    painterData.range,
                    { lat, lng }
                  );
                if (isWithinRange) {
                  if (jobData.paintPreferencesId) {
                    const paintPrefDocRef = doc(
                      firestore,
                      'paintPreferences',
                      jobData.paintPreferencesId
                    );
                    const paintPrefDocSnap = await getDoc(
                      paintPrefDocRef
                    );
                    if (paintPrefDocSnap.exists()) {
                      jobData.paintPreferences =
                        paintPrefDocSnap.data() as TPaintPreferences;
                    }
                  }

                  // Ensure the video URL is correct
                  const videoUrl = await getVideoUrl(
                    jobData.video
                  );
                  return {
                    ...jobData,
                    video: videoUrl,
                    jobId: jobDoc.id,
                  };
                }
              } else {
                console.error(
                  'Job address is missing latitude and/or longitude after geocoding:',
                  jobData.address
                );
              }
            }
            return null;
          })
        );
        const filteredJobs = jobs.filter(
          (job) => job !== null
        ) as TJob[];
        const unquotedJobs = filteredJobs.filter(
          (job) =>
            !job.prices.some(
              (price) => price.painterId === user.uid
            )
        );
        setJobList(unquotedJobs);
      }
    } else {
      console.log(
        'No user found, unable to fetch painter data.'
      );
    }
  };

  const geocodeAddress = async (address: string) => {
    const apiKey =
      'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === 'OK') {
        const location =
          response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      } else {
        console.error(
          'Geocoding error:',
          response.data.status,
          response.data.error_message
        );
      }
    } catch (error) {
      console.error('Geocoding request failed:', error);
    }
    return null;
  };

  const isJobWithinRange = async (
    painterAddress: string,
    range: number,
    jobAddress: { lat: number; lng: number }
  ): Promise<boolean> => {
    const geocodedPainterAddress = await geocodeAddress(
      painterAddress
    );

    if (geocodedPainterAddress) {
      const { lat: painterLat, lng: painterLng } =
        geocodedPainterAddress;
      const { lat: jobLat, lng: jobLng } = jobAddress;

      console.log(
        `Painter Location: (${painterLat}, ${painterLng})`
      );
      console.log(`TJob Location: (${jobLat}, ${jobLng})`);

      const distance = getDistanceFromLatLonInKm(
        painterLat,
        painterLng,
        jobLat,
        jobLng
      );
      console.log(
        `Distance: ${distance} km, Range: ${
          range * 1.60934
        } km`
      );

      return distance <= range * 1.60934; // Convert miles to kilometers
    } else {
      console.error(
        'Failed to geocode painter address:',
        painterAddress
      );
      return false;
    }
  };

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c =
      2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const getVideoUrl = async (
    path: string
  ): Promise<string> => {
    const videoRef = ref(storage, path);
    try {
      return await getDownloadURL(videoRef);
    } catch (error) {
      console.error('Error getting video URL: ', error);
      return '';
    }
  };

  useEffect(() => {
    fetchPainterData();
  }, [user, firestore]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handlePriceChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setPrice(value.replace(/[^0-9.]/g, '')); // This regex allows only numbers and decimal point
  };

  const handlePriceSubmit = async (
    event: FormEvent<HTMLFormElement>,
    jobId: string,
    amount: number
  ): Promise<void> => {
    event.preventDefault();
    setIsLoading(true); // Set loading state to true

    if (!user || price === '') {
      setIsLoading(false); // Reset loading state
      return; // Ensure user exists and price is not empty
    }

    // Convert price back to a number before submitting
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      alert('Please enter a valid price');
      setIsLoading(false); // Reset loading state
      return;
    }

    let invoiceUrl = ''; // Initialize invoiceUrl as an empty string

    // Only attempt to upload file and get URL if a file is selected
    if (selectedFile) {
      const invoicePath = `invoices/${user.uid}/${
        selectedFile.name
      }-${Date.now()}`; // Adding timestamp to make filename unique
      const storageRef = ref(storage, invoicePath);

      try {
        const fileSnapshot = await uploadBytes(
          storageRef,
          selectedFile
        );
        invoiceUrl = await getDownloadURL(fileSnapshot.ref); // Get URL only if file upload succeeds
      } catch (error) {
        console.error('Error uploading invoice: ', error);
      }
    }

    // Proceed to update the job with the new price (and invoiceUrl if available)
    const newPrice = {
      painterId: user.uid,
      amount: amount,
      timestamp: Date.now(),
      ...(invoiceUrl && { invoiceUrl }), // Spread invoiceUrl into the object if it exists
    };

    const jobRef = doc(firestore, 'userImages', jobId);
    try {
      await updateDoc(jobRef, {
        prices: arrayUnion(newPrice),
      });
      console.log(
        `Price${
          invoiceUrl ? ' and invoice' : ''
        } for job ${jobId} updated successfully`
      );
      // Optionally reset form state here
      setSelectedFile(null);
      setPrice(''); // Reset price state, consider setting to initial
      // Reset price state, consider setting to initial value
      fetchPainterData(); // Refresh data
    } catch (updateError) {
      console.error('Error updating price: ', updateError);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handlePageChange = (
    // event: ChangeEvent<HTMLSelectElement>
    selected: string
  ) => {
    // const selected = event.target.value;
    setSelectedPage(selected);
    if (selected === 'Available Quotes') {
      fetchPainterData(); // Fetch available quotes
    } else if (selected === 'Accepted Quotes') {
      router.push('/acceptedQuotes');
    } else if (selected === 'Completed Quotes') {
      router.push('/completedQuotes');
    }
  };

  return {
    selectedPage,
    isLoading,
    jobs: jobList,
    user,
    isJobWithinRange,
    dispatchJobList: setJobList,
    onPageChange: handlePageChange,
    onPriceSubmit: handlePriceSubmit,
    onFileChange: handleFileChange,
    onPriceChange: handlePriceChange,
  };
};
