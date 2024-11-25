import type { FC } from 'react';
import { LandingProblemAndDecisionText } from '@/components/landing/problem-and-decision/text';
import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';
import { cx } from 'class-variance-authority';

export const LandingProblemAndDecision: FC = () => {
  const video = "https://www.youtube.com/embed/acmKqO7Z5HU";

  return (
    <div className="spacing-landing pb-20 h-full">
      <div className="relative flex flex-col items-center justify-between h-full w-full xl:flex-row">
        <InViewReplacersFadeUp>
          <LandingProblemAndDecisionText />
        </InViewReplacersFadeUp>
        <div
          className={cx(
            'w-full',
            'bg-white-1 rounded-lg object-top overflow-hidden',
          )}
        >
          <div className="relative h-[572px]"> {/* Set a fixed height for the container */}
            <div style={{ position: 'relative', paddingTop: '5%', paddingBottom: '5%', height: '100%' }}>
              <iframe
                src={video + "?rel=0&modestbranding=1&controls=1&showinfo=0&width=707&height=572"}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};