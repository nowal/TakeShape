'use client';
import { LandingFaqLeft } from '@/components/landing/faq/left';
import { LandingFaqRight } from '@/components/landing/faq/right';
import Image from 'next/image';
import image from '@/public/landing/faq.png';

export const LandingFaq = () => {
  return (
    <div className="px-20 py-20 h-full">
      <div className="flex flex-row w-full bg-white rounded-4xl h-full">
        <div
          className="absolute top-24 left-20"
          style={{
            width: 870,
            height: 785,
          }}
        >
          <Image
            src={image.src}
            alt="Taking Video"
            width={870}
            height={785}
          />
        </div>
        <LandingFaqLeft />
        <LandingFaqRight />
      </div>
    </div>
  );
};

export default LandingFaq;
