import { useState, ChangeEvent, FormEvent } from 'react';
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { toast } from 'react-toastify';

export const useDashboardPainterJobForm = (id: string) => {
  const { onFetchPainterData } = useDashboardPainter();
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [price, setPrice] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const firestore = getFirestore();
  const storage = getStorage(); // Initialize Firebase Storage
  const auth = getAuth();
  const user = auth.currentUser;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
  };

  const handlePriceChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setPrice(value.replace(/[^0-9.]/g, '')); // This regex allows only numbers and decimal point
  };

  const handleQuoteSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    const jobId = id;
    console.log(event, jobId, user, price);
    try {
      event.preventDefault();
      setSubmitting(true); // Set loading state to true

      if (!user || price === '') {
        setSubmitting(false); // Reset loading state
        return; // Ensure user exists and price is not empty
      }

      // Convert price back to a number before submitting
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) {
        toast.error('Please enter a valid price');
        setSubmitting(false); // Reset loading state
        return;
      }

      let invoiceUrl = ''; // Initialize invoiceUrl as an empty string

      // Only attempt to upload file and get URL if a file is selected
      if (selectedFile) {
        const invoicePath = `invoices/${user.uid}/${
          selectedFile.name
        }-${Date.now()}`; // Adding timestamp to make filename unique
        const storageRef = ref(storage, invoicePath);

        try {
          const fileSnapshot = await uploadBytes(
            storageRef,
            selectedFile
          );
          invoiceUrl = await getDownloadURL(
            fileSnapshot.ref
          ); // Get URL only if file upload succeeds
        } catch (error) {
          console.error('Error uploading invoice: ', error);
        }
      }

      // Proceed to update the job with the new price (and invoiceUrl if available)
      const newPrice = {
        painterId: user.uid,
        amount: numericPrice,
        timestamp: Date.now(),
        ...(invoiceUrl && { invoiceUrl }), // Spread invoiceUrl into the object if it exists
      };

      const jobRef = doc(firestore, 'userImages', jobId);
      await updateDoc(jobRef, {
        prices: arrayUnion(newPrice),
      });
      console.log(
        `Price${
          invoiceUrl ? ' and invoice' : ''
        } for job ${jobId} updated successfully`
      );
      // Optionally reset form state here
      setSelectedFile(null);
      setPrice(''); // Reset price state, consider setting to initial
      // Reset price state, consider setting to initial value
      onFetchPainterData(); // Refresh data
    } catch (updateError) {
      console.error('Error updating price: ', updateError);
    } finally {
      setSubmitting(false); // Reset loading state
    }
  };

  return {
    price,
    isSubmitting,
    user,
    selectedFile,
    onFileChange: handleFileChange,
    onPriceChange: handlePriceChange,
    onQuoteSubmit: handleQuoteSubmit,
  };
};
