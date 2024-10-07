'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cx } from 'class-variance-authority';
import { QuoteInstructions } from '@/components/quote/instructions';
import { useQuote } from '@/context/quote/provider';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { QuoteInstructionsBackground } from '@/components/quote/instructions/background';
import { QuoteInput } from '@/components/quote/input';

const QuotePage = () => {
  const { isLoading, currentStep } = useQuote();

  return (
    <div className="p-8 pt-20">
      <GoogleAnalytics gaId="G-47EYLN83WE" />

      {isLoading && currentStep === 2 && (
        <NotificationsInlineHighlight>
          Uploading, please wait...
        </NotificationsInlineHighlight>
      )}

      {currentStep === 1 && (
        <div className="flex flex-col items-center gap-6 lg:gap-4 xl:gap-0">
          <div className="flex flex-col items-center gap-1">
            <h2 className="typography-page-title">
              Get an Instant Painting Quote Today
            </h2>
            <h3 className="typography-page-subtitle">
              Upload a Video, Receive a Quote Within Minutes
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center gap-[31px] mx-auto lg:flex-row">
            <div
              className={cx(
                'hidden xl:flex',
                'w-0 h-0 ',
                'xs:w-[21rem]'
              )}
            />
            <QuoteInput />
            <div
              className={cx(
                'relative',
                'xs:w-[21rem]',
                'w-full',
                'bg-white-pink-1',
                'rounded-md'
              )}
            >
              <QuoteInstructionsBackground />
              <QuoteInstructions />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotePage;
