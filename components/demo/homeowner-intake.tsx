'use client';

import React, { useState } from 'react';
import { useSession } from '@/context/session/provider';
import { createHomeowner } from '@/utils/firestore/homeowner';
import { createHouse } from '@/utils/firestore/house';
import { addHouseToHomeowner } from '@/utils/firestore/homeowner';

interface HomeownerIntakeProps {
  onComplete: () => void;
}

export const HomeownerIntake: React.FC<HomeownerIntakeProps> = ({ onComplete }) => {
  const { sessionId, setHomeownerId, setHouseId } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Simple validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Homeowner intake form submitted');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Creating homeowner with data:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      
      // Create homeowner
      const homeowner = await createHomeowner({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      console.log('Homeowner created successfully:', homeowner);
      
      // Create house
      console.log('Creating house with data:', {
        address: formData.address,
        homeownerId: homeowner.id
      });
      const house = await createHouse({
        address: formData.address,
        homeownerId: homeowner.id!
      });
      console.log('House created successfully:', house);
      
      // Add house to homeowner
      console.log('Adding house to homeowner:', {
        homeownerId: homeowner.id,
        houseId: house.id
      });
      await addHouseToHomeowner(homeowner.id!, house.id!);
      
      // Update session
      console.log('Updating session with homeowner and house IDs');
      await setHomeownerId(homeowner.id!);
      await setHouseId(house.id!);
      
      // Complete the intake process
      console.log('Homeowner intake complete, transitioning to camera view');
      onComplete();
    } catch (error) {
      console.error('Error submitting homeowner data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome to 3D Room Scanner</h2>
      <p className="mb-6 text-gray-600">
        Please provide your information to get started with creating your 3D room models.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="(123) 456-7890"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Home Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="123 Main St, City, State, ZIP"
          />
          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#ff385c] text-white py-2 px-4 rounded-md hover:opacity-90 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Get Started'}
        </button>
      </form>
    </div>
  );
};

export default HomeownerIntake;
