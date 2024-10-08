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
    amount: 1300,
    invoiceUrl: 'INV3412341',
    timestamp: 6456245624,
    accepted: true,
  },
  {
    painterId: 'Jonny',
    amount: 1150,
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
  businessName: 'Jeffrey\'s Painting',
  logoUrl: logoUrl.src,
  phoneNumber: '(615) 738-9954',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_1: TPainterData = {
  businessName: 'Murfreesboro Homes',
  logoUrl: logoUrl1.src,
  phoneNumber: '(901) 542-0927',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_2: TPainterData = {
  businessName: 'Richardson Interior\'s',
  logoUrl: logoUrl2.src,
  phoneNumber: '(615) 2293-5501',
  reviews: [12, 2, 56],
};

export const MOCKS_PAINTER_DATA_ITEMS: TPainterData[] = [
  MOCKS_PAINTER_DATA,
  MOCKS_PAINTER_DATA_1,
  MOCKS_PAINTER_DATA_2,
];
