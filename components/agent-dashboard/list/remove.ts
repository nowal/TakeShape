import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAgentDashboard } from '@/context/agent/dashboard/provider';

export const useAgentDashboardRemove = () => {
  const dashboard = useAgentDashboard();

  const {
    preferredPainters,
    dispatchError,
    dispatchPreferredPainters,
  } = dashboard;
  const auth = getAuth();
  const firestore = getFirestore();

  const [removingUser, setRemoving] = useState<
    string | null
  >(null);
  const handleRemovePainter = async (
    phoneNumber: string
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('No current user found.');
      return;
    }

    try {
      setRemoving(phoneNumber);

      const agentDocRef = doc(
        firestore,
        'reAgents',
        currentUser.uid
      );
      const agentDoc = await getDoc(agentDocRef);

      if (agentDoc.exists()) {
        const agentData = agentDoc.data();
        const updatedPreferredPainters =
          agentData.preferredPainters.filter(
            (p: string) => p !== phoneNumber
          );

        await updateDoc(agentDocRef, {
          preferredPainters: updatedPreferredPainters,
        });

        dispatchPreferredPainters(
          preferredPainters.filter(
            (painter) => painter.phoneNumber !== phoneNumber
          )
        );
      }
    } catch (error) {
      const errorMessage =
        'Error removing painter. Please try again later.';

      console.error('Error removing painter:', error);
      dispatchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRemoving(null);
    }
  };
  return {
    removingUser,
    onRemovePainter: handleRemovePainter,
  };
};
