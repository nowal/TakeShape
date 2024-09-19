import { TPainterData } from '@/components/painter-card';
import { TAgentInfo, TPrice } from '@/types';

export const isMocks = () =>
  process.env.NEXT_PUBLIC_MOCKS === 'true';

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
];

export const MOCKS_AGENT_INFO: TAgentInfo = {
  name: 'Alex',
  profilePictureUrl: 'https://i.imgur.com/2hakYvC.png',
  preferredPainters: ['Jonny', 'Sam'],
};

export const MOCKS_PAINTER_INFO: TPainterData = {
  businessName: "Tim's paint",
  logoUrl: 'https://i.imgur.com/DfmNsa2.png',
  phoneNumber: '123123123',
  reviews: [12, 2, 56],
};
