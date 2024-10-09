'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useQuote } from '@/context/quote/provider';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { ComponentsQuote } from '@/components/quote';

const QuotePage = () => {
  const { isLoading } = useQuote();
  if (isLoading)
    return (
      <NotificationsInlineHighlight>
        Uploading, please wait...
      </NotificationsInlineHighlight>
    );
  return (
    <>
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <ComponentsQuote />
    </>
  );
};

export default QuotePage;
