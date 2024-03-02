import React, { useState } from 'react';
import { updateDoc, DocumentReference, getDoc } from 'firebase/firestore';

interface TimestampPair {
  startTime: number;
  roomName: string;
  color: string;
  finish: string;
  dontPaintCeilings?: boolean;
  dontPaintTrimAndDoors?: boolean;
  dontPaintAtAll?: boolean;
}

interface RoomCardProps {
    startTime: number;
    userImageRef: DocumentReference;
    defaultColor?: string;
    defaultFinish?: string;
    defaultCeilings?: boolean;
    defaultTrim?: boolean;
  }

  const RoomCard: React.FC<RoomCardProps> = ({
    startTime,
    userImageRef,
    defaultColor = '', // Provide default values to avoid undefined
    defaultFinish = '',
    defaultCeilings = false,
    defaultTrim = false,
  }) => {
    const [roomName, setRoomName] = useState('');
    const [color, setColor] = useState(defaultColor);
    const [finish, setFinish] = useState(defaultFinish);
    const [dontPaintCeilings, setDontPaintCeilings] = useState(!defaultCeilings);
    const [dontPaintTrimAndDoors, setDontPaintTrimAndDoors] = useState(!defaultTrim);
    const [dontPaintAtAll, setDontPaintAtAll] = useState(false);

  const updateTimestampPairs = async () => {
    try {
      const docSnap = await getDoc(userImageRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let timestampPairs: TimestampPair[] = data.timestampPairs || [];
  
        // Remove any existing entry with the same startTime
        timestampPairs = timestampPairs.filter(pair => pair.startTime !== startTime);
  
        // Now, add the new or updated entry
        // Since we've removed the old entry, we can simply push the updated info
        timestampPairs.push({ startTime, roomName, color, finish });
  
        // Update the document with the modified timestampPairs array
        await updateDoc(userImageRef, { timestampPairs });
        console.log('User image document updated successfully with new timestamp pair');
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTimestampPairs();
  };

  return (
    <div className="p-3 m-3 rounded-lg shadow-lg bg-white flex flex-col justify-between relative max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-2 relative">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="text-lg font-semibold w-3/4" // Adjusted to 3/4 width
          />
          <button type="submit" className="btn button-color hover:bg-green-900 text-white rounded btn-xs btn-primary ml-4">Set Room</button> {/* Removed absolute positioning */}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="input input-bordered flex-1"
          />
          <input
            type="text"
            placeholder="Finish"
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            className="input input-bordered flex-1"
          />
        </div>
        <div className="flex gap-2">
          <label>
            <input
              type="checkbox"
              checked={dontPaintCeilings}
              onChange={(e) => setDontPaintCeilings(e.target.checked)}
            /> Paint Ceilings
          </label>
          <label>
            <input
              type="checkbox"
              checked={dontPaintTrimAndDoors}
              onChange={(e) => setDontPaintTrimAndDoors(e.target.checked)}
            /> Paint trim and doors
          </label>
          </div>
          <label>
            <input
              type="checkbox"
              checked={dontPaintAtAll}
              onChange={(e) => setDontPaintAtAll(e.target.checked)}
            /> Don't paint room at all
          </label>
      </form>
    </div>
  );
};

export default RoomCard;