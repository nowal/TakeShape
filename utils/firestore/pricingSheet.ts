import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Collection name
const PRICING_SHEETS_COLLECTION = 'pricingSheets';

// Pricing rule interface
export interface PricingRule {
  id: string;         // Unique identifier for the rule
  condition: string;  // e.g., "if the room has a tray ceiling"
  amount: number;     // e.g., 150 (dollars to add)
}

// Pricing sheet interface
export interface PricingSheet {
  id: string;
  providerId: string;
  baseRate: number;   // Price per square foot
  perRoom?: number;   // Price per room
  minimumCharge?: number; // Optional minimum charge
  rules: PricingRule[];
  lastUpdated: Date | Timestamp;
}

/**
 * Get a pricing sheet by provider ID
 * @param providerId The provider ID
 * @returns The pricing sheet or null if not found
 */
export const getPricingSheetByProviderId = async (providerId: string): Promise<PricingSheet | null> => {
  try {
    // Use the provider ID as the document ID for simplicity
    const pricingSheetRef = doc(db, PRICING_SHEETS_COLLECTION, providerId);
    const pricingSheetSnap = await getDoc(pricingSheetRef);
    
    if (pricingSheetSnap.exists()) {
      return {
        id: pricingSheetSnap.id,
        ...pricingSheetSnap.data()
      } as PricingSheet;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting pricing sheet:', error);
    throw error;
  }
};

/**
 * Create a new pricing sheet
 * @param providerId The provider ID
 * @param baseRate The base rate per square foot
 * @param minimumCharge Optional minimum charge
 * @returns The created pricing sheet
 */
export const createPricingSheet = async (
  providerId: string, 
  baseRate: number,
  minimumCharge?: number
): Promise<PricingSheet> => {
  try {
    // Use the provider ID as the document ID for simplicity
    const pricingSheetRef = doc(db, PRICING_SHEETS_COLLECTION, providerId);
    
    const pricingSheetData = {
      providerId,
      baseRate,
      minimumCharge: minimumCharge || 0,
      rules: [],
      lastUpdated: new Date()
    };
    
    await setDoc(pricingSheetRef, pricingSheetData);
    
    return {
      id: providerId,
      ...pricingSheetData
    } as PricingSheet;
  } catch (error) {
    console.error('Error creating pricing sheet:', error);
    throw error;
  }
};

/**
 * Update a pricing sheet
 * @param pricingSheet The pricing sheet to update
 * @returns The updated pricing sheet
 */
export const updatePricingSheet = async (pricingSheet: PricingSheet): Promise<PricingSheet> => {
  try {
    console.log('updatePricingSheet called with:', pricingSheet);
    
    const pricingSheetRef = doc(db, PRICING_SHEETS_COLLECTION, pricingSheet.id);
    console.log('Pricing sheet reference:', pricingSheetRef);
    
    // Update the lastUpdated timestamp
    const updatedSheet = {
      ...pricingSheet,
      lastUpdated: new Date()
    };
    console.log('Updated sheet with timestamp:', updatedSheet);
    
    // Remove the id field before saving to Firestore
    const { id, ...dataToSave } = updatedSheet;
    console.log('Data to save (without id):', dataToSave);
    
    try {
      await updateDoc(pricingSheetRef, dataToSave);
      console.log('Document updated successfully');
    } catch (updateError) {
      console.error('Error in updateDoc:', updateError);
      throw updateError;
    }
    
    return updatedSheet;
  } catch (error) {
    console.error('Error updating pricing sheet:', error);
    throw error;
  }
};

/**
 * Add a rule to a pricing sheet
 * @param pricingSheetId The pricing sheet ID
 * @param condition The rule condition
 * @param amount The amount to add
 * @returns The updated pricing sheet
 */
export const addPricingRule = async (
  pricingSheetId: string,
  condition: string,
  amount: number
): Promise<PricingSheet> => {
  try {
    console.log('addPricingRule called with:', { pricingSheetId, condition, amount });
    
    const pricingSheet = await getPricingSheetByProviderId(pricingSheetId);
    console.log('Existing pricing sheet:', pricingSheet);
    
    if (!pricingSheet) {
      console.error('Pricing sheet not found for ID:', pricingSheetId);
      throw new Error('Pricing sheet not found');
    }
    
    // Create a new rule with a unique ID
    const ruleId = crypto.randomUUID(); // Generate a unique ID
    console.log('Generated rule ID:', ruleId);
    
    const newRule: PricingRule = {
      id: ruleId,
      condition,
      amount
    };
    console.log('New rule created:', newRule);
    
    // Add the rule to the pricing sheet
    const updatedRules = [...pricingSheet.rules, newRule];
    console.log('Updated rules array:', updatedRules);
    
    // Update the pricing sheet
    const updatedSheet = {
      ...pricingSheet,
      rules: updatedRules,
      lastUpdated: new Date()
    };
    console.log('Updated pricing sheet:', updatedSheet);
    
    const result = await updatePricingSheet(updatedSheet);
    console.log('Result from updatePricingSheet:', result);
    
    return result;
  } catch (error) {
    console.error('Error adding pricing rule:', error);
    throw error;
  }
};

/**
 * Update a rule in a pricing sheet
 * @param pricingSheetId The pricing sheet ID
 * @param ruleId The rule ID
 * @param condition The updated condition
 * @param amount The updated amount
 * @returns The updated pricing sheet
 */
export const updatePricingRule = async (
  pricingSheetId: string,
  ruleId: string,
  condition: string,
  amount: number
): Promise<PricingSheet> => {
  try {
    const pricingSheet = await getPricingSheetByProviderId(pricingSheetId);
    
    if (!pricingSheet) {
      throw new Error('Pricing sheet not found');
    }
    
    // Find the rule
    const ruleIndex = pricingSheet.rules.findIndex(rule => rule.id === ruleId);
    
    if (ruleIndex === -1) {
      throw new Error('Rule not found');
    }
    
    // Update the rule
    const updatedRule: PricingRule = {
      id: ruleId,
      condition,
      amount
    };
    
    // Replace the rule in the array
    const updatedRules = [...pricingSheet.rules];
    updatedRules[ruleIndex] = updatedRule;
    
    // Update the pricing sheet
    const updatedSheet = {
      ...pricingSheet,
      rules: updatedRules,
      lastUpdated: new Date()
    };
    
    return await updatePricingSheet(updatedSheet);
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    throw error;
  }
};

/**
 * Remove a rule from a pricing sheet
 * @param pricingSheetId The pricing sheet ID
 * @param ruleId The rule ID to remove
 * @returns The updated pricing sheet
 */
export const removePricingRule = async (
  pricingSheetId: string,
  ruleId: string
): Promise<PricingSheet> => {
  try {
    const pricingSheet = await getPricingSheetByProviderId(pricingSheetId);
    
    if (!pricingSheet) {
      throw new Error('Pricing sheet not found');
    }
    
    // Filter out the rule to remove
    const updatedRules = pricingSheet.rules.filter(rule => rule.id !== ruleId);
    
    // Update the pricing sheet
    const updatedSheet = {
      ...pricingSheet,
      rules: updatedRules,
      lastUpdated: new Date()
    };
    
    return await updatePricingSheet(updatedSheet);
  } catch (error) {
    console.error('Error removing pricing rule:', error);
    throw error;
  }
};

/**
 * Update the base rate of a pricing sheet
 * @param pricingSheetId The pricing sheet ID
 * @param baseRate The new base rate
 * @returns The updated pricing sheet
 */
export const updateBaseRate = async (
  pricingSheetId: string,
  baseRate: number
): Promise<PricingSheet> => {
  try {
    const pricingSheet = await getPricingSheetByProviderId(pricingSheetId);
    
    if (!pricingSheet) {
      throw new Error('Pricing sheet not found');
    }
    
    // Update the base rate
    const updatedSheet = {
      ...pricingSheet,
      baseRate,
      lastUpdated: new Date()
    };
    
    return await updatePricingSheet(updatedSheet);
  } catch (error) {
    console.error('Error updating base rate:', error);
    throw error;
  }
};

/**
 * Update the minimum charge of a pricing sheet
 * @param pricingSheetId The pricing sheet ID
 * @param minimumCharge The new minimum charge
 * @returns The updated pricing sheet
 */
export const updateMinimumCharge = async (
  pricingSheetId: string,
  minimumCharge: number
): Promise<PricingSheet> => {
  try {
    const pricingSheet = await getPricingSheetByProviderId(pricingSheetId);
    
    if (!pricingSheet) {
      throw new Error('Pricing sheet not found');
    }
    
    // Update the minimum charge
    const updatedSheet = {
      ...pricingSheet,
      minimumCharge,
      lastUpdated: new Date()
    };
    
    return await updatePricingSheet(updatedSheet);
  } catch (error) {
    console.error('Error updating minimum charge:', error);
    throw error;
  }
};
