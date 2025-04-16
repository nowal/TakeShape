'use client';

import React from 'react';
import { LeadStage, ProgressBar } from './progressBar';
import { RoomViewer } from './roomViewer';
import { Room } from '@/utils/firestore/house';

export interface LeadData {
  sessionId: string;
  name: string;
  stage: LeadStage;
  lastActive: Date;
  rooms: Room[];
}

interface LeadCardProps {
  lead: LeadData;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const { name, stage, lastActive, rooms } = lead;
  
  // Format the date
  const formattedDate = new Date(lastActive).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
      
      <div className="mb-4">
        <ProgressBar stage={stage} />
      </div>
      
      {stage === 'Started TakeShape' && rooms.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">Rooms</h4>
          <RoomViewer rooms={rooms} />
        </div>
      )}
    </div>
  );
};

export default LeadCard;
