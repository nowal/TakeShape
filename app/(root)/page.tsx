'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import happyPic from '../../public/TakeShapeHappyPic.png';
import takingVideo from '../../public/takingvideo.jpg';
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
      <main className="pt-8 flex flex-col sm:flex-row gap-8 mb-2 container mx-auto px-4">
        {/* Left VBox */}
        <div className="flex flex-col w-full lg:w-1/2 mt-40">
          <h1 className="text-4xl font-bold mb-4">Love the walls you're with</h1>
          <h1 className="text-xl mb-8">Your home, your style, your terms. Connect with local painters with one video and transform your space into one you're proud of</h1>
          <QuoteButton text="Get Quote" className='py-3 px-5 text-xl'/>
        </div>

        {/* Right Image Box */}
        <div className="w-full lg:w-3/5 flex justify-center items-center ml-8 box-">
          <img 
            src={happyPic.src} 
            alt="Happy Pic"
            className="image-shadow w-full max-w-sm lg:max-w-md h-auto object-contain rounded-xl"
          />
        </div>
      </main>

      {/* Second Section */}
      <div className="container mx-auto px-4 container mx-auto px-4">
        <main className="pt-16 flex flex-col sm:flex-row gap-6">
          {/* Left Image Box */}
          <div className="w-full sm:w-2/5 flex justify-center items-center">
            <img 
              src={muddyBoots.src} 
              alt="Room Photo"
              className="image-shadow w-4/5 max-w-md h-auto object-cover rounded-xl"
              style={{ aspectRatio: '1 / 1' }}
            />
          </div>

          {/* Right VBox */}
          <div className="flex flex-col w-full sm:w-3/5 mt-32 sm:mt-32 sm:ml-4">
            <h1 className="text-3xl font-bold mb-3">Getting painting quotes is a hassle</h1>
            <h1 className="text-lg mb-6">TakeShape let's you upload a video of your space and gives you guaranteed quotes from reputable, local painters.</h1>
          </div>
        </main>
      </div>

      <div className="container mx-auto px-4 mb-40">
        <main className="pt-16 flex flex-col sm:flex-row gap-6">
          {/* Left VBox */}
          <div className="flex flex-col w-full sm:w-3/5 mt-32 sm:mt-32 sm:ml-4">
            <h1 className="text-3xl font-bold mb-3">Get quotes within 24</h1>
            <h1 className="text-lg mb-6">TakeShape lets you upload a video of your space and gives you guaranteed quotes from reputable, local painters.</h1>
          </div>

          <div className="w-full sm:w-2/5 flex justify-center items-center">
            <img 
              src={takingVideo.src} 
              alt="takingVideo"
              className="image-shadow w-4/5 max-w-md h-auto object-cover rounded-xl"
              style={{ aspectRatio: '1 / 1' }}
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

