'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ComponentsQuote } from '@/components/quote';

const QuotePage = () => {
  return (
    <>
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <ComponentsQuote />
    </>
  );
};

export default QuotePage;
