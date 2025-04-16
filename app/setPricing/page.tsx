'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebase from '@/lib/firebase';
import { PricingRule, PricingSheet } from '@/utils/firestore/pricingSheet';
import { useAccountSettings } from '@/context/account-settings/provider';

export default function SetPricingPage() {
  const router = useRouter();
  const { isPainter } = useAccountSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricingSheet, setPricingSheet] = useState<PricingSheet | null>(null);
  
  // Form state
  const [baseRate, setBaseRate] = useState<number>(0);
  const [minimumCharge, setMinimumCharge] = useState<number>(0);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [newCondition, setNewCondition] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(0);
  
  // Get the current user
  useEffect(() => {
    const auth = getAuth(firebase);
    let authCheckTimeout: NodeJS.Timeout;
    
    // Set up auth state listener to handle auth initialization
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setError('You must be logged in to access this page');
        setIsLoading(false);
        return;
      }
      
      // Add a small delay to ensure isPainter is properly initialized
      authCheckTimeout = setTimeout(async () => {
        if (!isPainter) {
          console.log('isPainter check failed:', isPainter);
          setError('You must be logged in as a painter to access this page');
          setIsLoading(false);
          return;
        }
        
        console.log('isPainter check passed:', isPainter);
        // Fetch the pricing sheet once we have confirmed auth
        await fetchPricingSheet(user);
      }, 500); // 500ms delay to ensure isPainter is initialized
    });
    
    // Clean up the auth listener and timeout on unmount
    return () => {
      unsubscribe();
      if (authCheckTimeout) clearTimeout(authCheckTimeout);
    };
  }, [isPainter]);
  
  // Fetch the pricing sheet
  const fetchPricingSheet = async (user: User) => {
    try {
      const response = await fetch(`/api/pricingSheet?userId=${user.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPricingSheet(data.pricingSheet);
        setBaseRate(data.pricingSheet.baseRate);
        setMinimumCharge(data.pricingSheet.minimumCharge || 0);
        setRules(data.pricingSheet.rules || []);
      } else if (response.status === 404) {
        // No pricing sheet found, create a new one
        setPricingSheet(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch pricing sheet');
      }
    } catch (err) {
      console.error('Error fetching pricing sheet:', err);
      setError('Failed to fetch pricing sheet. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save the pricing sheet
  const savePricingSheet = async () => {
    try {
      setIsLoading(true);
      
      const auth = getAuth(firebase);
      const user = auth.currentUser;
      
      if (!user) {
        setError('You must be logged in to save your pricing sheet');
        setIsLoading(false);
        return;
      }
      
      const action = pricingSheet ? 'update' : 'create';
      
      const response = await fetch('/api/pricingSheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          action,
          data: action === 'create' 
            ? { baseRate, minimumCharge } 
            : { pricingSheet: { ...pricingSheet, baseRate, minimumCharge, rules } }
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPricingSheet(data.pricingSheet);
        alert('Pricing sheet saved successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save pricing sheet');
      }
    } catch (err) {
      console.error('Error saving pricing sheet:', err);
      setError('Failed to save pricing sheet. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new rule
  const addRule = async () => {
    console.log('Add rule button clicked');
    console.log('Condition:', newCondition);
    console.log('Amount:', newAmount);
    
    if (!newCondition || newAmount === 0) {
      alert('Please enter a condition and amount');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      const auth = getAuth(firebase);
      const user = auth.currentUser;
      
      if (!user) {
        setError('You must be logged in to add a rule');
        setIsLoading(false);
        return;
      }
      
      console.log('User ID:', user.uid);
      console.log('Current pricing sheet:', pricingSheet);
      
      // If no pricing sheet exists yet, create one first
      if (!pricingSheet) {
        console.log('No pricing sheet found, creating one first');
        try {
          // Save the pricing sheet first
          await savePricingSheet();
          
          // Fetch the newly created pricing sheet
          const fetchResponse = await fetch(`/api/pricingSheet?userId=${user.uid}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (fetchResponse.ok) {
            const data = await fetchResponse.json();
            setPricingSheet(data.pricingSheet);
            setBaseRate(data.pricingSheet.baseRate);
            setMinimumCharge(data.pricingSheet.minimumCharge || 0);
            setRules(data.pricingSheet.rules || []);
          } else {
            throw new Error('Failed to fetch pricing sheet after creation');
          }
        } catch (err) {
          console.error('Error creating pricing sheet:', err);
          setError('Failed to create pricing sheet. Please try again.');
          setIsLoading(false);
          return;
        }
      }
      
      console.log('Sending request to add rule');
      const response = await fetch('/api/pricingSheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          action: 'addRule',
          data: {
            condition: newCondition,
            amount: newAmount
          }
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Rule added successfully, updated pricing sheet:', data.pricingSheet);
        
        // Update the state with the new pricing sheet data
        setPricingSheet(data.pricingSheet);
        setRules(data.pricingSheet.rules || []);
        
        // Clear the form fields
        setNewCondition('');
        setNewAmount(0);
        
        // Show success message
        alert('Rule added successfully!');
      } else {
        // Try to parse the error response
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          setError(errorData.error || 'Failed to add rule');
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          setError(`Failed to add rule. Server returned status ${response.status}`);
        }
      }
    } catch (err) {
      console.error('Error adding rule:', err);
      setError('Failed to add rule. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove a rule
  const removeRule = async (ruleId: string) => {
    try {
      setIsLoading(true);
      
      const auth = getAuth(firebase);
      const user = auth.currentUser;
      
      if (!user) {
        setError('You must be logged in to remove a rule');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/pricingSheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          action: 'removeRule',
          data: {
            ruleId
          }
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPricingSheet(data.pricingSheet);
        setRules(data.pricingSheet.rules);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove rule');
      }
    } catch (err) {
      console.error('Error removing rule:', err);
      setError('Failed to remove rule. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Set Pricing</h1>
        <button
          onClick={() => router.push('/providerDashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Base Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Base Rate (per square foot)</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">$</span>
                  <input
                    type="number"
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Minimum Charge</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">$</span>
                  <input
                    type="number"
                    value={minimumCharge}
                    onChange={(e) => setMinimumCharge(Number(e.target.value))}
                    step="1"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={savePricingSheet}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Base Pricing
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing Rules</h2>
            <p className="text-gray-600 mb-4">
              Add rules to adjust pricing based on specific conditions. For example, "If the room has a tray ceiling, add $150 to the quote."
            </p>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">If...</label>
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="e.g., the room has a tray ceiling"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Add Amount</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      step="1"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={addRule}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-bold text-lg border-2 border-blue-700 shadow-md w-full md:w-auto"
              >
                + Add Rule
              </button>
            </div>
            
            {rules.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Current Rules</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="text-gray-800">If {rule.condition}, add ${rule.amount.toFixed(2)} to the quote</p>
                      </div>
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No rules added yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
