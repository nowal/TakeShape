import DashboardButton from "@/components/buttons/dashboardButton";
import QuoteButton from "@/components/buttons/quote/quoteButton";
import type { FC } from "react";

export const LandingQuote: FC = () => {
  return (
    <div>
      <div className="flex flex-col items-center mb-24 container mx-auto px-4">
        {/* Centered VBox */}
        <div className="flex flex-col w-full lg:w-4/5 text-center mt-40">
          <h1 className="text-4xl font-bold mb-8">
            Your dream room is only a few clicks away
          </h1>
          <QuoteButton />
          <DashboardButton
            text="Go to your Dashboard"
            className="py-3 px-5 text-xl"
          />
        </div>
      </div>
    </div>
  );
};