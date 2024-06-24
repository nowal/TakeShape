'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, getDoc, getDocs, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { Job, PaintPreferences } from '../../types/types'; // Adjust the import path as needed

const CompletedQuotes = () => {
    const [jobList, setJobList] = useState<Job[]>([]);
    const [authLoading, setAuthLoading] = useState(true);
    const firestore = getFirestore();
    const auth = getAuth();
    const storage = getStorage();
    const router = useRouter();
    const user = auth.currentUser;
    const [selectedPage, setSelectedPage] = useState('Completed Quotes');

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
            const painterQuery = query(collection(firestore, "painters"), where("userId", "==", user.uid));
            const painterSnapshot = await getDocs(painterQuery);

            if (!painterSnapshot.empty) {
                const painterData = painterSnapshot.docs[0].data();

                const jobsQuery = query(collection(firestore, "userImages"), where("zipCode", "in", painterData.zipCodes));
                const jobsSnapshot = await getDocs(jobsQuery);
                const jobs: Job[] = await Promise.all(
                    jobsSnapshot.docs.map(async (jobDoc) => {
                        const jobData = jobDoc.data() as Job;

                        // Fetch paint preferences
                        if (jobData.paintPreferencesId) {
                            const paintPrefDocRef = doc(firestore, "paintPreferences", jobData.paintPreferencesId);
                            const paintPrefDocSnap = await getDoc(paintPrefDocRef);
                            if (paintPrefDocSnap.exists()) {
                                jobData.paintPreferences = paintPrefDocSnap.data() as PaintPreferences;
                            }
                        }

                        // Fetch user information if userId is defined
                        if (jobData.userId) {
                            const userDocRef = doc(firestore, "users", jobData.userId);
                            const userDocSnap = await getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                jobData.customerName = userData.name;
                                jobData.phoneNumber = jobData.phoneNumber || userData.phoneNumber;
                                jobData.address = jobData.address || userData.address;
                            }
                        }

                        // Ensure the video URL is correct
                        const videoUrl = await getVideoUrl(jobData.video);
                        return { ...jobData, video: videoUrl, jobId: jobDoc.id };
                    })
                );
                setJobList(jobs);
            }
        }
    };

    const getVideoUrl = async (path: string): Promise<string> => {
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

    const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setSelectedPage(selected);
        if (selected === 'Available Quotes') {
            router.push('/dashboard');
        } else if (selected === 'Accepted Quotes') {
            router.push('/acceptedQuotes');
        } else if (selected === 'Completed Quotes') {
            router.push('/completedQuotes');
        }
    };

    if (authLoading) {
        return <div className="loading text-center text-lg mt-20">Retrieving Information...</div>;
    }

    return (
        <div className='flex flex-col items-center px-4 md:px-8 mt-8'>
            <select 
                className="text-xl font-medium mb-4 p-2 underline"
                value={selectedPage} 
                onChange={handlePageChange}
                style={{ fontSize: selectedPage === 'Completed Quotes' ? '2rem' : '1rem', fontWeight: selectedPage === 'Completed Quotes' ? 'bold' : 'normal' }}
            >
                <option value="Available Quotes">Available Quotes</option>
                <option value="Accepted Quotes">Accepted Quotes</option>
                <option value="Completed Quotes">Completed Quotes</option>
            </select>
            {jobList.length > 0 ? (
                jobList.map(job => (
                    <div key={job.jobId} className="flex flex-col md:flex-row justify-center items-start mb-10 w-full max-w-4xl p-4 md:p-8 rounded">
                        <div className="flex flex-col justify-center items-center lg:mr-8 mb-4 lg:mb-0 w-full lg:w-auto">
                            <video src={job.video} autoPlay controls playsInline muted={true} className="w-full lg:w-96" />
                            
                            <p className="text-lg font-bold mt-4">Your Quoted Price: 
                                <span className="text-xl">
                                    ${job.prices.find(price => price.painterId === user?.uid)?.amount.toFixed(2)}
                                </span>
                                {job.prices.find(price => price.painterId === user?.uid)?.invoiceUrl && (
                                    <a href={job.prices.find(price => price.painterId === user?.uid)?.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">
                                        Invoice
                                    </a>
                                )}
                            </p>
                            <h1 className="text-lg mt-2">Customer Details:</h1>
                            <ul className="list-disc pl-5">
                                <li>Name: <span className="font-semibold">{job.customerName || "N/A"}</span></li>
                                <li>Phone Number: <span className="font-semibold">{job.phoneNumber || "N/A"}</span></li>
                                <li>Address: <span className="font-semibold">{job.address || "N/A"}</span></li>
                            </ul>
                        </div>
                        <div className="details-box space-y-2 w-full lg:w-auto">
                            <p className="text-lg">Zip Code: <span className="font-semibold">{job.zipCode}</span></p>
                            <div className="space-y-1">
                                <p className="text-lg">Paint Preferences:</p>
                                <ul className="list-disc pl-5">
                                    <li className="font-semibold">{job.paintPreferences?.laborAndMaterial ? "Labor and Material" : "Labor Only"}</li>
                                    <li>Wall Color: <span className="font-semibold">{job.paintPreferences?.color || "N/A"}</span></li>
                                    <li>Wall Finish: <span className="font-semibold">{job.paintPreferences?.finish || "N/A"}</span></li>
                                    <li>Paint Quality: <span className="font-semibold">{job.paintPreferences?.paintQuality || "N/A"}</span></li>
                                    <li>Ceilings: <span className="font-semibold">{job.paintPreferences?.ceilings ? "Yes" : "No"}</span></li>
                                    <li>Ceiling Color: <span className="font-semibold">{job.paintPreferences?.ceilingColor || "N/A"}</span></li>
                                    <li>Ceiling Finish: <span className="font-semibold">{job.paintPreferences?.ceilingFinish || "N/A"}</span></li>
                                    <li>Trim and Doors: <span className="font-semibold">{job.paintPreferences?.trim ? "Yes" : "No"}</span></li>
                                    <li>Trim and Door Color: <span className="font-semibold">{job.paintPreferences?.trimColor || "N/A"}</span></li>
                                    <li>Trim and Door Finish: <span className="font-semibold">{job.paintPreferences?.trimFinish || "N/A"}</span></li>
                                    <li>Move Furniture: <span className="font-semibold">{job.moveFurniture ? "Yes" : "No"}</span></li>
                                </ul>
                            </div>
                            <p className="text-lg">Special Requests: <span className="font-semibold">{job.specialRequests || "N/A"}</span></p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center my-10">
                    <h2 className="text-2xl font-medium">No Completed Quotes at this time</h2>
                </div>
            )}
        </div>
    );
};

export default CompletedQuotes;


