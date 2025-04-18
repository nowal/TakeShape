'use client';

import React, { useState } from 'react';
import { AddOn } from '@/utils/firestore/house';

interface AddOnConfirmationProps {
  addOn: {
    name: string;
    price: number;
    roomId: string;
    explanation: string;
  };
  onConfirm: (confirmed: boolean) => void;
  onClose: () => void;
}

const AddOnConfirmation: React.FC<AddOnConfirmationProps> = ({ 
  addOn, 
  onConfirm, 
  onClose 
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleConfirm = (confirmed: boolean) => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm(confirmed);
      onClose();
    }, 300);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`addon-confirmation-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="addon-confirmation-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <div className="addon-confirmation-content">
          <h3>Add-on Detected</h3>
          <p>
            I see that you have a <strong>{addOn.name}</strong> in this room, 
            this costs a little extra to handle. Do you want that to be included in the quote?
          </p>
          <p className="addon-price">Additional cost: ${addOn.price.toFixed(2)}</p>
          <div className="addon-confirmation-buttons">
            <button 
              className="addon-confirmation-button confirm" 
              onClick={() => handleConfirm(true)}
            >
              Yes, include it
            </button>
            <button 
              className="addon-confirmation-button reject" 
              onClick={() => handleConfirm(false)}
            >
              No, skip it
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .addon-confirmation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        
        .addon-confirmation-overlay.closing {
          opacity: 0;
        }
        
        .addon-confirmation-modal {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          position: relative;
          transform: translateY(0);
          transition: transform 0.3s ease;
        }
        
        .closing .addon-confirmation-modal {
          transform: translateY(20px);
        }
        
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        .addon-confirmation-content {
          margin-top: 10px;
        }
        
        .addon-confirmation-content h3 {
          margin-top: 0;
          color: #333;
          font-size: 20px;
        }
        
        .addon-price {
          font-weight: bold;
          color: #0066cc;
          margin: 15px 0;
        }
        
        .addon-confirmation-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .addon-confirmation-button {
          padding: 10px 20px;
          border-radius: 4px;
          border: none;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s ease;
          flex: 1;
          margin: 0 5px;
        }
        
        .addon-confirmation-button.confirm {
          background-color: #4CAF50;
          color: white;
        }
        
        .addon-confirmation-button.confirm:hover {
          background-color: #3e8e41;
        }
        
        .addon-confirmation-button.reject {
          background-color: #f44336;
          color: white;
        }
        
        .addon-confirmation-button.reject:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default AddOnConfirmation;
