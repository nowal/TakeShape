import { TPrice } from '@/types/types';

export const MOCKS_PRICES: TPrice[] = [
  {
    painterId: 'Thomas',
    amount: 2,
    invoiceUrl: 'ID123123',
    timestamp: 123,
    accepted: false,
  },

  {
    painterId: 'Sam',
    amount: 8,
    invoiceUrl: 'INV3412341',
    timestamp: 6456245624,
    accepted: true,
  },
  {
    painterId: 'Jonny',
    amount: 3,
    invoiceUrl: 'INV34413',
    timestamp: 112323,
    accepted: false,
  },
] as const;
