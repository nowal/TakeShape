import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Job } from '../types/types'; // Ensure this path is correct
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
        console.log('Current user:', user); // Log the current user for debugging
        if (user) {
            const painterQuery = query(collection(firestore, "painters"), where("userId", "==", user.uid));
            const painterSnapshot = await getDocs(painterQuery);
            console.log('Painter data:', painterSnapshot.docs.map(doc => doc.data())); // Log fetched painter data
            if (!painterSnapshot.empty) {
                const painterData = painterSnapshot.docs[0].data();
                console.log('Painter zip codes:', painterData.zipCodes); // Log painter zip codes
                setPainterZipCodes(painterData.zipCodes);
    
                const jobsQuery = query(collection(firestore, "userImages"), where("zipCode", "in", painterData.zipCodes));
                const jobsSnapshot = await getDocs(jobsQuery);
                console.log('Jobs:', jobsSnapshot.docs.map(doc => doc.data())); // Log fetched jobs
                const jobs: Job[] = jobsSnapshot.docs.map(doc => ({
                    ...doc.data() as Job,
                    jobId: doc.id
                }));
                const unquotedJobs = jobs.filter(job => 
                    !job.prices.some(price => price.painterId === user.uid)
                );
                console.log('Unquoted Jobs:', unquotedJobs); // Log unquoted jobs
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
        // Optional: Add validation here if you want to ensure only numeric input
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
                // Optionally handle the error, e.g., showing an error message to the user
                // If invoice upload fails, you might decide to proceed with updating the price or handle it differently
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
            // Optionally handle this error as well
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
                    // Use TailwindCSS responsive width classes here
                    <div key={job.jobId} className="flex flex-row justify-center items-start mb-10 w-full max-w-4xl">
                        <div className="flex flex-col justify-center items-center mr-8">
                            <video src={job.video} controls style={{ width: '400px' }}  />
                            <form onSubmit={(e) => handlePriceSubmit(e, job.jobId, parseFloat(price))} className="mt-4 pl-32">
                                <input
                                    type="text" // Change to text type
                                    name="price"
                                    placeholder="Price" // Set placeholder
                                    className="mr-2 p-2 border rounded"
                                    value={price}
                                    onChange={handlePriceChange} // Use the new handler
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
