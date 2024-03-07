import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { timestampPairsAtom } from '../atom/atom';
import { updateDoc, DocumentReference, getDoc } from 'firebase/firestore';

interface TimestampPair {
  startTime: number;
  color: string;
  finish: string;
  dontPaintCeilings?: boolean;
  dontPaintTrimAndDoors?: boolean;
  dontPaintAtAll?: boolean;
}

interface RoomCardProps {
    startTime: number;
    endTime?: number;
    userImageRef: DocumentReference;
    defaultColor?: string;
    defaultFinish?: string;
    defaultCeilings?: boolean;
    defaultTrim?: boolean;
    onDelete: (startTime: number) => void;
  }

const RoomCard: React.FC<RoomCardProps> = ({
    startTime,
    endTime,
    userImageRef,
    defaultColor = '', 
    defaultFinish = '',
    defaultCeilings = true,
    defaultTrim = true,
    onDelete,
}) => {
    const [color, setColor] = useState(defaultColor);
    const [finish, setFinish] = useState(defaultFinish);
    const [dontPaintCeilings, setDontPaintCeilings] = useState(!defaultCeilings);
    const [dontPaintTrimAndDoors, setDontPaintTrimAndDoors] = useState(!defaultTrim);
    const [dontPaintAtAll, setDontPaintAtAll] = useState(false);

    const [timestampPairs, setTimestampPairs] = useAtom(timestampPairsAtom);

    const updateTimestampPairs = async () => {
        try {
          const docSnap = await getDoc(userImageRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            let timestampPairs: TimestampPair[] = data.timestampPairs || [];
      
            // Remove any existing entry with the same startTime
            timestampPairs = timestampPairs.filter(pair => pair.startTime !== startTime);
      
            // Now, add the new or updated entry with all the correct values
            const newPair: TimestampPair = {
                startTime, 
                color, 
                finish,
                dontPaintCeilings, // This should be included
                dontPaintTrimAndDoors, // This should be included
                dontPaintAtAll
            };
            timestampPairs.push(newPair);
      
            // Update the document with the modified timestampPairs array
            await updateDoc(userImageRef, { timestampPairs });

            setTimestampPairs([...timestampPairs]);
            
            console.log('User image document updated successfully with new timestamp pair');
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error('Error updating document: ', error);
        }
    };

  const handleDelete = async () => {
    // Function to delete this timestamp pair from Firestore
    try {
      const docSnap = await getDoc(userImageRef);
      if (docSnap.exists()) {
        let timestampPairs: TimestampPair[] = docSnap.data().timestampPairs || [];
        // Filter out the timestamp pair with the matching startTime
        timestampPairs = timestampPairs.filter(pair => pair.startTime !== startTime);
        // Update Firestore with the filtered timestampPairs
        await updateDoc(userImageRef, { timestampPairs });
        console.log('Timestamp pair deleted successfully');
        onDelete(startTime);
        // Optionally, trigger a state update to remove the card from the UI immediately
      } else {
        console.log("Document doesn't exist");
      }
    } catch (error) {
      console.error('Error deleting timestamp pair: ', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTimestampPairs();
  };

  return (
    <div className="p-4 px-8 m-4 rounded-lg shadow-lg bg-white flex flex-col justify-between relative max-w-lg mx-auto">
      <button onClick={() => onDelete(startTime)} className="absolute top-2 right-2 text-2xl font-bold">×</button>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="input input-bordered w-28" // Made wider
          />
          <input
            type="text"
            placeholder="Finish"
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            className="input input-bordered w-28" // Made wider
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={dontPaintCeilings}
                onChange={(e) => setDontPaintCeilings(e.target.checked)}
              />
              Ceilings
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={dontPaintTrimAndDoors}
                onChange={(e) => setDontPaintTrimAndDoors(e.target.checked)}
              />
              Trim/Doors
            </label>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={dontPaintAtAll}
              onChange={(e) => setDontPaintAtAll(e.target.checked)}
            />
            Don't paint at all
          </label>
          <button type="submit" className="btn button-color hover:bg-green-900 text-white rounded">Set Room</button>
        </div>
      </form>
    </div>
  );
};

export default RoomCard;