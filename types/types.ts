// types.ts
export type UserData = {
    email?: string;
    quote?: string | null;
    video?: string;
    prices?: { painterId: string; amount: number }[];
};

export type PaintPreferences = {
    walls: boolean;
    ceilings: boolean;
    trim: boolean;
  };

export type Job = {
    jobId: string;
    zipCode: string;
    video: string;
    description: string;
    paintPreferences: PaintPreferences;
    providingOwnPaint: string;
    prices: Array<{
        painterId: string;
        amount: number;
        timestamp: number; // Unix timestamp of when the quote was made
    }>;
    acceptedQuote?: {
        painterId: string;
        amount: number;
    }; // This will exist if a quote has been accepted

};

  