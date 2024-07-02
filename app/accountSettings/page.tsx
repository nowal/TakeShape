'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleAnalytics } from '@next/third-parties/google';
import firebase from '../../lib/firebase';
import { useAtom } from 'jotai';
import { isPainterAtom, painterInfoAtom } from '../../atom/atom';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMapsScript'; // Adjust the import path as needed

// Define the type for address components
interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export default function AccountSettingsPage() {
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [painterInfo, setPainterInfo] = useAtom(painterInfoAtom);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [newProfilePicturePreview, setNewProfilePicturePreview] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', lat: 0, lng: 0 });
  const [range, setRange] = useState(10);
  const [isInsured, setIsInsured] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const auth = getAuth(firebase);
  const firestore = getFirestore();
  const storage = getStorage(firebase);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const agentDocRef = doc(firestore, 'reAgents', user.uid);
          const agentDoc = await getDoc(agentDocRef);

          if (agentDoc.exists()) {
            setIsPainter(false);
            const agentData = agentDoc.data();
            setName(agentData.name || '');
            setPhoneNumber(agentData.phoneNumber || '');
            setProfilePictureUrl(agentData.profilePictureUrl || null);
          } else {
            const painterQuery = query(collection(firestore, "painters"), where("userId", "==", user.uid));
            const painterSnapshot = await getDocs(painterQuery);

            if (!painterSnapshot.empty) {
              setIsPainter(true);
              const painterData = painterSnapshot.docs[0].data();
              setBusinessName(painterData.businessName || '');
              setAddress(painterData.address || { street: '', city: '', state: '', zip: '', lat: 0, lng: 0 });
              setRange(painterData.range || 10);
              setIsInsured(painterData.isInsured || false);
              setPhoneNumber(painterData.phoneNumber || '');
              setLogoUrl(painterData.logoUrl || null);
            } else {
              setErrorMessage('User data not found.');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setErrorMessage('Failed to load user data. Please try again later.');
        } finally {
          setIsDataLoading(false); // Stop loading
        }
      } else {
        setIsDataLoading(false); // Stop loading if no user is authenticated
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript('AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'); // Replace with your actual API key
        if (window.google) {
          const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current!, {
            types: ['address'],
            componentRestrictions: { country: 'us' }
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location || !place.address_components) {
              console.error('Error: place details are incomplete.');
              return;
            }

            const addressComponents = place.address_components;

            const newAddress = {
              street: '',
              city: '',
              state: '',
              zip: '',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };

            addressComponents.forEach((component: AddressComponent) => {
              const types = component.types;
              if (types.includes('street_number')) {
                newAddress.street = `${component.long_name} ${newAddress.street}`;
              }
              if (types.includes('route')) {
                newAddress.street += component.long_name;
              }
              if (types.includes('locality')) {
                newAddress.city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                newAddress.state = component.short_name;
              }
              if (types.includes('postal_code')) {
                newAddress.zip = component.long_name;
              }
            });

            setAddress(newAddress);
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps script:', error);
      }
    };

    initAutocomplete();
  }, []);

  useEffect(() => {
    if (address.lat && address.lng) {
      initializeMap(address.lat, address.lng, range);
    }
  }, [address, range]);

  const initializeMap = (lat: number, lng: number, range: number) => {
    if (window.google && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      const center = new window.google.maps.LatLng(lat, lng);
      bounds.extend(center);
      bounds.extend(new window.google.maps.LatLng(lat + range / 69, lng));
      bounds.extend(new window.google.maps.LatLng(lat - range / 69, lng));
      bounds.extend(new window.google.maps.LatLng(lat, lng + range / 69));
      bounds.extend(new window.google.maps.LatLng(lat, lng - range / 69));

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 10
        });
      } else {
        mapInstanceRef.current.fitBounds(bounds);
      }

      if (!circleRef.current) {
        circleRef.current = new window.google.maps.Circle({
          map: mapInstanceRef.current,
          center: { lat, lng },
          radius: range * 1609.34, // Convert miles to meters
          fillColor: '#AA0000',
          strokeColor: '#AA0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillOpacity: 0.35
        });
      } else {
        circleRef.current.setCenter({ lat, lng });
        circleRef.current.setRadius(range * 1609.34);
      }

      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          draggable: true,
        });

        markerRef.current.addListener('dragend', () => {
          const newLat = markerRef.current!.getPosition()!.lat();
          const newLng = markerRef.current!.getPosition()!.lng();
          setAddress((prev) => ({
            ...prev,
            lat: newLat,
            lng: newLng,
          }));
          initializeMap(newLat, newLng, range);
        });
      } else {
        markerRef.current.setPosition({ lat, lng });
      }

      mapInstanceRef.current.fitBounds(circleRef.current.getBounds()!);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      if (isPainter) {
        // Painter specific update
        const painterQuery = query(collection(firestore, "painters"), where("userId", "==", currentUser.uid));
        const painterSnapshot = await getDocs(painterQuery);

        if (!painterSnapshot.empty) {
          const painterDocRef = painterSnapshot.docs[0].ref;
          const updatedLogoUrl = logo ? await uploadLogoAndGetUrl(logo) : logoUrl; // Handle logo upload if provided

          const updatedPainterData = {
            businessName,
            address,
            range,
            isInsured,
            logoUrl: updatedLogoUrl,
            phoneNumber,
          };

          await updateDoc(painterDocRef, updatedPainterData);
          console.log('Painter info updated:', updatedPainterData);

          window.location.reload(); // Reload the page after updating
        } else {
          setErrorMessage('Painter data not found.');
        }
      } else {
        // Agent specific update
        let profilePictureUrlToUpdate = profilePictureUrl;

        // Upload new profile picture if provided
        if (newProfilePicture) {
          const profilePictureRef = storageRef(storage, `profilePictures/${currentUser.uid}`);
          await uploadBytes(profilePictureRef, newProfilePicture);
          profilePictureUrlToUpdate = await getDownloadURL(profilePictureRef);
        }

        // Update user document in "reAgents" collection
        const userDocRef = doc(firestore, "reAgents", currentUser.uid);
        await updateDoc(userDocRef, {
          name,
          phoneNumber,
          profilePictureUrl: profilePictureUrlToUpdate,
        });

        router.push('/agentDashboard');
      }
    } catch (error) {
      console.error("Error updating user info: ", error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const uploadLogoAndGetUrl = async (logoFile: File | null) => {
    if (!logoFile) {
      return ''; // Return an empty string if no logo file is provided
    }

    const logoRef = storageRef(storage, `logos/${logoFile.name}-${Date.now()}`); // Append timestamp to ensure unique file names

    try {
      const uploadResult = await uploadBytes(logoRef, logoFile);
      console.log('Upload result:', uploadResult);

      const logoUrl = await getDownloadURL(uploadResult.ref);
      console.log('Logo URL:', logoUrl);

      return logoUrl;
    } catch (error) {
      console.error('Error uploading logo: ', error);
      throw new Error('Error uploading logo.');
    }
  };

  if (isDataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <h1 className="text-center text-2xl font-bold mb-6">Account Settings</h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {isPainter ? (
          <>
            <div>
              <label htmlFor="businessName" className="block text-md font-medium text-gray-700">Business or Personal Name</label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business or personal name"
                required
                className="p-2 border rounded w-full"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-md font-medium text-gray-700">Address</label>
              <input
                type="text"
                id="address"
                ref={addressInputRef}
                value={`${address.street}, ${address.city}, ${address.state}, ${address.zip}`}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Enter your address"
                required
                className="p-2 border rounded w-full"
              />
            </div>

            <div>
              <label htmlFor="range" className="block text-md font-medium text-gray-700">Range (miles)</label>
              <select
                id="range"
                value={range}
                onChange={(e) => setRange(Number(e.target.value))}
                required
                className="p-2 border rounded w-full"
              >
                {[10, 20, 30, 40, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {address.lat !== 0 && address.lng !== 0 && (
              <>
                <div className="text-left text-gray-700 mb-2">Drag Marker to adjust service location</div>
                <div ref={mapRef} style={{ height: '400px', marginTop: '20px' }}></div>
              </>
            )}

            <div>
              <label htmlFor="phoneNumber" className="block text-md font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
                className="p-2 border rounded w-full"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isInsured"
                checked={isInsured}
                onChange={(e) => setIsInsured(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isInsured" className="text-md font-medium text-gray-700">Are you insured?</label>
            </div>

            <div>
              <label htmlFor="logo" className="block text-md font-medium text-gray-700">Company Logo (optional)</label>
              {(logoPreview || logoUrl) && (
                <img
                  src={logoPreview || logoUrl || undefined}
                  alt="Company Logo"
                  className="mb-2 w-24 h-24 object-cover rounded-full"
                />
              )}
              <input
                type="file"
                id="logo"
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleLogoChange}
                className="p-2 border rounded w-full"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="name" className="block text-md font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="p-2 border rounded w-full"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-md font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
                className="p-2 border rounded w-full"
              />
            </div>

            <div>
              <label htmlFor="profilePicture" className="block text-md font-medium text-gray-700">Profile Picture</label>
              {(newProfilePicturePreview || profilePictureUrl) && (
                <img
                  src={newProfilePicturePreview || profilePictureUrl || undefined}
                  alt="Profile Picture"
                  className="mb-2 w-24 h-24 object-cover rounded-full"
                />
              )}
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="p-2 border rounded w-full"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className={`button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
}
