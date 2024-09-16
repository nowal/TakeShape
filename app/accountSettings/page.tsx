'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleAnalytics } from '@next/third-parties/google';
import firebase from '../../lib/firebase';
import { useAtom } from 'jotai';
import { isPainterAtom, painterInfoAtom } from '../../atom';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMapsScript'; // Adjust the import path as needed
import { FallbacksLoading } from '@/components/fallbacks/loading';

export default function AccountSettingsPage() {
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [painterInfo, setPainterInfo] = useAtom(painterInfoAtom);
  const [isAgent, setIsAgent] = useState(false); // New state for isAgent
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [newProfilePicturePreview, setNewProfilePicturePreview] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [range, setRange] = useState(10);
  const [isInsured, setIsInsured] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [agentName, setAgentName] = useState(''); // New state for agent's name
  const [newAgentName, setNewAgentName] = useState(''); // New state for new agent's name
  const [agentError, setAgentError] = useState(''); // New state for agent error message
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
          // Check if the user is an agent
          const agentDocRef = doc(firestore, 'reAgents', user.uid);
          const agentDoc = await getDoc(agentDocRef);
          if (agentDoc.exists()) {
            setIsAgent(true);
            setIsPainter(false);
            const agentData = agentDoc.data();
            setName(agentData.name || '');
            setPhoneNumber(agentData.phoneNumber || '');
            setProfilePictureUrl(agentData.profilePictureUrl || null);
          } else {
            // Check if the user is a painter
            const painterQuery = query(collection(firestore, "painters"), where("userId", "==", user.uid));
            const painterSnapshot = await getDocs(painterQuery);
            if (!painterSnapshot.empty) {
              setIsPainter(true);
              setIsAgent(false);
              const painterData = painterSnapshot.docs[0].data();
              setBusinessName(painterData.businessName || '');
              setAddress(painterData.address || '');
              setRange(painterData.range || 10);
              setIsInsured(painterData.isInsured || false);
              setPhoneNumber(painterData.phoneNumber || '');
              setLogoUrl(painterData.logoUrl || null);
              // Geocode address to set marker
              geocodeAddress(painterData.address);
            } else {
              // User is a homeowner
              setIsPainter(false);
              setIsAgent(false);
              const userQuery = query(collection(firestore, "users"), where("email", "==", user.email));
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                setName(userData.name || '');
                setPhoneNumber(userData.phoneNumber || '');
                setAddress(userData.address || '');
                // Check if user has an associated agent
                if (userData.reAgent) {
                  const agentDoc = await getDoc(doc(firestore, 'reAgents', userData.reAgent));
                  if (agentDoc.exists()) {
                    setAgentName(agentDoc.data().name || '');
                  }
                }
                // Geocode address to set marker
                geocodeAddress(userData.address);
              } else {
                setErrorMessage('User data not found.');
              }
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

            setAddress(place.formatted_address ?? ''); // Add a fallback value
            geocodeAddress(place.formatted_address ?? '');
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps script:', error);
      }
    };

    initAutocomplete();
  }, []);

  const geocodeAddress = (address: string) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0].geometry.location) {
        const location = results[0].geometry.location;
        initializeMap(location.lat(), location.lng(), range);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

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
          setAddress((prev) => `${newLat}, ${newLng}`);
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
        // Agent or Homeowner specific update
        let profilePictureUrlToUpdate = profilePictureUrl;

        // Upload new profile picture if provided
        if (newProfilePicture) {
          const profilePictureRef = storageRef(storage, `profilePictures/${currentUser.uid}`);
          await uploadBytes(profilePictureRef, newProfilePicture);
          profilePictureUrlToUpdate = await getDownloadURL(profilePictureRef);
        }

        if (isAgent) {
          // Update user document in "reAgents" collection
          const userDocRef = doc(firestore, "reAgents", currentUser.uid);
          await updateDoc(userDocRef, {
            name,
            phoneNumber,
            profilePictureUrl: profilePictureUrlToUpdate,
          });
        } else {
          // Homeowner update
          const userQuery = query(collection(firestore, "users"), where("email", "==", currentUser.email));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDocRef = userSnapshot.docs[0].ref;
            await updateDoc(userDocRef, {
              name,
              phoneNumber,
              address,
            });

            // Handle Real Estate Agent update
            if (newAgentName) {
              const agentQuery = query(collection(firestore, "reAgents"), where("name", "==", newAgentName));
              const agentSnapshot = await getDocs(agentQuery);

              if (!agentSnapshot.empty) {
                const agentDoc = agentSnapshot.docs[0];
                await updateDoc(userDocRef, {
                  reAgent: agentDoc.id
                });
                setAgentName(agentDoc.data().name || '');
                setAgentError('');
              } else {
                setAgentError('Agent not found');
              }
            }
          } else {
            setErrorMessage('User data not found.');
          }
        }
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
    return <FallbacksLoading />;
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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

            {address && (
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
                ) : isAgent ? (
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
                        accept="image/png, image/jpeg"
                        onChange={handleProfilePictureChange}
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
                      <label htmlFor="address" className="block text-md font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        id="address"
                        ref={addressInputRef}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your address"
                        required
                        className="p-2 border rounded w-full"
                      />
                    </div>
        
                    <div>
                      <label htmlFor="realEstateAgent" className="block text-md font-medium text-gray-700">Real Estate Agent (optional)</label>
                      <input
                        type="text"
                        id="realEstateAgent"
                        value={agentName ? agentName : newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        placeholder="Enter agent's name"
                        className="p-2 border rounded w-full"
                      />
                      {agentError && <p className="text-red-600">{agentError}</p>}
                    </div>

                  </>
                )}
        
                <button
                  type="submit"
                  className={`button-green ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
              </form>
            </div>
          );
        }
        