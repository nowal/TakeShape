'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { checkingAuthAtom } from '../../atom/atom';
import { getFirestore, doc, updateDoc, arrayUnion, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AgentDashboard: React.FC = () => {
    const [addresses, setAddresses] = useState<string[]>([]);
    const [newAddress, setNewAddress] = useState<string>('');
    const firestore = getFirestore();
    const auth = getAuth();
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useAtom(checkingAuthAtom);
  
    useEffect(() => {
      onAuthStateChanged(auth, user => {
        if (user) {
          fetchAddresses(user.uid);
        } else {
          setCheckingAuth(false);
          router.push('/login'); // Adjust this as needed if /login does not exist
        }
      });
    }, [auth, firestore, router, checkingAuth]);
  
    const fetchAddresses = async (userId: string) => {
      const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", userId));
      const querySnapshot = await getDocs(userImagesQuery);
      if (!querySnapshot.empty) {
        const userImageDoc = querySnapshot.docs[0].data();
        setAddresses(userImageDoc.addresses || []);
      }
      setCheckingAuth(false);
    };
  
    const handleAddAddress = async () => {
      if (auth.currentUser) {
        const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(userImagesQuery);
        if (!querySnapshot.empty) {
          const userImageDocRef = querySnapshot.docs[0].ref;
          await updateDoc(userImageDocRef, {
            addresses: arrayUnion(newAddress)
          });
          setAddresses(prev => [...prev, newAddress]);
          setNewAddress('');
        }
      } else {
        console.log("User is not authenticated.");
      }
    };
  
    if (checkingAuth) {
      return <div>Loading...</div>; // Show a loading indicator while authentication is being checked
    }
  
    return (
      <div className="agent-dashboard">
        <h1>Agent Dashboard</h1>
        <div className="address-list">
          {addresses.length > 0 ? (
            <ul>
              {addresses.map((address, index) => (
                <li key={index}>{address}</li>
              ))}
            </ul>
          ) : (
            <p>No addresses found. Add a new one.</p>
          )}
        </div>
        <div className="add-address-form">
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter new address"
          />
          <button onClick={handleAddAddress}>Add Address</button>
        </div>
      </div>
    );
  };
  
  export default AgentDashboard;