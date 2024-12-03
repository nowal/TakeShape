import type { FC } from 'react';

export const QuoteInstructionsBackground: FC = () => {
  return (
    <div 
      className="hidden absolute w-full left-0 top-0 lg:block"
      style={{ 
        backgroundColor: '#FFF6F7', 
        borderRadius: '1rem', // Adjust border radius as needed
        padding: '2rem', // Adjust padding as needed
      }}
    >
      {/* You can remove the SVG element from here */}
    </div>
  );
};