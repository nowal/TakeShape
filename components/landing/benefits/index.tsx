import Image from 'next/image';
import type { FC } from 'react';

export const LandingBenefits: FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h3>Benefits</h3>
      <ul className="flex flex-row justify-stretch gap-5 px-9">
        {(
          [
            [
              'Upload Your Video',
              'Capture a video of your space and upload it. We only need 30 seconds per room.',
            ],
            [
              'Receive Quotes',
              'Local painters will see your video and provide you with their best price.',
            ],
            [
              'Approve & Transform',
              'Review the quotes, approve the price, and get ready to enjoy the color you love.',
            ],
          ] as const
        ).map(([title, description], index) => {
          const dimensions = {
            height: 296,
            width: 467,
          } as const;
          return (
            <li
              key={title}
              style={{ width: dimensions.width }}
            >
              <div
                className="relative"
                style={{ ...dimensions }}
              >
                <Image
                  alt={title}
                  src={`/landing/benefits/${index}.png`}
                  layout="fill"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <h4>{title}</h4>
              <p>{description}</p>
            </li>
          );
        })}
      </ul>
    </div>
    // <div className="mx-auto px-4">
    //   <div className="pt-16 flex flex-col md:flex-row-reverse gap-6 items-center">
    //     <div className="flex flex-col w-full md:w-3/5 mt-8 md:mt-32">
    //       <h1 className="text-3xl font-bold mb-3 text-center md:text-left">
    //         Getting painting quotes is a nightmare
    //       </h1>
    //       <p className="text-lg mb-6 text-center md:text-left">
    //         Stop the awkward phone calls and in-home
    //         estimates with strangers. Get guaranteed
    //         painting quotes instantly with one video.
    //       </p>
    //     </div>

    //     <div className="w-full md:w-2/5 flex justify-center items-center mt-8 md:mt-0">
    //       {
    //         // eslint-disable-next-line @next/next/no-img-element
    //       }
    //       <Image
    //         src={muddyBoots.src}
    //         alt="Room Photo"
    //         className="image-shadow w-4/5 max-w-md md:h-auto md:min-h-[20rem] object-cover rounded-xl"
    //         layout="cover"
    //          width="100"
    //         height="100"
    //       />
    //     </div>
    //   </div>
    // </div>
  );
};
