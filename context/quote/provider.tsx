'use client';
import { useQuoteState } from '@/context/quote/state';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TQuoteContext = ReturnType<typeof useQuoteState>;
export const QUOTE = createContext<TQuoteContext>(
  {} as TQuoteContext
);

export const useQuote = (): TQuoteContext =>
  useContext(QUOTE);

export const QuoteProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const landing = useQuoteState();
  return (
    <QUOTE.Provider value={landing}>
      {children}
    </QUOTE.Provider>
  );
};
