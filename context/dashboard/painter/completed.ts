import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  getDownloadURL,
} from 'firebase/storage';
import axios from 'axios';
import { TJob, TPaintPreferences } from '@/types'; // Adjust the import path as needed
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

export const useDashboardPainterCompleted = () => {
  const dashboardPainter = useDashboardPainter();
  const [jobList, setJobList] = useState<TJob[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const firestore = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false); // Authentication state is confirmed, loading is done
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPainterData();
    }
  }, [user, firestore]);

  const fetchPainterData = async () => {
    if (user) {
      const painterQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', user.uid)
      );
      const painterSnapshot = await getDocs(painterQuery);

      if (!painterSnapshot.empty) {
        const painterData = painterSnapshot.docs[0].data();

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

                  // Fetch user information if userId is defined
                  if (jobData.userId) {
                    const userDocRef = doc(
                      firestore,
                      'users',
                      jobData.userId
                    );
                    const userDocSnap = await getDoc(
                      userDocRef
                    );
                    if (userDocSnap.exists()) {
                      const userData = userDocSnap.data();
                      jobData.customerName = userData.name;
                      jobData.phoneNumber =
                        jobData.phoneNumber ||
                        userData.phoneNumber;
                      jobData.address =
                        jobData.address || userData.address;
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
                  'TJob address is missing latitude and/or longitude after geocoding:',
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
        setJobList(filteredJobs);
      }
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

      const distance = getDistanceFromLatLonInKm(
        painterLat,
        painterLng,
        jobLat,
        jobLng
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
    if (!path) {
      return '';
    }
    const videoRef = ref(storage, path);
    try {
      return await getDownloadURL(videoRef);
    } catch (error) {
      console.error('Error getting video URL: ', error);
      return '';
    }
  };

  return {
    ...dashboardPainter,
    authLoading,
    jobs: jobList,
  };
};
