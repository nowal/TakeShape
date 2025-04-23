import { FC, useState } from 'react';
import { QuoteItem } from '@/app/demo/types';
import { Painter } from '@/utils/firestore/painter';

interface QuoteViewProps {
  isVisible: boolean;
  quoteItems: QuoteItem[];
  totalQuoteAmount: number;
  painter: Painter | null;
  onAcceptQuote: () => void;
  onScheduleIntroCall?: () => void;
  onQuoteFeedback?: (feedback: string) => void;
}

/**
 * Quote view component for displaying and accepting quotes
 */
const QuoteView: FC<QuoteViewProps> = ({
  isVisible,
  quoteItems,
  totalQuoteAmount,
  painter,
  onAcceptQuote,
  onScheduleIntroCall,
  onQuoteFeedback
}) => {
  // State for feedback text area
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  return (
    <div className={`view quote-view ${isVisible ? '' : 'hidden'}`}>
      <div className="quote-header">
        <h2>Your Quote from {painter?.businessName || 'Your Provider'}:</h2>
      </div>
      
      <div className="quote-items">
        {quoteItems.map((item, index) => (
          <div key={index} className="quote-item">
            <span className="quote-item-description">{item.description}</span>
            <span className="quote-item-amount">${item.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="quote-total">
        <span className="quote-total-label">Total:</span>
        <span className="quote-total-amount">${totalQuoteAmount.toFixed(2) || '0.00'}</span>
      </div>
      
      {/* Action buttons */}
      <div className="quote-actions">
        <button 
          className="accept-quote-button" 
          onClick={onAcceptQuote}
        >
          Accept Quote
        </button>
        
        {onScheduleIntroCall && (
          <button 
            className="intro-call-button" 
            onClick={onScheduleIntroCall}
          >
            Schedule an Intro Call
          </button>
        )}
        
        {onQuoteFeedback && (
          <button 
            className="dislike-quote-button" 
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          >
            I Don&apos;t Like My Quote
          </button>
        )}
      </div>
      
      {/* Feedback form */}
      {showFeedbackForm && onQuoteFeedback && (
        <div className="feedback-form">
          <textarea
            className="feedback-textarea"
            placeholder="Please tell us what you don&apos;t like about your quote..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
          />
          <div className="feedback-submit-container">
            <button 
              className="feedback-submit-button"
              onClick={() => {
                if (feedbackText.trim()) {
                  onQuoteFeedback(feedbackText);
                  setShowFeedbackForm(false);
                  setFeedbackText('');
                }
              }}
              disabled={!feedbackText.trim()}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteView;
