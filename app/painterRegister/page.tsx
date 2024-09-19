'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import firebase from '../../lib/firebase';
import { useAtom } from 'jotai';
import { painterInfoAtom, isPainterAtom } from '../../atom';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMapsScript'; // Adjust the import path as needed

export default function PainterRegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [range, setRange] = useState(10); // Default range in miles
  const [isInsured, setIsInsured] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<
    string | null
  >(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [painterInfo, setPainterInfo] =
    useAtom(painterInfoAtom);
  const storage = getStorage(firebase);
  const router = useRouter();
  const auth = getAuth(firebase);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(
    null
  );
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript(
          'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
        ); // Replace with your actual API key
        if (window.google) {
          const autocomplete =
            new window.google.maps.places.Autocomplete(
              addressInputRef.current!,
              {
                types: ['address'],
                componentRestrictions: { country: 'us' },
              }
            );

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (
              !place.geometry ||
              !place.geometry.location ||
              !place.address_components
            ) {
              console.error(
                'Error: place details are incomplete.'
              );
              return;
            }

            const formattedAddress =
              place.formatted_address;
            const location = place.geometry.location;

            setAddress(formattedAddress || '');
            setLat(location.lat());
            setLng(location.lng());
          });
        }
      } catch (error) {
        console.error(
          'Error loading Google Maps script:',
          error
        );
      }
    };

    initAutocomplete();
  }, []);

  useEffect(() => {
    if (lat && lng) {
      initializeMap(lat, lng, range);
    }
  }, [lat, lng, range]);

  const initializeMap = (
    lat: number,
    lng: number,
    range: number
  ) => {
    if (window.google && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      const center = new window.google.maps.LatLng(
        lat,
        lng
      );
      bounds.extend(center);
      bounds.extend(
        new window.google.maps.LatLng(lat + range / 69, lng)
      );
      bounds.extend(
        new window.google.maps.LatLng(lat - range / 69, lng)
      );
      bounds.extend(
        new window.google.maps.LatLng(lat, lng + range / 69)
      );
      bounds.extend(
        new window.google.maps.LatLng(lat, lng - range / 69)
      );

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          {
            center: { lat, lng },
            zoom: 10,
          }
        );
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
          fillOpacity: 0.35,
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
          const newLat = markerRef
            .current!.getPosition()!
            .lat();
          const newLng = markerRef
            .current!.getPosition()!
            .lng();
          setLat(newLat);
          setLng(newLng);
          initializeMap(newLat, newLng, range);
        });
      } else {
        markerRef.current.setPosition({ lat, lng });
      }

      mapInstanceRef.current.fitBounds(
        circleRef.current.getBounds()!
      );
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    setErrorMessage(''); // Reset error message

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      const user = userCredential.user;

      const logoUrl = logo
        ? await uploadLogoAndGetUrl(logo)
        : ''; // Handle logo upload if provided

      const painterData = {
        businessName,
        address,
        lat,
        lng,
        range,
        isInsured,
        logoUrl,
        phoneNumber,
        userId: user.uid, // Link the painter data to the user ID
      };

      const firestore = getFirestore();
      const painterDocRef = doc(
        collection(firestore, 'painters')
      );

      await setDoc(painterDocRef, painterData);
      console.log('Painter info saved:', painterData);
      setIsPainter(true); // Set the user as a painter

      router.push('/dashboard');
    } catch (error) {
      console.error('Error registering painter: ', error);
      const errorCode = (error as { code: string }).code;

      switch (errorCode) {
        case 'auth/email-already-in-use':
          setErrorMessage(
            'The email address is already in use by another account.'
          );
          break;
        case 'auth/weak-password':
          setErrorMessage('The password is too weak.');
          break;
        case 'auth/invalid-email':
          setErrorMessage(
            'The email address is not valid.'
          );
          break;
        case 'auth/operation-not-allowed':
          setErrorMessage(
            'Email/password accounts are not enabled.'
          );
          break;
        case 'auth/network-request-failed':
          setErrorMessage(
            'Network error. Please try again.'
          );
          break;
        default:
          setErrorMessage(
            'An unexpected error occurred. Please try again.'
          );
          break;
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const uploadLogoAndGetUrl = async (
    logoFile: File | null
  ) => {
    if (!logoFile) {
      return ''; // Return an empty string if no logo file is provided
    }

    const logoRef = storageRef(
      storage,
      `logos/${logoFile.name}-${Date.now()}`
    ); // Append timestamp to ensure unique file names

    try {
      const uploadResult = await uploadBytes(
        logoRef,
        logoFile
      );
      console.log('Upload result:', uploadResult);

      const logoUrl = await getDownloadURL(
        uploadResult.ref
      );
      console.log('Logo URL:', logoUrl);

      return logoUrl;
    } catch (error) {
      console.error('Error uploading logo: ', error);
      throw new Error('Error uploading logo.');
    }
  };

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  return (
    <div className="p-8">
      <h1 className="text-center text-2xl font-bold mb-6">
        Painter Registration
      </h1>

      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            {errorMessage}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4"
      >
        <div>
          <label
            htmlFor="businessName"
            className="block text-md font-medium text-gray-700"
          >
            Business or Personal Name
          </label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) =>
              setBusinessName(e.target.value)
            }
            placeholder="Enter your business or personal name"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-md font-medium text-gray-700"
          >
            Address
          </label>
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
          <label
            htmlFor="range"
            className="block text-md font-medium text-gray-700"
          >
            Range (miles)
          </label>
          <select
            id="range"
            value={range}
            onChange={(e) =>
              setRange(Number(e.target.value))
            }
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

        {lat !== 0 && lng !== 0 && (
          <>
            <div className="text-left text-gray-700 mb-2">
              Drag Marker to adjust service location
            </div>
            <div
              ref={mapRef}
              style={{ height: '400px', marginTop: '20px' }}
            ></div>
          </>
        )}

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-md font-medium text-gray-700"
          >
            Phone Number
          </label>
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

        {/* Removed per latest spec */}
        {/* <div className="flex items-center">
        <input
          type="checkbox"
          id="isInsured"
          checked={isInsured}
          onChange={(e) => setIsInsured(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="isInsured" className="text-md font-medium text-gray-700">Are you insured?</label>
      </div> */}

        <div>
          <label
            htmlFor="logo"
            className="block text-md font-medium text-gray-700"
          >
            Company Logo (optional)
          </label>
          {logoPreview && (
            <Image
              src={logoPreview}
              alt="Company Logo Preview"
              className="mb-2 w-24 h-24 object-cover rounded-full"
              width="96"
              height="96"
            />
          )}
          <input
            type="file"
            id="logo"
            onChange={handleLogoChange}
            accept="image/png, image/jpeg, application/pdf" // Restrict file types
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-md font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-md font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <button
          type="submit"
          className={`button-green ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
