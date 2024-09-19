import QuoteButton from '@/components/buttons/quote/quoteButton';
import type { FC } from 'react';
import Image from 'next/image';
import happyPic from '../../public/TakeShapeHappyPic.png';

export const LandingHero: FC = () => {
  return (
    <div className="pt-8 mx-auto px-4 flex flex-col md:flex-row gap-8 mb-2">
      {/* Text Section */}
      <div className="flex flex-col w-full md:w-1/2 justify-center md:mt-24">
        <h1 className="text-4xl font-bold mb-4 text-center md:text-left">
          Love the walls you&apos;re with
        </h1>
        <p className="text-xl mb-8 text-center md:text-left">
          Find the right paint color and painter for free
          through one video of your space. This is your
          home, your style, your terms.
        </p>
        <div className="flex justify-center md:justify-start">
          <QuoteButton className="py-3 px-5 text-xl">
            Color Me Curious!
          </QuoteButton>
        </div>
      </div>
      {/* Image Section */}
      <div className="flex justify-center items-center w-full md:w-3/5">
        <Image
          src={happyPic.src}
          alt="Happy Pic"
          className="image-shadow max-w-sm md:max-w-md w-full h-auto object-contain rounded-xl"
          layout="cover"
          width="100"
          height="100"
        />
      </div>
    </div>
  );
};
