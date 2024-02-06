import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Job } from '../types/types'; // Adjust the import path as needed
import AcceptedQuotesButton from './acceptedQuotesButton';
import CompletedQuotesButton from './completedQuotesButton';


const PainterDashboard = () => {
    const [painterZipCodes, setPainterZipCodes] = useState<string[]>([]);
    const [jobList, setJobList] = useState<Job[]>([]);
    const firestore = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    const fetchPainterData = async () => {
        if (user) {
            const painterQuery = query(collection(firestore, "painters"), where("userId", "==", user.uid));
            const painterSnapshot = await getDocs(painterQuery);
            if (!painterSnapshot.empty) {
                const painterData = painterSnapshot.docs[0].data();
                setPainterZipCodes(painterData.zipCodes);

                const jobsQuery = query(collection(firestore, "userImages"), where("zipCode", "in", painterData.zipCodes));
                const jobsSnapshot = await getDocs(jobsQuery);
                const jobs: Job[] = jobsSnapshot.docs.map(doc => ({
                    ...doc.data() as Job,
                    jobId: doc.id
                }));
                const unquotedJobs = jobs.filter(job => 
                    !job.prices.some(price => price.painterId === user.uid) && !job.acceptedQuote
                );
                setJobList(unquotedJobs);
            }
        }
    };

    useEffect(() => {
        fetchPainterData();
    }, [user, firestore]);

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
        <div className='flex flex-col items-center'>
            <div className='flex flex-row gap-10 items-center'>
            <CompletedQuotesButton text='View Completed Quotes'/>
            <AcceptedQuotesButton text='View Accepted Quotes'/>
            </div>
          <h1 className="text-4xl font-bold underline mb-8 mt-14">Available Quotes</h1>
          {jobList.length > 0 ? (
            jobList.map(job => (
              <div key={job.jobId} className="flex flex-row justify-center items-start gap-10 mb-10">
                <div className="flex flex-col justify-center items-center mr-8">
                  <video src={job.video} controls style={{ width: '400px' }}  />
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const price = form.price.value;
                      handlePriceSubmit(job.jobId, Number(price));
                      form.reset();
                  }} className="mt-4">
                    <input type="number" name="price" placeholder="Enter quoted price" className="mr-2 p-2 border rounded" />
                    <button type="submit" className="button-color hover:bg-green-900 text-white font-bold py-1 px-4 rounded">Submit Price</button>
                  </form>
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
                </div>
              </div>
            ))
          ) : (
            <div className="text-center my-10">
              <h2 className="text-2xl font-medium">No Available Quotes at this time</h2>
            </div>
          )}
        </div>
    );
};

export default PainterDashboard;
