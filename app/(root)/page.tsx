'use client';
import Image from 'next/image';
import happyPic from '../../public/TakeShapeHappyPic.png';
import { useLanding } from '@/context/landing/provider';
import { LandingQuote } from '@/components/landing/quote';
import { LandingFaq } from '../../components/landing/faq';
import { LandingHowItWorks } from '@/components/landing/how-it-works';
import { LandingHero } from '@/components/landing/hero';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';

const Landing = () => {
  const landing = useLanding();
  // const {
  //   emailForSubscription,
  //   onSubscription,
  //   dispatchImageUrls,
  //   dispatchEmailForSubscription,
  // } = landing;

  return (
    <div className="">
      {/* First Section */}
      <div className="pt-8 container mx-auto px-4 flex flex-col md:flex-row gap-8 mb-2">
        {/* Text Section */}
        <LandingHero />
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
      <LandingProblemAndDecision />
      <LandingHowItWorks />
      <LandingQuote />
      <LandingFaq />
    </div>
  );
};
export default Landing;
