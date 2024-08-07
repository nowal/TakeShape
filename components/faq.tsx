'use client';

import React, { useState } from 'react';

const faqData = [
  { question: "Can I speak with a painter before accepting a quote?", answer: "Yes! We provide the phone number for each painter so that you can speak with them directly. The beauty is that you don't have to until you want to." },
  { question: "How long does it take to get a quote?", answer: "You can get a quote within minutes of your submission, depending on painter availability. Typically, it takes one to two business days to get three quotes back." },
  { question: "What if I'm not happy with the work?", answer: "We will work with your painter to ensure that you are completely satisfied and will even pay for another painter to fix any unresolved mistakes." },
  { question: "Is there a cost for getting quotes?", answer: "Nope, the quote process is completely free!" },
  { question: "Is the price guaranteed or is it subject to change?", answer: "We are able to get extremely accurate quotes with your one video. The price can shift slightly if something is not clear from the video, but unlike in person estimates, you have a video record of what was visible." }
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
              className="w-full text-left text-xl font-semibold py-2 flex justify-between items-center"
            >
              <span>{faq.question}</span>
              <span>{activeIndex === index ? '▲' : '▼'}</span>
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
