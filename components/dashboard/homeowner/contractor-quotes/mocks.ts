import { TAgentInfo, TPrice } from '@/types';
import logoUrl from '@/public/landing/benefits/logos/0.png';
import logoUrl1 from '@/public/landing/benefits/logos/1.png';
import logoUrl2 from '@/public/landing/benefits/logos/2.png';
import { TPainterData } from '@/components/painter/card/types';

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
  profilePictureUrl: logoUrl.src,
  preferredPainters: ['Jonny', 'Sam'],
};

// public/landing/benefits/logos/2.png
export const MOCKS_PAINTER_DATA: TPainterData = {
  businessName: 'Powers Paint Shop',
  logoUrl: logoUrl.src,
  phoneNumber: '123123123',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_1: TPainterData = {
  businessName: 'Leroy Merlin Paint',
  logoUrl: logoUrl1.src,
  phoneNumber: '123123123',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_2: TPainterData = {
  businessName: 'Color Picker Services',
  logoUrl: logoUrl2.src,
  phoneNumber: '123123123',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_ITEMS: TPainterData[] = [
  MOCKS_PAINTER_DATA,
  MOCKS_PAINTER_DATA_1,
  MOCKS_PAINTER_DATA_2,
];
