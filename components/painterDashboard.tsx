import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Job, PaintPreferences } from '../types/types'; // Ensure this path is correct
import AcceptedQuotesButton from './acceptedQuotesButton';
import CompletedQuotesButton from './completedQuotesButton';

const PainterDashboard = () => {
    const [painterZipCodes, setPainterZipCodes] = useState<string[]>([]);
    const [jobList, setJobList] = useState<Job[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [price, setPrice] = useState('');
    const firestore = getFirestore();
    const storage = getStorage(); // Initialize Firebase Storage
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
                const jobs: Job[] = await Promise.all(jobsSnapshot.docs.map(async (jobDoc) => {
                    const jobData = jobDoc.data() as Job;
                    if (jobData.paintPreferencesId) {
                        const paintPrefDocRef = doc(firestore, "paintPreferences", jobData.paintPreferencesId);
                        const paintPrefDocSnap = await getDoc(paintPrefDocRef);
                        if (paintPrefDocSnap.exists()) {
                            jobData.paintPreferences = paintPrefDocSnap.data() as PaintPreferences;
                        }
                    }
                    return { ...jobData, jobId: jobDoc.id };
                }));
                const unquotedJobs = jobs.filter(job => 
                    !job.prices.some(price => price.painterId === user.uid)
                );
                setJobList(unquotedJobs);
            }
        } else {
            console.log('No user found, unable to fetch painter data.');
        }
    };

    useEffect(() => {
        fetchPainterData();
    }, [user, firestore]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPrice(value.replace(/[^0-9.]/g, '')); // This regex allows only numbers and decimal point
    };

    const handlePriceSubmit = async (e: React.FormEvent<HTMLFormElement>, jobId: string, amount: number): Promise<void> => {
        e.preventDefault();
        if (!user || price === '') return; // Ensure user exists and price is not empty

        // Convert price back to a number before submitting
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            alert('Please enter a valid price');
            return;
        }
    
        let invoiceUrl = ''; // Initialize invoiceUrl as an empty string
    
        // Only attempt to upload file and get URL if a file is selected
        if (selectedFile) {
            const invoicePath = `invoices/${user.uid}/${selectedFile.name}-${Date.now()}`; // Adding timestamp to make filename unique
            const storageRef = ref(storage, invoicePath);
    
            try {
                const fileSnapshot = await uploadBytes(storageRef, selectedFile);
                invoiceUrl = await getDownloadURL(fileSnapshot.ref); // Get URL only if file upload succeeds
            } catch (error) {
                console.error('Error uploading invoice: ', error);
            }
        }
    
        // Proceed to update the job with the new price (and invoiceUrl if available)
        const newPrice = {
            painterId: user.uid,
            amount: amount,
            timestamp: Date.now(),
            ...(invoiceUrl && { invoiceUrl }) // Spread invoiceUrl into the object if it exists
        };
    
        const jobRef = doc(firestore, "userImages", jobId);
        try {
            await updateDoc(jobRef, {
                prices: arrayUnion(newPrice)
            });
            console.log(`Price${invoiceUrl ? ' and invoice' : ''} for job ${jobId} updated successfully`);
            // Optionally reset form state here
            setSelectedFile(null);
            setPrice('');// Reset price state, consider setting to initial state value
            fetchPainterData(); // Refresh data
        } catch (updateError) {
            console.error('Error updating price: ', updateError);
        }
    };
    
    return (
        <div className='flex flex-col items-center mt-12'>
            <div className='flex flex-row gap-10 items-center'>
                <CompletedQuotesButton text='View Completed Quotes'/>
                <AcceptedQuotesButton text='View Accepted Quotes'/>
            </div>
            <h1 className="text-4xl font-bold underline mb-8 mt-14">Available Quotes</h1>
            {jobList.length > 0 ? (
                jobList.map(job => (
                    <div key={job.jobId} className="flex flex-row justify-center items-start mb-10 w-full max-w-4xl">
                        <div className="flex flex-col justify-center items-center mr-8">
                            <video src={job.video} controls style={{ width: '400px' }}  />
                            <form onSubmit={(e) => handlePriceSubmit(e, job.jobId, parseFloat(price))} className="mt-4 pl-32">
                                <input
                                    type="text"
                                    name="price"
                                    placeholder="Price"
                                    className="mr-2 p-2 border rounded"
                                    value={price}
                                    onChange={handlePriceChange}
                                />
                                <input type="file" onChange={handleFileChange} accept="application/pdf" />
                                <button type="submit" className="button-color hover:bg-green-900 text-white font-bold py-1 px-4 mt-2 rounded">Submit Quote</button>
                            </form>
                        </div>
                        <div className="details-box space-y-2">
                            <p className="text-lg">Zip Code: <span className="font-semibold">{job.zipCode}</span></p>
                            <div className="space-y-1">
                                <p className="text-lg">Paint Preferences:</p>
                                <ul className="list-disc pl-5">
                                    <li>Ceilings: <span className="font-semibold">{job.paintPreferences?.ceilings ? "Yes" : "No"}</span></li>
                                    <li>Ceiling Color: <span className="font-semibold">{job.paintPreferences?.ceilingColor || "N/A"}</span></li>
                                    <li>Ceiling Finish: <span className="font-semibold">{job.paintPreferences?.ceilingFinish || "N/A"}</span></li>
                                    <li>Trim: <span className="font-semibold">{job.paintPreferences?.trim ? "Yes" : "No"}</span></li>
                                    <li>Trim Color: <span className="font-semibold">{job.paintPreferences?.trimColor || "N/A"}</span></li>
                                    <li>Trim Finish: <span className="font-semibold">{job.paintPreferences?.trimFinish || "N/A"}</span></li>
                                    <li>Wall Color: <span className="font-semibold">{job.paintPreferences?.color}</span></li>
                                    <li>Wall Finish: <span className="font-semibold">{job.paintPreferences?.finish}</span></li>
                                    <li>Move Furniture: <span className="font-semibold">{job.moveFurniture ? "Yes" : "No"}</span></li>
                                </ul>
                            </div>
                            <p className="text-lg">Special Requests: <span className="font-semibold">{job.specialRequests}</span></p>
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
