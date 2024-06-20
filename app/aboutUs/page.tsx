// AboutUs.js

import profilePic from '../../public/profilePic.jpeg';

const AboutUs = () => {
  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl font-bold leading-9 text-gray-900 sm:text-4xl sm:leading-10 my-6">
        About Us
      </h1>
      <p className="text-base leading-6 text-gray-600">
        Hi, I'm Noah. As a proffesional home-service estimator, 
        I saw how much of a headache it is for homeowners to get quotes for painting.
        I started TakeShape in order to connect homeowners with painters more quickly
        and to provide a space for local painters to offer better pricing.
        As a resident of Murfreesboro, I founded TakeShape with Middle Tennesseans in mind.
        I've partnered with an extensive network of painters in the community, 
        and we are exicted to offer you the best experience for your painting needs.
      </p>
      <div className="flex justify-center mt-8 mb-6">
        <img
          src={profilePic.src}  // Change the src to your image path
          alt="Your Name"
          className="rounded-full shadow-lg" // Tailwind CSS classes for styling
          style={{ width: "200px", height: "200px" }} // Inline styles for image dimensions
        />
      </div>
    </div>
  );
};

export default AboutUs;
