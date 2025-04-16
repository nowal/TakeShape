import { NextRequest, NextResponse } from 'next/server';
import { 
  getPricingSheetByProviderId, 
  createPricingSheet, 
  updatePricingSheet,
  addPricingRule,
  updatePricingRule,
  removePricingRule,
  updateBaseRate,
  updateMinimumCharge,
  PricingSheet
} from '@/utils/firestore/pricingSheet';
import { getPainterByUserId } from '@/utils/firestore/painter';

/**
 * GET handler to retrieve a pricing sheet
 */
export async function GET(request: NextRequest) {
  try {
    // Get the parameters from the query
    const { searchParams } = new URL(request.url);
    const painterId = searchParams.get('painterId');
    const userId = searchParams.get('userId');
    
    console.log('GET request received:', { painterId, userId });
    
    let providerId: string | undefined;
    
    if (painterId) {
      // If painterId is provided, use it directly
      providerId = painterId;
    } else if (userId) {
      // If userId is provided, get the painter by user ID
      console.log('Looking up painter by user ID:', userId);
      const painter = await getPainterByUserId(userId as string);
      if (!painter) {
        console.log('Painter not found for user ID:', userId);
        return NextResponse.json({ error: 'Painter not found for this user' }, { status: 404 });
      }
      console.log('Found painter:', painter);
      providerId = painter.id;
    } else {
      return NextResponse.json({ error: 'Either painterId or userId is required' }, { status: 400 });
    }
    
    // Ensure providerId is defined
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID could not be determined' }, { status: 400 });
    }
    
    // Get the pricing sheet
    console.log('Getting pricing sheet for provider ID:', providerId);
    const pricingSheet = await getPricingSheetByProviderId(providerId);
    console.log('Pricing sheet found:', pricingSheet);
    
    // If no pricing sheet exists, create a default one
    if (!pricingSheet) {
      console.log('No pricing sheet found, creating default one');
      // Create a default pricing sheet with base values
      const defaultPricingSheet = await createPricingSheet(
        providerId,
        5.0, // Default base rate of $5 per square foot
        500  // Default minimum charge of $500
      );
      
      console.log('Default pricing sheet created:', defaultPricingSheet);
      return NextResponse.json({ pricingSheet: defaultPricingSheet });
    }
    
    return NextResponse.json({ pricingSheet });
  } catch (error) {
    console.error('Error getting pricing sheet:', error);
    return NextResponse.json({ error: 'Failed to get pricing sheet' }, { status: 500 });
  }
}

/**
 * POST handler to create or update a pricing sheet
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, action, data } = body;
    
    console.log('POST request received:', { userId, action, data });
    
    if (!userId) {
      console.log('Error: User ID is required');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!action) {
      console.log('Error: Action is required');
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }
    
    // Get the painter associated with this user
    console.log('Looking up painter by user ID:', userId);
    const painter = await getPainterByUserId(userId as string);
    if (!painter) {
      console.log('Painter not found for user ID:', userId);
      return NextResponse.json({ error: 'Painter not found' }, { status: 404 });
    }
    console.log('Found painter:', painter);
    
    let pricingSheet: PricingSheet | null;
    
    switch (action) {
      case 'create':
        if (!data || data.baseRate === undefined) {
          return NextResponse.json({ error: 'Missing baseRate' }, { status: 400 });
        }
        
        pricingSheet = await createPricingSheet(
          painter.id!,
          Number(data.baseRate),
          data.minimumCharge !== undefined ? Number(data.minimumCharge) : undefined
        );
        break;
        
      case 'update':
        if (!data || !data.pricingSheet) {
          return NextResponse.json({ error: 'Missing pricingSheet' }, { status: 400 });
        }
        
        // Ensure the pricing sheet belongs to this painter
        if (data.pricingSheet.providerId !== painter.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        pricingSheet = await updatePricingSheet(data.pricingSheet as PricingSheet);
        break;
        
      case 'addRule':
        if (!data || !data.condition || data.amount === undefined) {
          console.log('Missing rule data:', data);
          return NextResponse.json({ error: 'Missing rule data' }, { status: 400 });
        }
        
        console.log('Adding rule:', {
          painterId: painter.id,
          condition: data.condition,
          amount: Number(data.amount)
        });
        
        try {
          pricingSheet = await addPricingRule(
            painter.id!,
            data.condition as string,
            Number(data.amount)
          );
          console.log('Rule added successfully, updated pricing sheet:', pricingSheet);
        } catch (error) {
          console.error('Error adding rule:', error);
          throw error;
        }
        break;
        
      case 'updateRule':
        if (!data || !data.ruleId || !data.condition || data.amount === undefined) {
          return NextResponse.json({ error: 'Missing rule data' }, { status: 400 });
        }
        
        pricingSheet = await updatePricingRule(
          painter.id!,
          data.ruleId as string,
          data.condition as string,
          Number(data.amount)
        );
        break;
        
      case 'removeRule':
        if (!data || !data.ruleId) {
          return NextResponse.json({ error: 'Missing ruleId' }, { status: 400 });
        }
        
        pricingSheet = await removePricingRule(
          painter.id!,
          data.ruleId as string
        );
        break;
        
      case 'updateBaseRate':
        if (!data || data.baseRate === undefined) {
          return NextResponse.json({ error: 'Missing baseRate' }, { status: 400 });
        }
        
        pricingSheet = await updateBaseRate(
          painter.id!,
          Number(data.baseRate)
        );
        break;
        
      case 'updateMinimumCharge':
        if (!data || data.minimumCharge === undefined) {
          return NextResponse.json({ error: 'Missing minimumCharge' }, { status: 400 });
        }
        
        pricingSheet = await updateMinimumCharge(
          painter.id!,
          Number(data.minimumCharge)
        );
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ pricingSheet });
  } catch (error) {
    console.error('Error updating pricing sheet:', error);
    return NextResponse.json({ error: 'Failed to update pricing sheet' }, { status: 500 });
  }
}
