import { useLanding } from '@/context/landing/provider';
import Image from 'next/image';
import type { FC } from 'react';
import muddyBoots from '@/public/muddyBoots.jpeg';

export const Benefits: FC = () => {
  const landing = useLanding()

  return (
    <div className="container mx-auto px-4">
      <div className="pt-16 flex flex-col md:flex-row-reverse gap-6 items-center">
        <div className="flex flex-col w-full md:w-3/5 mt-8 md:mt-32">
          <h1 className="text-3xl font-bold mb-3 text-center md:text-left">
            Getting painting quotes is a nightmare
          </h1>
          <p className="text-lg mb-6 text-center md:text-left">
            Stop the awkward phone calls and in-home
            estimates with strangers. Get guaranteed
            painting quotes instantly with one video.
          </p>
        </div>

        <div className="w-full md:w-2/5 flex justify-center items-center mt-8 md:mt-0">
          {
            // eslint-disable-next-line @next/next/no-img-element
          }
          <Image
            src={muddyBoots.src}
            alt="Room Photo"
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
