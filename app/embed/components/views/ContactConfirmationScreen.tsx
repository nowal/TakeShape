'use client';

import React, { FC } from 'react';
import { Painter } from '@/utils/firestore/painter';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';

// Define the different modes for the confirmation screen
export type ConfirmationMode = 'inHomeEstimate' | 'quoteAccepted' | 'earlyScanExit' | 'quoteAcceptedNew' | 'introCall' | 'quoteDisliked' | 'custom';

interface ContactConfirmationScreenProps {
  isVisible: boolean;
  mode: ConfirmationMode;
  homeownerName?: string;
  businessName?: string;
  primaryColor?: string;
  customMessage?: string;
  painter?: Painter | null;
  onClose?: () => void;
}

/**
 * Reusable contact confirmation screen with different modes
 */
const ContactConfirmationScreen: FC<ContactConfirmationScreenProps> = ({
  isVisible,
  mode,
  homeownerName = '',
  businessName,
  primaryColor = PRIMARY_COLOR_HEX,
  customMessage,
  painter,
  onClose
}) => {
  if (!isVisible) return null;

  // Use the primary color for buttons
  const buttonStyle = {
    backgroundColor: primaryColor,
  };

  // Get the appropriate message based on the mode
  const getMessage = () => {
    const businessNameDisplay = businessName || painter?.businessName || 'our team';
    
    switch (mode) {
      case 'inHomeEstimate':
        return (
          <>
            <p className="mb-4">
              Sounds good! I&apos;ll have someone call to schedule an estimate ASAP.
            </p>
            <p>
              In the meantime, I&apos;ll text you a link that you can use to get the guaranteed instant quote if you decide to try it.
            </p>
          </>
        );
      case 'earlyScanExit':
        return (
          <>
            <p className="mb-4">
              No worries on finishing the scan! I&apos;ll have someone call to schedule an estimate.
            </p>
            <p>
              I&apos;ll have someone reach out to you ASAP about an in-home estimate.
            </p>
          </>
        );
      case 'quoteAccepted':
        return (
          <>
            <p className="mb-4">
              Thank you for accepting your quote! A representative from {businessNameDisplay} will contact you shortly to schedule your service.
            </p>
            <p>
              If you have any questions in the meantime, please don&apos;t hesitate to reach out.
            </p>
          </>
        );
      case 'quoteAcceptedNew':
        return (
          <>
            <p className="mb-4">
              We&apos;re excited to work with you! {businessNameDisplay} will reach out at their next available moment and schedule your service so be on the lookout.
            </p>
            <p>
              Thanks!
            </p>
          </>
        );
      case 'introCall':
        return (
          <>
            <p className="mb-4">
              We&apos;ll reach out to you ASAP for the intro call so be on the lookout!
            </p>
            <p>
              A representative from {businessNameDisplay} will be in touch shortly.
            </p>
          </>
        );
      case 'quoteDisliked':
        return (
          <>
            <p className="mb-4">
              I&apos;ll have {businessNameDisplay} see what we can do and reach out at their next available moment.
            </p>
            <p>
              Thank you for your feedback. We&apos;re committed to finding a solution that works for you.
            </p>
          </>
        );
      case 'custom':
        return <p>{customMessage}</p>;
      default:
        return <p>Thank you for your submission. We&apos;ll be in touch soon!</p>;
    }
  };

  return (
    <div className="view confirmation-screen">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === 'inHomeEstimate' ? 'In-Home Estimate Scheduled' : 
           mode === 'earlyScanExit' ? 'In-Home Estimate Scheduled' :
           mode === 'quoteAccepted' || mode === 'quoteAcceptedNew' ? 'Quote Accepted' : 
           mode === 'introCall' ? 'Intro Call Scheduled' :
           mode === 'quoteDisliked' ? 'Feedback Received' : 'Thank You'}
        </h2>
        
        <div className="mb-6 text-lg">
          {getMessage()}
        </div>
        
        {onClose && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="py-3 px-6 rounded-md text-white font-medium transition duration-300 hover:opacity-90"
              style={buttonStyle}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactConfirmationScreen;
