import React from 'react';
import Link from 'next/link';

type AcceptedQuotesButtonProps = {
  text: string;
  className?: string;
};

const AcceptedQuotesButton: React.FC<AcceptedQuotesButtonProps> = ({ text, className }) => {
  return (
    <Link href="/dashboard">
      <button className={`bg-green-800 hover:bg-green-900 text-white py-2 px-4 rounded ${className || ''}`}>
        {text}
      </button>
    </Link>
    
  );
};

export default AcceptedQuotesButton;