'use client';

import { GENERIC_ERROR_MESSAGE } from '@/constants/errors';
import console from 'console';
// Assuming this is a React component in your Next.js application
import React, { useState, useRef } from 'react';

const Luma3DModelPage = () => {
  const apiKey =
    'b4266b2e-7278-4a91-920c-91e36147b0d4-c77e58e-deb2-4aec-87b3-21eea12b8170'; // Replace with your actual API key
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hardcodedSlug =
    '34ae8ee5-99a8-43eb-97cc-c7e485284479';

  // Step 1: Capture
  const createCapture = async () => {
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      `luma-api-key=${apiKey}`
    );
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      title: 'content type change',
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow', // This now correctly uses one of the 'RequestRedirect' type values
    };

    try {
      const response = await fetch(
        'https://webapp.engineeringlumalabs.com/api/v2/capture',
        requestOptions
      );
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      const errorMessage = GENERIC_ERROR_MESSAGE;
      console.error(errorMessage, error);
    }
  };

  const uploadVideo = async (
    uploadUrl: string,
    file: Blob
  ) => {
    const requestOptions: RequestInit = {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'application/octet-stream',
      }, // Assuming 'file' is a Blob or File object
      // Removed 'redirect' since it's not typically used with 'PUT' requests
    };

    try {
      console.log(file);
      const response = await fetch(
        uploadUrl,
        requestOptions
      );
      const result = await response.text();
      console.log(result);
    } catch (error) {
      const errorMessage = GENERIC_ERROR_MESSAGE;

      console.error('error', error);
    }
  };
  const triggerCapture = async (slug: string) => {
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      `luma-api-key=${apiKey}`
    );

    try {
      const response = await fetch(
        `https://webapp.engineeringlumalabs.com/api/v2/capture/${slug}`,
        {
          method: 'POST',
          headers: myHeaders,
        }
      );
      const result = await response.text();
      console.log('Trigger capture response:', result);
    } catch (error) {
      console.error('Error triggering capture:', error);
    }
  };

  const checkCaptureStatus = async () => {
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      `luma-api-key=${apiKey}`
    );

    try {
      const response = await fetch(
        `https://webapp.engineeringlumalabs.com/api/v2/capture/${hardcodedSlug}`,
        {
          method: 'GET',
          headers: myHeaders,
        }
      );
      const result = await response.json();
      console.log('Capture status:', result);
    } catch (error) {
      console.error(
        'Error checking capture status:',
        error
      );
    }
  };

  const downloadCapture = async () => {
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      `luma-api-key=${apiKey}`
    );

    try {
      const response = await fetch(
        `https://webapp.engineeringlumalabs.com/api/v2/download/${hardcodedSlug}`,
        {
          method: 'GET',
          headers: myHeaders,
        }
      );
      if (!response.ok)
        throw new Error('Network response was not ok.');

      // Assuming the response is a direct URL to the file:
      const downloadUrl = await response.text();
      console.log('Download URL:', downloadUrl);

      // Programmatically trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'capture_download'; // Optional: Set the file name for the download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading capture:', error);
    }
  };

  const handleCaptureAndUpload = async () => {
    if (
      fileInputRef.current &&
      fileInputRef.current.files &&
      fileInputRef.current.files.length > 0
    ) {
      const file = fileInputRef.current.files[0]; // Get the first file from the file input
      const captureData = await createCapture();
      if (
        captureData &&
        captureData.signedUrls &&
        captureData.signedUrls.source &&
        captureData.capture &&
        captureData.capture.slug
      ) {
        await uploadVideo(
          captureData.signedUrls.source,
          file
        );
        await triggerCapture(captureData.capture.slug); // Trigger the capture using the returned slug
        // Proceed with further actions, like notifying the server that the upload and trigger are complete
      }
    } else {
      console.log('No file selected');
    }
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} />
      <button onClick={() => handleCaptureAndUpload()}>
        Create Capture
      </button>{' '}
      {/* Adjusted onClick */}
      <button onClick={() => checkCaptureStatus()}>
        Check Capture Status
      </button>
      <button onClick={() => downloadCapture()}>
        Download Capture
      </button>
      {/*<iframe src="https://lumalabs.ai/embed/f7692cee-beac-4d8e-9ab2-7a5e5ce8edbe?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=true&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false" width="893" height="500" title="luma embed"></iframe>
       */}
    </div>
  );
};

export default Luma3DModelPage;
