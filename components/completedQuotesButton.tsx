import React from 'react';
import Link from 'next/link';

type CompletedQuotesButtonProps = {
  text: string;
  className?: string;
};

const CompletedQuotesButton: React.FC<CompletedQuotesButtonProps> = ({ text, className }) => {
  return (
    <Link href="/dashboard">
      <button className={`button-color hover:bg-green-900 text-white py-2 px-4 rounded ${className || ''}`}>
        {text}
      </button>
    </Link>
    
  );
};

export default CompletedQuotesButton;