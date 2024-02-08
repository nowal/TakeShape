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
    const [price, setPrice] = useState(Number);
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
                const jobs: Job[] = jobsSnapshot.docs.map(doc => ({
                    ...doc.data() as Job,
                    jobId: doc.id
                }));
                const unquotedJobs = jobs.filter(job => 
                    !job.prices.some(price => price.painterId === user.uid)
                );
                setJobList(unquotedJobs);
            }
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

    const handlePriceSubmit = async (e: React.FormEvent<HTMLFormElement>, jobId: string, amount: number): Promise<void> => {
        e.preventDefault();
        if (!user || !selectedFile) return;

        const invoicePath = `invoices/${user.uid}/${selectedFile.name}`;
        const storageRef = ref(storage, invoicePath);

        try {
            const fileSnapshot = await uploadBytes(storageRef, selectedFile);
            const invoiceUrl = await getDownloadURL(fileSnapshot.ref);
            const newPrice = {
                painterId: user.uid,
                amount: amount,
                timestamp: Date.now(),
                invoiceUrl // Add the invoice URL to the price object
            };

            const jobRef = doc(firestore, "userImages", jobId);
            await updateDoc(jobRef, {
                prices: arrayUnion(newPrice)
            });
            console.log(`Price and invoice for job ${jobId} updated successfully`);

            // Optionally reset form state here
            setSelectedFile(null);
            fetchPainterData(); // Refresh data
        } catch (error) {
            console.error('Error uploading file or updating price: ', error);
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
                    // Use TailwindCSS responsive width classes here
                    <div key={job.jobId} className="flex flex-row justify-center items-start gap-10 mb-10 w-full max-w-4xl">
                        <div className="flex flex-col justify-center items-center mr-8">
                            <video src={job.video} controls style={{ width: '400px' }}  />
                            <form onSubmit={(e) => {
                                e.preventDefault(); // Prevent the default form submission
                                handlePriceSubmit(e, job.jobId, price); // Call your submit handler with jobId
                            }} className="mt-4">
                                <input type="number" name="price" placeholder="Enter quoted price" className="mr-2 p-2 border rounded" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                                <input type="file" onChange={handleFileChange} accept="application/pdf" />
                                <button type="submit" className="button-color hover:bg-green-900 text-white font-bold py-1 px-4 rounded">Submit Price and Invoice</button>
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
