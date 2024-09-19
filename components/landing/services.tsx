import type { FC } from 'react';

export const LandingServices: FC = () => {
  return (
    <>
      {/* Third Section */}
      <div className="secondary-color w-full pt-16 pb-8 flex flex-col sm:flex-row gap-6 items-center justify-start px-4">
        {/* Left Text */}
        <div className="flex-1 min-w-0 max-w-2xl mx-auto sm:mx-0">
          {' '}
          {/* Center the content for small screens and align left for larger screens */}
          <h1 className="ml-32 text-3xl font-bold mb-3 sm:mb-0">
            Keep up to date on our services:
          </h1>
        </div>
      </div>
    </>
  );
};
