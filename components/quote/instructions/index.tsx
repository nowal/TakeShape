import { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsTick } from '@/components/icons/tick';
import { IconsVideo } from '@/components/icons/video';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { SEE_VIDEO_TITLE } from '@/components/quote/constants';

export const QuoteInstructions: FC = () => {
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
      <ButtonsCvaButton
        title={SEE_VIDEO_TITLE}
        icon={{ Trailing: IconsVideo }}
        size="none"
        classValue="gap-2"
        isDisabled
      >
        <span className="typography-quote-see-video">
          {SEE_VIDEO_TITLE}
        </span>
      </ButtonsCvaButton>
    </div>
  );
};
