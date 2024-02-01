'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import happyPic from '../../public/TakeShapeHappyPic.png';
import takingVideo from '../../public/takingVideo.jpg';
import muddyBoots from '../../public/muddyBoots.jpeg'
import QuoteButton from '../../components/quoteButton';
import Faq from '../../components/faq';

export default function Home() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [emailForSubscription, setEmailForSubscription] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (imageUrls.length >= 1) { // Replace 1 with the number of images you require
      sessionStorage.setItem('uploadedImageUrls', JSON.stringify(imageUrls));
      console.log("hello");
      router.push('/signup');
    }
  }, [imageUrls, router]);

  const handleSubscription = () => {
    console.log("Subscribed with Email:", emailForSubscription);
    // Implement subscription logic here
    setEmailForSubscription(''); // Clear the input field after subscribing
  };

  return (
    <div className= "bg-floral-white pt-20">
      {/* First Section */}
      <main className="pt-8 container mx-auto px-4 flex flex-col md:flex-row gap-8 mb-2">
        {/* Text Section */}
        <div className="flex flex-col w-full md:w-1/2 justify-center md:mt-24">
          <h1 className="text-4xl font-bold mb-4 text-center md:text-left">Love the walls you're with</h1>
          <p className="text-xl mb-8 text-center md:text-left">Your home, your style, your terms. Connect with local painters with one video and transform your space into one you're proud of</p>
          <div className="flex justify-center md:justify-start">
            <QuoteButton text="Get Quote" className='py-3 px-5 text-xl'/>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex justify-center items-center w-full md:w-3/5">
          <img 
            src={happyPic.src} 
            alt="Happy Pic"
            className="image-shadow max-w-sm md:max-w-md w-full h-auto object-contain rounded-xl"
          />
        </div>
      </main>

      {/* Second Section */}
      <div className="container mx-auto px-4">
  <main className="pt-16 flex flex-col md:flex-row-reverse gap-6 items-center">
    {/* Text Section */}
    <div className="flex flex-col w-full md:w-3/5 mt-8 md:mt-32">
      <h1 className="text-3xl font-bold mb-3 text-center md:text-left">Getting painting quotes is a hassle</h1>
      <p className="text-lg mb-6 text-center md:text-left">Skip the in-home estimates and secure competitive painting quotes instantly with our hassle-free video upload feature.</p>
    </div>
    
    {/* Image Section - The default order here will be below the text on small screens */}
    <div className="w-full md:w-2/5 flex justify-center items-center mt-8 md:mt-0">
      <img 
        src={muddyBoots.src} 
        alt="Room Photo"
        className="image-shadow w-4/5 max-w-md md:h-auto md:min-h-[20rem] object-cover rounded-xl"
      />
    </div>
  </main>
</div>

{/* Third Section */}
<div className="container mx-auto px-4 mb-40">
  <main className="pt-16 flex flex-col md:flex-row gap-6 items-center">
    {/* Text Section */}
    <div className="flex flex-col w-full md:w-3/5 mt-8 md:mt-32">
      <h1 className="text-3xl font-bold mb-3 text-center md:text-left">Get quotes in a couple of clicks</h1>
      <p className="text-lg mb-6 text-center md:text-left">Our platform simplifies the quotation process, enabling you to receive transparent pricing from local painters without the wait.</p>
    </div>

    {/* Image Section */}
    <div className="w-full md:w-2/5 flex justify-center items-center mt-8 md:mt-0">
      <img 
        src={takingVideo.src} 
        alt="takingVideo"
        className="image-shadow w-4/5 max-w-md md:h-auto md:min-h-[20rem] object-cover rounded-xl"
      />
    </div>
  </main>
</div>

<div className="how-it-works container mx-auto px-4">
  <h1 className="text-4xl font-bold text-center">How it works</h1>
  <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-4 lg:gap-20">
    {/* Step 1 */}
    <div className="step-box secondary-color p-4 rounded-xl w-64">
      <h2 className="text-2xl font-semibold mb-2">Upload Your Video</h2>
      <p className="text-lg">
        Capture a video of your space and upload it. It's the first step to transforming your home.
      </p>
    </div>

    {/* Arrow */}
    <div className="arrow hidden sm:flex justify-center items-center sm:w-12 md:w-16 text-4xl font-bold text-gray-500">&rarr;</div>

    {/* Step 2 */}
    <div className="step-box secondary-color p-4 rounded-xl w-64">
      <h2 className="text-2xl font-semibold mb-2">Receive Quotes</h2>
      <p className="text-lg">
        Local painters will see your video and provide you with their best prices.
      </p>
    </div>

    {/* Arrow */}
    <div className="arrow hidden sm:flex justify-center items-center sm:w-12 md:w-16 text-4xl font-bold text-gray-500">&rarr;</div>

    {/* Step 3 */}
    <div className="step-box secondary-color p-4 rounded-xl w-64">
      <h2 className="text-2xl font-semibold mb-2">Approve & Transform</h2>
      <p className="text-lg">
        Review the quotes, approve the price, and watch as your space is transformed.
      </p>
    </div>
  </div>
</div>

<main className="flex flex-col items-center mb-24 container mx-auto px-4">
  {/* Centered VBox */}
  <div className="flex flex-col w-full lg:w-4/5 text-center mt-40">
    <h1 className="text-4xl font-bold mb-8">Your dream room is only a few clicks away</h1>
    <QuoteButton text="Get Quote Now" className='py-3 px-5 text-xl'/>
  </div>
</main>

<Faq/>

      {/* Third Section */}
      <main className="secondary-color w-full pt-16 pb-8 flex flex-col sm:flex-row gap-6 items-center justify-start px-4">
        {/* Left Text */}
        <div className="flex-1 min-w-0 max-w-2xl mx-auto sm:mx-0"> {/* Center the content for small screens and align left for larger screens */}
          <h1 className="ml-32 text-3xl font-bold mb-3 sm:mb-0">Keep up to date on our services:</h1>
        </div>

        {/* Right Subscription Box */}
        <div className="flex gap-4 items-center">
          <input
            type="email"
            value={emailForSubscription}
            onChange={(e) => setEmailForSubscription(e.target.value)}
            placeholder="Email address"
            className="p-2 border rounded w-full sm:w-auto"
          />
          <button onClick={handleSubscription} className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
            Subscribe
          </button>
        </div>
      </main>
      
      <style jsx>{`
        .bg-pale-pink {
          background-color: #F7E4DE; /* Adjust the color as needed */
          width: 100%;
        }
        /* ... (rest of your styles) ... */
        .how-it-works {
          margin-top: 50px;
        }
        .step-box {
          text-align: center;
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
          transition: 0.3s;
          background-color: secondary-color
        }
        .arrow {
          align-self: center;
        }
        .image-shadow {
          box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

