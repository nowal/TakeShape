'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Job } from '../../types/types'; // Adjust the import path as needed
import CompletedQuotesButton from '../../components/completedQuotesButton';
import DashboardButton from '../../components/dashboardButton';
import AvilableQuotesButton from '@/components/availableQuotesButton';


const AcceptedQuotes = () => {
    const [painterZipCodes, setPainterZipCodes] = useState<string[]>([]);
    const [jobList, setJobList] = useState<Job[]>([]);
    const [authLoading, setAuthLoading] = useState(true);
    const firestore = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in, set any state or perform actions as needed
          } else {
            // User is signed out, set any state or perform actions as needed
          }
          setAuthLoading(false); // Authentication state is confirmed, loading is done
        });
      
        // Cleanup the listener on unmount
        return () => unsubscribe();
      }, []);

      const fetchPainterData = async () => {
        if (user) {
          const painterQuery = query(collection(firestore, "painters"), where("userId", "==", user.uid));
          const painterSnapshot = await getDocs(painterQuery);
      
          if (!painterSnapshot.empty) {
            const painterData = painterSnapshot.docs[0].data();
      
            if (painterData.acceptedQuotes && painterData.acceptedQuotes.length > 0) {
              const acceptedJobs = [];
      
              for (const acceptedQuoteId of painterData.acceptedQuotes) {
                // Check if acceptedQuoteId is valid
                if (acceptedQuoteId) {
                  try {
                    const jobRef = doc(firestore, "userImages", acceptedQuoteId);
                    const jobSnapshot = await getDoc(jobRef);
      
                    if (jobSnapshot.exists()) {
                      const jobData = jobSnapshot.data() as Job;
                      acceptedJobs.push({ ...jobData, jobId: jobSnapshot.id });
                    }
                  } catch (error) {
                    console.error("Error fetching job data:", error);
                  }
                }
              }
      
              setJobList(acceptedJobs);
            }
          }
        }
      };
      

    useEffect(() => {
        fetchPainterData();
    }, [user, firestore]);

    if (authLoading) {
        return <div className="loading text-center text-lg mt-20">Retrieving Information...</div>;
    }

    const handlePriceSubmit = async (jobId: string, amount: number) => {
        if (!user) {
          console.error("No user logged in");
          return;
        }
      
        const jobRef = doc(firestore, "userImages", jobId);
        const newPrice = { painterId: user.uid, amount: amount, timestamp: Date.now() };
        
        try {
          await updateDoc(jobRef, {
            prices: arrayUnion(newPrice)
          });
          console.log(`Price for job ${jobId} updated to ${amount}`);
          await fetchPainterData();  // Re-fetch the painter data to update the job list
        } catch (error) {
          console.error('Error updating price: ', error);
        }
    };
      

    return (
        <div className='flex flex-col items-center mt-12'>
            <div className='flex flex-row gap-10 items-center'>
            <AvilableQuotesButton text='View Available Quotes'/>
            <CompletedQuotesButton text='View Completed Quotes'/>
            </div>
            <h1 className="text-4xl font-bold underline mb-8 mt-14">Accepted Quotes</h1>
            {jobList.length > 0 ? (
                jobList.map(job => (
                    <div key={job.jobId} className="flex flex-row justify-center items-start gap-10 mb-10 w-full max-w-4xl">
                        <div className="flex flex-col justify-center items-center mr-8">
                            <video src={job.video} controls style={{ width: '400px' }}  />
                            <p className="text-lg font-bold">Your Quoted Price: 
                            <span className="text-xl mr-8">
                                ${job.prices.find(price => price.painterId === user?.uid)?.amount.toFixed(2)}
                            </span>
                            {/* Check for invoiceUrl and display it */}
                            {job.prices.find(price => price.painterId === user?.uid)?.invoiceUrl && (
                                <a href={job.prices.find(price => price.painterId === user?.uid)?.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Invoice
                                </a>
                            )}
                            </p>
                        </div>
                        <div className="details-box space-y-2">
                            <p className="text-lg">Zip Code: <span className="font-semibold">{job.zipCode}</span></p>
                            <div className="space-y-1">
                                <p className="text-lg">Paint Preferences:</p>
                                <ul className="list-disc pl-5">
                                    <li>Walls: {job.paintPreferences.walls ? "Yes" : "No"}</li>
                                    <li>Ceilings: {job.paintPreferences.ceilings ? "Yes" : "No"}</li>
                                    <li>Trim: {job.paintPreferences.trim ? "Yes" : "No"}</li>
                                </ul>
                            </div>
                            <p className="text-lg">Providing Own Paint: <span className="font-semibold">{job.providingOwnPaint}</span></p>
                            <p className="text-lg">Description: <span className="font-semibold">{job.description}</span></p>
                            <p className="text-xl font-bold">Homeowner's Phone Number: <span className="font-bold">{job.phoneNumber}</span></p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center my-10">
                    <h2 className="text-2xl font-medium">No Accepted Quotes at this time</h2>
                </div>
            )}
        </div>
    );
};

export default AcceptedQuotes;
