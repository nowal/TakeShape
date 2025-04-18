import { NextRequest, NextResponse } from 'next/server';
import { addAddOnToHouse, AddOn } from '@/utils/firestore/house';

export async function POST(req: NextRequest) {
  try {
    const { houseId, addOn } = await req.json();

    if (!houseId) {
      return NextResponse.json({ error: 'House ID is required' }, { status: 400 });
    }

    if (!addOn || !addOn.name || typeof addOn.price !== 'number' || !addOn.roomId) {
      return NextResponse.json({ 
        error: 'Add-on must include name, price, and roomId' 
      }, { status: 400 });
    }

    // Add the add-on to the house
    const updatedHouse = await addAddOnToHouse(houseId, addOn as AddOn);

    return NextResponse.json({ 
      success: true, 
      house: updatedHouse 
    });
  } catch (error) {
    console.error('Error adding add-on to house:', error);
    return NextResponse.json(
      { error: 'Failed to add add-on to house' },
      { status: 500 }
    );
  }
}
