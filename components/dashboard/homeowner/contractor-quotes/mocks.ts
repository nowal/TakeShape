import { TPainterInfo } from '@/components/painter/card';
import { TAgentInfo, TPrice } from '@/types';
import logoUrl from '@/public/landing/benefits/logos/0.png';
import logoUrl1 from '@/public/landing/benefits/logos/1.png';
import logoUrl2 from '@/public/landing/benefits/logos/2.png';

export const isMocks = () =>
  process.env.NEXT_PUBLIC_MOCKS === 'true';

export const MOCKS_PRICES: TPrice[] = [
  {
    painterId: 'Thomas',
    amount: 1200,
    invoiceUrl: 'ID123123',
    timestamp: 123,
    accepted: false,
  },
  {
    painterId: 'Sam',
    amount: 400,
    invoiceUrl: 'INV3412341',
    timestamp: 6456245624,
    accepted: true,
  },
  {
    painterId: 'Jonny',
    amount: 10000,
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
// public/landing/benefits/logos/2.png
export const MOCKS_PAINTER_DATA: TPainterInfo = {
  businessName: 'Powers Paint Shop',
  logoUrl: logoUrl.src, //'https://i.imgur.com/DfmNsa2.png',
  phoneNumber: '123123123',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_1: TPainterInfo = {
  businessName: 'Leroy Merlin Paint',
  logoUrl: logoUrl1.src,
  phoneNumber: '123123123',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_2: TPainterInfo = {
  businessName: 'Color Picker Services',
  logoUrl: logoUrl2.src,
  phoneNumber: '123123123',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_ITEMS: TPainterInfo[] = [
  MOCKS_PAINTER_DATA,
  MOCKS_PAINTER_DATA_1,
  MOCKS_PAINTER_DATA_2,
];
