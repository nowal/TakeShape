import { FC, useState } from 'react';
import { Room } from '@/app/demo/types';

interface RoomDropdownProps {
  rooms: Record<string, Room>;
  temporaryRooms: Record<string, Room>;
  activeRoom: string | null;
  classifiedRoomNames: Record<string, string>;
  onRoomSelect: (roomId: string) => void;
  onRoomNameChange: (roomId: string, name: string) => void;
  onRoomNameSave: (roomId: string, name: string) => void;
  onActiveInputFieldChange: (roomId: string | null, element: HTMLInputElement | null) => void;
}

/**
 * Dropdown component for selecting and managing rooms
 */
const RoomDropdown: FC<RoomDropdownProps> = ({
  rooms,
  temporaryRooms,
  activeRoom,
  classifiedRoomNames,
  onRoomSelect,
  onRoomNameChange,
  onRoomNameSave,
  onActiveInputFieldChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get the active room name to display
  const getActiveRoomName = () => {
    if (!activeRoom) return 'Select a room';

    // Check if it's a classifying room
    if (
      (activeRoom in rooms && rooms[activeRoom].name === 'Classifying...') ||
      (activeRoom in temporaryRooms && temporaryRooms[activeRoom].name === 'Classifying...')
    ) {
      return (
        <div className="classifying-label">
          <span>Classifying...</span>
          <div className="classifying-spinner"></div>
        </div>
      );
    }

    // Return the classified name if available, otherwise the room name
    return activeRoom in classifiedRoomNames
      ? classifiedRoomNames[activeRoom]
      : rooms[activeRoom]?.name ||
        temporaryRooms[activeRoom]?.name ||
        'Select a room';
  };

  return (
    <div className="room-dropdown">
      <div
        className="room-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Make the active room editable */}
        {activeRoom && rooms[activeRoom] && rooms[activeRoom].name !== 'Classifying...' ? (
          <input
            type="text"
            value={
              activeRoom in classifiedRoomNames
                ? classifiedRoomNames[activeRoom]
                : rooms[activeRoom]?.name || ''
            }
            onChange={(e) => onRoomNameChange(activeRoom, e.target.value)}
            onBlur={() =>
              onRoomNameSave(
                activeRoom,
                activeRoom in classifiedRoomNames
                  ? classifiedRoomNames[activeRoom]
                  : rooms[activeRoom]?.name || ''
              )
            }
            onFocus={(e) => onActiveInputFieldChange(activeRoom, e.currentTarget)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : activeRoom && temporaryRooms[activeRoom] && temporaryRooms[activeRoom].name !== 'Classifying...' ? (
          <input
            type="text"
            value={
              activeRoom in classifiedRoomNames
                ? classifiedRoomNames[activeRoom]
                : temporaryRooms[activeRoom]?.name || ''
            }
            onChange={(e) => onRoomNameChange(activeRoom, e.target.value)}
            onBlur={() =>
              onRoomNameSave(
                activeRoom,
                activeRoom in classifiedRoomNames
                  ? classifiedRoomNames[activeRoom]
                  : temporaryRooms[activeRoom]?.name || ''
              )
            }
            onFocus={(e) => onActiveInputFieldChange(activeRoom, e.currentTarget)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : typeof getActiveRoomName() === 'string' ? (
          <span>{getActiveRoomName()}</span>
        ) : (
          getActiveRoomName()
        )}
        <svg
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="room-dropdown-menu">
          {[
            ...Object.entries(rooms).map(([id, room]) => ({ id, room, source: 'firestore' })),
            ...Object.entries(temporaryRooms).map(([id, room]) => ({ id, room, source: 'temp' }))
          ].map(({ id: roomId, room, source }) => (
            <div
              key={`${source}-${roomId}`}
              className={`dropdown-item ${activeRoom === roomId ? 'active' : ''} ${
                room.name === 'Classifying...' ? 'classifying' : ''
              }`}
              onClick={() => {
                onRoomSelect(roomId);
                setIsOpen(false);
              }}
            >
              {/* Check if this room is being classified */}
              {room.name === 'Classifying...' ? (
                // Uneditable text for classifying rooms
                <div className="classifying-label">
                  <span>Classifying...</span>
                  <div className="classifying-spinner"></div>
                </div>
              ) : (
                // Non-editable text for normal rooms in the dropdown
                // Use the classified name if available, otherwise use the room name
                <span>
                  {roomId in classifiedRoomNames
                    ? classifiedRoomNames[roomId]
                    : room.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomDropdown;
