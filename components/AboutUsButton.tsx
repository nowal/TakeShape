import React from 'react';
import Link from 'next/link';

type AboutUsButtonProps = {
  className?: string;
};

const AboutUsButton: React.FC<AboutUsButtonProps> = ({ className }) => {
  return (
    <Link href="/aboutUs">
      <button className={`${className || ''} text-md hover:underline`}>
        About Us
      </button>
    </Link>
  );
};

export default AboutUsButton;
