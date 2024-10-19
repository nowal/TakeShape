import { TJob } from '@/types/jobs';
import {
  doc,
  getDoc,
  getFirestore,
} from 'firebase/firestore';

export const fetchUser = async (jobData: TJob) => {
  const firestore = getFirestore();
  if (!jobData.userId) return jobData;
  const userDocRef = doc(
    firestore,
    'users',
    jobData.userId
  );
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    jobData.customerName = userData.name;
    jobData.phoneNumber =
      jobData.phoneNumber || userData.phoneNumber;
    jobData.address = jobData.address || userData.address;
  }

  return jobData;
};
