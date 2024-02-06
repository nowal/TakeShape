import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

type QuoteButtonProps = {
  text: string;
  className?: string;
};



const QuoteButton: React.FC<QuoteButtonProps> = ({ text, className }) => {
    
  return (
    <Link href="/quote">
      <button className={`shadow button-color hover:bg-green-900 text-white rounded ${className || ''}`}>
        {text}
      </button>
      <style jsx>{`
        .shadow {
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        }
      `}</style>
    </Link>
  );
};

export default QuoteButton;