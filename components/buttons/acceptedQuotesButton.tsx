import React from 'react';
import Link from 'next/link';

type AcceptedQuotesButtonProps = {
  text: string;
  className?: string;
};

const AcceptedQuotesButton: React.FC<AcceptedQuotesButtonProps> = ({ text, className }) => {
  return (
    <Link href="/acceptedQuotes">
      <button className={`button-green ${className || ''}`}>
        {text}
      </button>
    </Link>
    
  );
};

export default AcceptedQuotesButton;