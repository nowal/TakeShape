import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { timestampPairsAtom } from '../atom/atom';
import { updateDoc, DocumentReference, getDoc } from 'firebase/firestore';

interface TimestampPair {
  startTime: number;
  color: string;
  finish: string;
  paintCeilings?: boolean;
  paintTrimAndDoors?: boolean;
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
  editable: boolean; // Adding the editable flag
}

const RoomCard: React.FC<RoomCardProps> = ({
  startTime,
  endTime,
  userImageRef,
  defaultColor = '', 
  defaultFinish = '',
  defaultCeilings = false,
  defaultTrim = false,
  onDelete,
  editable, // Using the editable flag
}) => {
  const [color, setColor] = useState(defaultColor);
  const [finish, setFinish] = useState(defaultFinish);
  const [paintCeilings, setPaintCeilings] = useState(defaultCeilings);
  const [paintTrimAndDoors, setPaintTrimAndDoors] = useState(defaultTrim);
  const [dontPaintAtAll, setDontPaintAtAll] = useState(false);

  const [timestampPairs, setTimestampPairs] = useAtom(timestampPairsAtom);

  useEffect(() => {
    // Fetch the specific timestamp pair to ensure up-to-date values
    const fetchTimestampPair = async () => {
      const docSnap = await getDoc(userImageRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let specificPair = data.timestampPairs.find((pair: TimestampPair) => pair.startTime === startTime);
        if (specificPair) {
          setColor(specificPair.color || defaultColor);
          setFinish(specificPair.finish || defaultFinish);
          setPaintCeilings(specificPair.paintCeilings ?? defaultCeilings);
          setPaintTrimAndDoors(specificPair.paintTrimAndDoors ?? defaultTrim);
        }
      }
    };

    fetchTimestampPair();
  }, [startTime, userImageRef, defaultColor, defaultFinish, defaultCeilings, defaultTrim]);

        useEffect(() => {
            // Update state to match new props
            console.log("Defaults received in RoomCard:", { paintCeilings, paintTrimAndDoors});
            setPaintCeilings(defaultCeilings);
            setPaintTrimAndDoors(defaultTrim);
          }, [defaultCeilings, defaultTrim]);

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
                paintCeilings, // This should be included
                paintTrimAndDoors, // This should be included
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
      {editable && (
        <button onClick={() => onDelete(startTime)} className="absolute top-2 right-2 text-2xl font-bold">×</button>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        {dontPaintAtAll ? (
          <p>Don't paint this area</p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Color"
                value={color}
                onChange={(e) => editable ? setColor(e.target.value) : null}
                className="input input-bordered w-28"
                readOnly={!editable}
              />
              <input
                type="text"
                placeholder="Finish"
                value={finish}
                onChange={(e) => editable ? setFinish(e.target.value) : null}
                className="input input-bordered w-28"
                readOnly={!editable}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={paintCeilings}
                    onChange={(e) => editable ? setPaintCeilings(e.target.checked) : null}
                    disabled={!editable}
                  />
                  Ceilings
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={paintTrimAndDoors}
                    onChange={(e) => editable ? setPaintTrimAndDoors(e.target.checked) : null}
                    disabled={!editable}
                  />
                  Trim/Doors
                </label>
              </div>
            </div>
          </>
        )}
        {editable && (
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
        )}
      </form>
    </div>
  );
};

export default RoomCard;