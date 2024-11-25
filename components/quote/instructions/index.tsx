import { FC, useState } from 'react';
import { CvaButton } from '@/components/cva/button';
import { IconsTick } from '@/components/icons/tick';
import { IconsVideo } from '@/components/icons/video';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { SEE_VIDEO_TITLE } from '@/components/quote/constants';
import { ComponentsModal } from '@/components/modal'; // Import your Modal component
import { ComponentsPanel } from '@/components/panel'; // Import your Panel component

export const QuoteInstructions: FC = () => {

  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const videoUrl = "https://www.youtube.com/embed/acmKqO7Z5HU"; // Your YouTube video URL

  const handleButtonClick = () => {
    setShowModal(true); // Show the modal when the button is clicked
  };

  return (
    <div className="relative flex flex-col px-9 py-5.5">
      <h2 className="text-sm text-pink font-semibold">
        How to Record Your Video
      </h2>
      <ul className="flex flex-col gap-3 mt-3.5">
        {(
          [
            'Use the back camera. Hold the phone horizontally. Zoom out as far as possible.',
            'Go around the edge of the room as best as possible with camera facing the center. Move camera up and down occasionally to capture ceilings and trim.',
            'Walk through all areas that you would like painted, taking 15-30 seconds for each full room. You can exclude an area in your video from the quote in the next step.',
            'Exclude unwanted areas in your video during the next step.',
          ] as const
        ).map((text, index) => (
          <li
            key={`text-${index}`}
            className="flex flex-row gap-2.5"
          >
            <IconsTick />
            <span className="text-xs font-open-sans leading-[120%]">
              {text}
            </span>
          </li>
        ))}
      </ul>
      <LinesHorizontal
        colorClass="border-white-pink-2"
        classValue="mt-5"
      />
      <CvaButton
        title={SEE_VIDEO_TITLE}
        icon={{ Trailing: IconsVideo }}
        size="none"
        gap="lg"
        onTap={handleButtonClick} // Call handleButtonClick on tap
        isDisabled={false} // Make the button enabled
      >
        <span className="typography-pink-xs">
          {SEE_VIDEO_TITLE}
        </span>
      </CvaButton>

      {/* Modal */}
      {showModal && (
        <ComponentsModal onTap={() => setShowModal(false)}> {/* Close modal on tap outside */}
          <ComponentsPanel 
            title="How to Record Your Video" 
            closeProps={{ 
              title: 'Close', 
              onTap: () => setShowModal(false) 
            }}
            style={{ width: '90vw', maxWidth: '600px' }}
          >
            <iframe
              src={`${videoUrl}?rel=0&modestbranding=1&controls=1&showinfo=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '300px'}}
            />
          </ComponentsPanel>
        </ComponentsModal>
      )}
    </div>
  );
};
