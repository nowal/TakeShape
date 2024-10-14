import { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { TJob, TPaintPreferences } from '@/types'; // Ensure this path is correct
import { TQuoteKey } from '@/components/dashboard/painter/types';
import { notifyError } from '@/utils/notifications';
import { resolveVideoUrl } from '@/context/dashboard/painter/video-url';
import { getDistanceFromCoordsInKm } from '@/context/dashboard/painter/get-distance-from-coords-in-km';
import { isDefined } from '@/utils/validation/is/defined';
import { useApp } from '@/context/app/provider';

export const useDashboardPainterState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const [jobList, setJobList] = useState<TJob[]>([]);
  const [selectedPage, setSelectedPage] =
    useState<TQuoteKey>('Available Quotes');
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleGeocodeAddress = async (address: string) => {
    console.log(
      'useDashboardPainterState.handleGeocodeAddress, address:',
      address
    );

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
      const errorMessage = 'Geocoding request failed';
      console.error(errorMessage, error);
      notifyError(errorMessage);
    }
    return null;
  };

  const isJobWithinRange = async (
    painterAddress: string,
    range: number,
    jobAddress: { lat: number; lng: number }
  ): Promise<boolean> => {
    const geocodedPainterAddress =
      await handleGeocodeAddress(painterAddress);

    if (geocodedPainterAddress) {
      const { lat: painterLat, lng: painterLng } =
        geocodedPainterAddress;
      const { lat: jobLat, lng: jobLng } = jobAddress;

      // console.log(
      //   `Painter Location: (${painterLat}, ${painterLng})`
      // );
      // console.log(`TJob Location: (${jobLat}, ${jobLng})`);

      const distance = getDistanceFromCoordsInKm(
        painterLat,
        painterLng,
        jobLat,
        jobLng
      );
      // console.log(
      //   `Distance: ${distance} km, Range: ${
      //     range * 1.60934
      //   } km`
      // );

      return distance <= range * 1.60934; // Convert miles to kilometers
    } else {
      console.error(
        'Failed to geocode painter address:',
        painterAddress
      );
      return false;
    }
  };

  const handleFetchPainterData = async () => {
    try {
      if (user) {
        const painterQuery = query(
          collection(firestore, 'painters'),
          where('userId', '==', user.uid)
        );
        const painterSnapshot = await getDocs(painterQuery);
        if (!painterSnapshot.empty) {
          const painterData =
            painterSnapshot.docs[0].data();

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

                if (
                  lat === undefined ||
                  lng === undefined
                ) {
                  const geocodedLocation =
                    await handleGeocodeAddress(
                      jobData.address
                    );
                  if (geocodedLocation) {
                    lat = geocodedLocation.lat;
                    lng = geocodedLocation.lng;
                  }
                }

                if (isDefined(lat) && isDefined(lng)) {
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

                    const video = await resolveVideoUrl(
                      jobData.video
                    );
                    return {
                      ...jobData,
                      ...(video
                        ? { video }
                        : { video: '' }),
                      jobId: jobDoc.id,
                    };
                  }
                } else {
                  console.error(
                    'Job address is missing latitude and/or lnggitude after geocoding:',
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
    } catch (error) {
      const errorMessage = 'Error fetching painter data';
      notifyError(errorMessage);
      console.error(error);
    }
  };

  useEffect(() => {
    handleFetchPainterData();
  }, [user, firestore]);

  const handlePageChange = (selected: TQuoteKey) => {
    setSelectedPage(selected);
    if (selected === 'Available Quotes') {
      handleFetchPainterData(); // Fetch available quotes
      onNavigateScrollTopClick('/dashboard');
    } else if (selected === 'Accepted Quotes') {
      onNavigateScrollTopClick('/acceptedQuotes');
    } else if (selected === 'Completed Quotes') {
      onNavigateScrollTopClick('/completedQuotes');
    }
  };

  return {
    selectedPage,
    jobs: jobList,
    user,
    isJobWithinRange,
    dispatchJobList: setJobList,
    onFetchPainterData: handleFetchPainterData,
    onPageChange: handlePageChange,
    onGeocodeAddress: handleGeocodeAddress,
  };
};
