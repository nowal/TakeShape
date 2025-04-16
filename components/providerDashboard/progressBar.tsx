'use client';

import React from 'react';

export type LeadStage = 'Visited' | 'Want Consult' | 'Started TakeShape' | 'Completed TakeShape' | 'Accepted Quote';

interface ProgressBarProps {
  stage: LeadStage;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ stage }) => {
  // Define the stages in order
  const stages: LeadStage[] = [
    'Visited',
    'Want Consult',
    'Started TakeShape',
    'Completed TakeShape',
    'Accepted Quote'
  ];
  
  // Find the index of the current stage
  const currentStageIndex = stages.indexOf(stage);
  
  // Calculate progress percentage
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-xs">
        {stages.map((s, index) => (
          <div 
            key={s} 
            className={`text-center ${index <= currentStageIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
            style={{ width: `${100 / stages.length}%` }}
          >
            {s}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
