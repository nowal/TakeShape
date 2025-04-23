import { useState } from 'react';
import { QuoteItem } from '@/app/demo/types';
import { PricingSheet } from '@/utils/firestore/pricingSheet';
import { useSession } from '@/context/session/provider';

interface UseQuoteProps {
  pricingSheet: PricingSheet | null;
  addOns: QuoteItem[];
}

interface UseQuoteReturn {
  quoteItems: QuoteItem[];
  totalQuoteAmount: number;
  generateQuote: (roomCount: number) => void;
  handleQuoteAccept: () => void;
}

/**
 * Hook for managing quote generation and handling
 */
export const useQuote = ({ pricingSheet, addOns }: UseQuoteProps): UseQuoteReturn => {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [totalQuoteAmount, setTotalQuoteAmount] = useState(0);
  
  // Generate a quote based on room count and add-ons
  const generateQuote = (roomCount: number) => {
    if (!pricingSheet) {
      console.error('No pricing sheet available');
      return;
    }
    
    const basePrice = roomCount * (pricingSheet.perRoom || 0);
    
    // Start with the base price as the first line item
    const items: QuoteItem[] = [
      {
        description: `Base Price (${roomCount} rooms)`,
        amount: basePrice
      }
    ];
    
    // Add all the add-ons that have been identified
    items.push(...addOns);
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Update state
    setQuoteItems(items);
    setTotalQuoteAmount(total);
  };
  
  // Get the session context to access houseId
  const { houseId } = useSession();
  
  // Handle quote acceptance
  const handleQuoteAccept = async () => {
    // This function would typically send the quote to a backend service
    // or trigger some other action like sending an email
    console.log('Quote accepted:', {
      items: quoteItems,
      total: totalQuoteAmount
    });
    
    // Mark the house as accepted if we have a house ID
    if (houseId) {
      try {
        // Import the markHouseAsAccepted function
        const { markHouseAsAccepted } = await import('@/utils/firestore/house');
        
        // Mark the house as accepted
        await markHouseAsAccepted(houseId);
        console.log('House marked as accepted:', houseId);
      } catch (error) {
        console.error('Error marking house as accepted:', error);
      }
    }
    
    // Here you could add code to:
    // 1. Send the quote to a backend service
    // 2. Store the quote in Firestore
    // 3. Send an email to the customer and/or provider
    // 4. Redirect to a confirmation page
    
    // No alert message - removed to avoid popup
    console.log('Quote accepted! Your provider will contact you soon.');
  };
  
  return {
    quoteItems,
    totalQuoteAmount,
    generateQuote,
    handleQuoteAccept
  };
};
