'use client';

import { notifyError } from '@/utils/notifications';
import {errorAuth} from "@/utils/error/auth"
import {
  useState,
  useEffect,
  useRef,
  FormEvent,
} from 'react';
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
import firebase from '@/lib/firebase';
import { useAtom } from 'jotai';
import { painterInfoAtom, isPainterAtom } from '@/atom';
import { useAutoFillAddress } from '@/hooks/auto-fill/address';

type TConfig = any;
export const usePainterRegisterState = (
  config?: TConfig
) => {
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
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string|null>(null);
  const [isPainter, setPainter] = useAtom(isPainterAtom);
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

  useAutoFillAddress({
    dispatchAddress: setAddress,
    addressInputRef,
  });

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
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
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
      setPainter(true); // Set the user as a painter

      router.push('/dashboard');
    } catch (error) {
      console.error('Error registering painter: ', error);
      const errorMessage: null | string = errorAuth(error);
      notifyError(errorMessage);
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false); // Reset loading state
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
      const errorMessage = 'Error uploading logo';
      notifyError(errorMessage);
      console.error('Error uploading logo: ', error);
    }
  };

  const handleLogoChange = (file: File) => {
    setLogo(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return {
    isLoading,
    lng,
    lat,
    businessName,
    errorMessage,
    email,
    logoPreview,
    painterInfo,
    phoneNumber,
    password,
    dispatchPassword: setPassword,
    dispatchEmail: setEmail,
    dipatchPhoneNumber: setPhoneNumber,
    dispatchBusinessName: setBusinessName,
    onLogoChange: handleLogoChange,
    onSubmit: handleSubmit,
  };
};
