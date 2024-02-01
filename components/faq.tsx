'use client';

import React, { useState } from 'react';

const faqData = [
  { question: "How does the quote process work?", answer: "Upload a video of the space you want painted, and our platform will provide you with guaranteed quotes from local, reputable painters." },
  { question: "How long does it take to get a quote?", answer: "After uploading your video, you'll receive quotes within 24 hours." },
  { question: "Can I choose my own paint colors?", answer: "Absolutely! You're free to choose your preferred paint colors. Just let the painters know your choice." },
  { question: "Is there a cost for getting quotes?", answer: "No, the quote process is completely free. You only pay for the painting service you decide to use." },
  { question: "What if I'm not satisfied with the work?", answer: "Our painters are committed to quality. If you're not satisfied, please contact us, and we'll work with you to address any concerns." }
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-section py-8">
      <h2 className="text-center text-3xl font-bold mb-6 underline">Frequently Asked Questions</h2>
      <div className="mx-auto max-w-3xl">
        {faqData.map((faq, index) => (
          <div key={index} className="mb-4">
            <button
              onClick={() => handleToggle(index)}
              className="w-full text-left text-xl font-semibold py-2"
            >
              {faq.question}
            </button>
            <div
              className={`answer text-lg py-2 ${activeIndex === index ? 'block' : 'hidden'}`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .faq-section {
        /* Adjust the color as needed */
        }
        .answer {
          transition: all 0.3s ease-in-out;
        }
        .bg-pale-pink {
          background-color: #D0AD9F; /* Adjust the color as needed */
          width: 100%;
        }
        /* ... (rest of your styles) ... */
      `}</style>
    </div>
  );
};

export default FAQSection;
