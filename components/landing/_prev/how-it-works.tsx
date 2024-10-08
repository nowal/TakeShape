import type { FC } from 'react';

export const LandingHowItWorks: FC = () => {
  return (
    <div className="mx-auto px-4">
      <h2 className="text-4xl font-bold text-center">
        How it works
      </h2>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-4 lg:gap-20">
        {/* Step 1 */}
        <div className="step-box secondary-color p-4 rounded-xl w-64">
          <h2 className="text-2xl font-semibold mb-2">
            Upload Your Video
          </h2>
          <p className="text-lg">
            Capture a video of your space and upload it. We
            only need 30 seconds per room.
          </p>
        </div>

        {/* Arrow */}
        <div className="arrow hidden sm:flex justify-center items-center sm:w-12 md:w-16 text-4xl font-bold text-gray-500">
          &rarr;
        </div>

        {/* Step 2 */}
        <div className="step-box secondary-color p-4 rounded-xl w-64">
          <h2 className="text-2xl font-semibold mb-2">
            Receive Quotes
          </h2>
          <p className="text-lg">
            Local painters will see your video and provide
            you with their best price.
          </p>
        </div>

        {/* Arrow */}
        <div className="arrow hidden sm:flex justify-center items-center sm:w-12 md:w-16 text-4xl font-bold text-gray-500">
          &rarr;
        </div>

        {/* Step 3 */}
        <div className="step-box secondary-color p-4 rounded-xl w-64">
          <h2 className="text-2xl font-semibold mb-2">
            Approve & Transform
          </h2>
          <p className="text-lg">
            Review the quotes, approve the price, and get
            ready to enjoy the color you love.
          </p>
        </div>
      </div>
    </div>
  );
};
