import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { timestampPairsAtom } from '../atom';
import { updateDoc, DocumentReference, getDoc } from 'firebase/firestore';

interface TimestampPair {
  startTime: number;
  endTime?: number;
  color: string;
  finish: string;
  paintCeilings?: boolean;
  paintTrimAndDoors?: boolean;
  dontPaintAtAll?: boolean;
  roomName: string;
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
  editable: boolean;
  roomName: string;
  onClick: () => void; // Add this line
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
  editable,
  roomName,
  onClick,
}) => {
  const [color, setColor] = useState(defaultColor);
  const [finish, setFinish] = useState(defaultFinish);
  const [paintCeilings, setPaintCeilings] = useState(defaultCeilings);
  const [paintTrimAndDoors, setPaintTrimAndDoors] = useState(defaultTrim);
  const [dontPaintAtAll, setDontPaintAtAll] = useState(false);
  const [isRoomSet, setIsRoomSet] = useState(false);
  const [editableRoomName, setEditableRoomName] = useState(roomName); // State variable for editable roomName

  const [timestampPairs, setTimestampPairs] = useAtom(timestampPairsAtom);

  useEffect(() => {
    const fetchTimestampPair = async () => {
      const docSnap = await getDoc(userImageRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const specificPair = data.timestampPairs.find((pair: TimestampPair) => pair.startTime === startTime);
        if (specificPair) {
          setColor(specificPair.color || defaultColor);
          setFinish(specificPair.finish || defaultFinish);
          setPaintCeilings(specificPair.paintCeilings ?? defaultCeilings);
          setPaintTrimAndDoors(specificPair.paintTrimAndDoors ?? defaultTrim);
          setEditableRoomName(specificPair.roomName); // Update room name state
        }
      }
    };

    fetchTimestampPair();
  }, [startTime, userImageRef, defaultColor, defaultFinish, defaultCeilings, defaultTrim, roomName]);

  const updateTimestampPairs = async () => {
    try {
      const docSnap = await getDoc(userImageRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let timestampPairs: TimestampPair[] = data.timestampPairs || [];
        timestampPairs = timestampPairs.filter(pair => pair.startTime !== startTime);

        const newPair: TimestampPair = {
          startTime, 
          color, 
          finish,
          paintCeilings,
          paintTrimAndDoors,
          dontPaintAtAll,
          roomName: editableRoomName, // Use the state variable for roomName
        };
        timestampPairs.push(newPair);

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
    try {
      const docSnap = await getDoc(userImageRef);
      if (docSnap.exists()) {
        let timestampPairs: TimestampPair[] = docSnap.data().timestampPairs || [];
        timestampPairs = timestampPairs.filter(pair => pair.startTime !== startTime);
        await updateDoc(userImageRef, { timestampPairs });
        console.log('Timestamp pair deleted successfully');
        onDelete(startTime);
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
    setIsRoomSet(true);
  };

  return (
    <div
      className="room-card p-4 m-4 rounded-lg shadow-lg bg-white flex flex-col justify-between relative max-w-lg mx-auto cursor-pointer"
      onClick={onClick}
      style={{ maxWidth: '95%' }} 
    >
      {editable && (
        <button onClick={() => onDelete(startTime)} className="absolute top-2 right-2 text-2xl font-bold">×</button>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          value={editableRoomName}
          onChange={(e) => setEditableRoomName(e.target.value)}
          className="text-lg font-semibold mb-4 block w-full rounded-md border-transparent focus:border-transparent focus:ring-0"
          readOnly={!editable}
          placeholder="Room Name"
        />
        {dontPaintAtAll ? (
          <p>Don't paint this area</p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <input
                type="text"
                placeholder="Color"
                value={color}
                onChange={(e) => editable ? setColor(e.target.value) : null}
                className="input input-bordered flex-grow flex-shrink min-w-0"
                style={{ maxWidth: "30%" }} // Limit max width to give more room for checkboxes
                readOnly={!editable}
              />
              <select
                name="finish"
                value={finish}
                onChange={(e) => editable ? setFinish(e.target.value) : null}
                className="select select-bordered flex-grow flex-shrink min-w-0"
                style={{ maxWidth: "30%" }}
                disabled={!editable}
              >
                <option value="Eggshell">Eggshell</option>
                <option value="Flat">Flat</option>
                <option value="Satin">Satin</option>
                <option value="Semi-gloss">Semi-Gloss</option>
                <option value="High-gloss">High Gloss</option>
              </select>
              <div className="flex-grow flex-shrink min-w-0 flex-wrap" style={{ maxWidth: "35%" }}> {/* This div will hold checkboxes and allow for some flex growth/shrink */}
                <label className="flex items-center gap-1 whitespace-nowrap mr-2">
                  <input
                    type="checkbox"
                    checked={paintCeilings}
                    onChange={(e) => editable ? setPaintCeilings(e.target.checked) : null}
                    disabled={!editable}
                  />
                  Ceilings
                </label>
                <label className="flex items-center gap-1 whitespace-nowrap">
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
            <button type="submit" className="btn button-color hover:bg-green-900 text-white rounded">
                {isRoomSet ? "Edit Room" : "Set Room"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RoomCard;