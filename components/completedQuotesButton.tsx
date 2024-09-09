import React from 'react';
import Link from 'next/link';

type CompletedQuotesButtonProps = {
  text: string;
  className?: string;
};

const CompletedQuotesButton: React.FC<CompletedQuotesButtonProps> = ({ text, className }) => {
  return (
    <Link href="/completedQuotes">
      <button className={`button-green ${className || ''}`}>
        {text}
      </button>
    </Link>
    
  );
};

export default CompletedQuotesButton;