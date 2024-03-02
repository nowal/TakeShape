// types.ts
export type UserData = {
    email?: string;
    quote?: string | null;
    video?: string;
    prices?: Array<{
        painterId: string;
        amount: number;
        invoiceUrl?: string;
        timestamp: number;
        accepted?: boolean;
    }>;
};

export type PaintPreferences = {
    walls: boolean;
    ceilings: boolean;
    trim: boolean;
  };

export type TimestampPair = {
    id: string; // Assuming each timestamp pair has a unique ID for key purposes
    startTime: number;
    endTime: number;
    roomName?: string; // Optional fields for the submitted information
    color?: string;
    finish?: string;
};

export type Job = {
    jobId: string;
    zipCode: string;
    video: string;
    phoneNumber?: string,
    description: string;
    paintPreferences: PaintPreferences;
    providingOwnPaint: string;
    prices: Array<{
        painterId: string;
        amount: number;
        invoiceUrl: string;
        timestamp: number; // Unix timestamp of when the quote was made
    }>;
    acceptedQuotes: Array<{
        acceptedQuoteId: string; // Unix timestamp of when the quote was made
    }>; // This will exist if a quote has been accepted

};

  