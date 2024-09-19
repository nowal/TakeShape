import type { FC } from 'react';
import Image from 'next/image';
import takingVideo from '@/public/takingVideo.jpg';

export const LandingProblemAndDecision: FC = () => {
  return (
    <div className="mx-auto px-4 mb-40">
      <div className="pt-16 flex flex-col md:flex-row gap-6 items-center">
        {/* Text Section */}
        <div className="flex flex-col w-full md:w-3/5 mt-8 md:mt-32">
          <h1 className="text-3xl font-bold mb-3 text-center md:text-left">
            Your quote is only a couple of clicks away
          </h1>
          <p className="text-lg mb-6 text-center md:text-left">
            We&apos;ve done the hard work of finding the
            painters, now just show us what you want done.
          </p>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-2/5 flex justify-center items-center mt-8 md:mt-0">
          <Image
            src={takingVideo.src}
            alt="takingVideo"
            className="image-shadow w-4/5 max-w-md md:h-auto md:min-h-[20rem] object-cover rounded-xl"
            layout="cover"
             width="100"
            height="100"
          />
        </div>
      </div>
    </div>
  );
};
