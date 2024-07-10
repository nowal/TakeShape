// types.ts
export type Price = {
    painterId: string;
    amount: number;
    invoiceUrl?: string;
    timestamp: number;
    accepted?: boolean;
};

export type UserImage = {
    userImageId: string;
    video?: string;
    prices?: Price[];
    title?: string;
};

export type UserData = {
    email?: string;
    quote?: string | null;
    video?: string;
    reAgent?: string;
    paintPreferencesId?: string;
    userImages?: string[]; // Array of userImage IDs
    prices?: Price[];
    title?: string;
};


export type PaintPreferences = {
    color?: string;
    finish?: string;
    ceilings?: boolean;
    ceilingColor?: string;
    ceilingFinish?: string;
    trim?: boolean;
    trimColor?: string;
    trimFinish?: string;
    paintQuality?: string;
    laborAndMaterial:boolean;
};

export type TimestampPair = {
    startTime: number;
    endTime?: number;
    color?: string;
    finish?: string;
    ceilings?: boolean;
    trim?: boolean;
    roomName: string;
};

export type Job = {
    jobId: string;
    video: string;
    phoneNumber?: string;
    specialRequests?: string;
    paintPreferencesId?: string;
    paintPreferences?: PaintPreferences;
    providingOwnPaint?: string;
    moveFurniture?: boolean;
    customerName?: string;
    userId?: string;
    address: string;
    lat?: number;
    lng?: number;
    prices: Array<{
      painterId: string;
      amount: number;
      invoiceUrl?: string;
      timestamp: number;
    }>;
    acceptedQuotes?: Array<{
      acceptedQuoteId: string;
    }>;
  };
  