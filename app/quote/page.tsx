'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useQuote } from '@/context/quote/provider';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { ComponentsQuote } from '@/components/quote';

const QuotePage = () => {
  const { isLoading, currentStep } = useQuote();

  return (
    <>
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      {isLoading && currentStep === 2 && (
        <NotificationsInlineHighlight>
          Uploading, please wait...
        </NotificationsInlineHighlight>
      )}
      {currentStep === 1 && <ComponentsQuote />}
    </>
  );
};

export default QuotePage;
