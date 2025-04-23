'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/context/session/provider';
import { getPainter, Painter } from '@/utils/firestore/painter';
import { getPricingSheetByProviderId, PricingSheet } from '@/utils/firestore/pricingSheet';
import { QuoteItem } from '@/app/demo/types';
import Chat from '@/components/chat';
import HomeownerIntake from '@/components/demo/homeowner-intake';
import { useCamera } from '../hooks/useCamera';
import { useRooms } from '../hooks/useRooms';
import { useQuote } from '../hooks/useQuote';
import CameraView from '../components/views/CameraView';
import RoomListView from '../components/views/RoomListView';
import QuoteView from '../components/views/QuoteView';
import StartScreen from '../components/views/StartScreen';
import ContactConfirmationScreen, { ConfirmationMode } from '../components/views/ContactConfirmationScreen';
import '@/app/demo/RoomScanner.css';
import { initializeEmbed, sendCompletionEvent } from '../utils';
import { getHomeowner } from '@/utils/firestore/homeowner';

// Static painter ID for demonstration purposes
// In a real embed, this would be replaced with the actual provider's ID
const DEMO_PAINTER_ID = "9IsuIup4lcqZB2KHd4yh";

/**
 * Embeddable Room Scanner component
 */
export default function EmbedDemo() {
  // Use the session context
  const { sessionId, homeownerId, houseId } = useSession();
  
  // Track if instructions have been shown
  const [instructionsShown, setInstructionsShown] = useState(false);
  
  // Current view state
  const [currentView, setCurrentView] = useState<'intake' | 'start' | 'camera' | 'roomList' | 'quote' | 'contactConfirmation'>(
    homeownerId ? 'start' : 'intake'
  );
  
  // Confirmation mode for the contact confirmation screen
  const [confirmationMode, setConfirmationMode] = useState<ConfirmationMode>('inHomeEstimate');
  
  // Homeowner name for personalized messages
  const [homeownerName, setHomeownerName] = useState<string>('');
  
  // Store painter information
  const [painter, setPainter] = useState<Painter | null>(null);
  
  // Store pricing sheet information
  const [pricingSheet, setPricingSheet] = useState<PricingSheet | null>(null);
  
  // Store add-ons
  const [addOns, setAddOns] = useState<QuoteItem[]>([]);
  
  // Store embed options
  const [embedOptions, setEmbedOptions] = useState<Record<string, string | boolean>>({});
  
  // Set up camera hook
  const camera = useCamera({
    onImagesReady: (images) => {
      // When images are ready, process them
      rooms.processImages(images);
      // Switch to room list view
      setCurrentView('roomList');
    },
    sessionId
  });
  
  // Set up rooms hook
  const rooms = useRooms({
    sessionId,
    houseId
  });
  
  // Set up quote hook
  const quote = useQuote({
    pricingSheet,
    addOns
  });
  
  // Fetch painter data and pricing sheet
  useEffect(() => {
    const fetchPainterData = async () => {
      try {
        const painterData = await getPainter(DEMO_PAINTER_ID);
        if (painterData) {
          setPainter(painterData);
          console.log('Painter data loaded:', painterData);
        }
      } catch (error) {
        console.error('Error fetching painter data:', error);
      }
    };
    
    const fetchPricingSheet = async () => {
      try {
        const sheet = await getPricingSheetByProviderId(DEMO_PAINTER_ID);
        if (sheet) {
          setPricingSheet(sheet);
          console.log('Pricing sheet loaded:', sheet);
        }
      } catch (error) {
        console.error('Error fetching pricing sheet:', error);
      }
    };
    
    fetchPainterData();
    fetchPricingSheet();
  }, []);
  
  // Initialize camera when view changes to camera, and clean up when switching away
  useEffect(() => {
    // Add a debug log to track when this effect runs
    console.log('Camera view effect running, currentView:', currentView);
    
    if (currentView === 'camera') {
      // Wrap in a setTimeout to avoid potential race conditions
      setTimeout(() => {
        camera.initCamera();
      }, 0);
    } else {
      // Clean up camera when switching away from camera view
      camera.resetCamera();
    }
    
    // Only include currentView in dependencies, not camera
    // This prevents the infinite loop caused by camera object changing
  }, [currentView]);
  
  // Update currentView when homeownerId changes
  useEffect(() => {
    if (homeownerId) {
      console.log('Homeowner found:', { homeownerId, houseId });
      // Go to start screen instead of directly to camera
      setCurrentView('start');
      
      // Fetch homeowner data for personalized messages
      const fetchHomeownerData = async () => {
        try {
          const homeowner = await getHomeowner(homeownerId);
          if (homeowner && homeowner.name) {
            setHomeownerName(homeowner.name);
          }
        } catch (error) {
          console.error('Error fetching homeowner data:', error);
        }
      };
      
      fetchHomeownerData();
    } else {
      console.log('No homeowner found, showing intake form');
    }
  }, [homeownerId, houseId]);
  
  // Initialize embed with customization from URL parameters
  useEffect(() => {
    // Initialize the embed with customization
    console.log('Initializing embed options');
    const options = initializeEmbed();
    setEmbedOptions(options);
  }, []); // Run only once on mount
  
  // Set up quote acceptance handler
  useEffect(() => {
    console.log('Setting up quote acceptance handler');
    
    // Store original handler
    const originalHandleQuoteAccept = quote.handleQuoteAccept;
    
    // Create a stable reference to the handler function
    const enhancedQuoteAcceptHandler = () => {
      // Call the original handler
      originalHandleQuoteAccept();
      
      // Send completion event to parent window
      sendCompletionEvent({
        quoteItems: quote.quoteItems,
        totalAmount: quote.totalQuoteAmount,
        timestamp: new Date().toISOString()
      });
    };
    
    // Replace the handler
    quote.handleQuoteAccept = enhancedQuoteAcceptHandler;
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Restore original handler on cleanup
      quote.handleQuoteAccept = originalHandleQuoteAccept;
    };
  }, [quote.quoteItems, quote.totalQuoteAmount]); // Only re-run when quote data changes
  
  // Handle homeowner intake completion
  const handleIntakeComplete = async () => {
    // After intake, go to start screen instead of directly to camera
    setCurrentView('start');
    
    // Fetch homeowner data for personalized messages
    if (homeownerId) {
      try {
        const homeowner = await getHomeowner(homeownerId);
        if (homeowner && homeowner.name) {
          setHomeownerName(homeowner.name);
        }
      } catch (error) {
        console.error('Error fetching homeowner data:', error);
      }
    }
  };
  
  // Handle start capture button click
  const handleStartCapture = () => {
    setCurrentView('camera');
  };
  
  // Handle schedule in-home button click
  const handleScheduleInHome = () => {
    setConfirmationMode('inHomeEstimate');
    setCurrentView('contactConfirmation');
  };
  
  // Handle early scan exit
  const handleEarlyScanExit = () => {
    setConfirmationMode('earlyScanExit');
    setCurrentView('contactConfirmation');
  };
  
  // Handle schedule intro call
  const handleScheduleIntroCall = () => {
    setConfirmationMode('introCall');
    setCurrentView('contactConfirmation');
  };
  
  // Handle quote feedback
  const handleQuoteFeedback = async (feedback: string) => {
    try {
      // Import the saveQuoteFeedback function
      const { saveQuoteFeedback } = await import('@/utils/firestore/session');
      
      if (sessionId) {
        // Save the feedback to the session
        await saveQuoteFeedback(sessionId, feedback);
        console.log('Quote feedback saved successfully');
        
        // Show confirmation screen
        setConfirmationMode('quoteDisliked');
        setCurrentView('contactConfirmation');
      }
    } catch (error) {
      console.error('Error saving quote feedback:', error);
    }
  };
  
  // Handle quote acceptance
  const handleQuoteAccept = () => {
    // Call the original handler to maintain existing functionality
    quote.handleQuoteAccept();
    
    // Show confirmation screen with the appropriate message
    setConfirmationMode('quoteAcceptedNew');
    setCurrentView('contactConfirmation');
  };
  
  // Handle close confirmation screen
  const handleCloseConfirmation = () => {
    // Close the embed or return to a specific view
    // For now, we'll just close the window if it's in an iframe
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'takeshape-embed', action: 'close' }, '*');
    } else {
      // If not in an iframe, just go back to the start screen
      setCurrentView('start');
    }
  };
  
  // Toggle between camera and room list views
  const toggleView = () => {
    setCurrentView(currentView === 'camera' ? 'roomList' : 'camera');
  };
  
  // Generate quote
  const handleGenerateQuote = async () => {
    // Count the number of rooms
    const roomCount = Object.keys(rooms.rooms).length;
    
    // Generate the quote
    quote.generateQuote(roomCount);
    
    // Mark the house as submitted if we have a house ID
    if (houseId) {
      try {
        // Import the markHouseAsSubmitted function
        const { markHouseAsSubmitted } = await import('@/utils/firestore/house');
        
        // Mark the house as submitted
        await markHouseAsSubmitted(houseId);
        console.log('House marked as submitted:', houseId);
      } catch (error) {
        console.error('Error marking house as submitted:', error);
      }
    }
    
    // Switch to quote view
    setCurrentView('quote');
  };
  
  // Set camera refs
  const handleSetCameraRefs = (
    videoRef: HTMLVideoElement | null,
    flashRef: HTMLDivElement | null,
    buttonRef: HTMLButtonElement | null
  ) => {
    // Pass the refs to the camera hook
    camera.setRefs(videoRef, flashRef, buttonRef);
  };
  
  // Set room refs
  const handleSetRoomRefs = (
    modelViewerRef: HTMLDivElement | null,
    loadingIndicatorRef: HTMLDivElement | null
  ) => {
    rooms.setModelViewerRef(modelViewerRef);
    rooms.setLoadingIndicatorRef(loadingIndicatorRef);
  };
  
  // Check if chat is enabled
  const isChatEnabled = embedOptions.enableChat === true;
  
  return (
    <div className="app-container">
      {/* Chat Component - Only render if enabled */}
      {sessionId && isChatEnabled && <Chat sessionId={sessionId} />}
      
      {/* Homeowner Intake Form */}
      {currentView === 'intake' && (
        <HomeownerIntake onComplete={handleIntakeComplete} />
      )}
      
      {/* Start Screen */}
      <StartScreen
        isVisible={currentView === 'start'}
        businessName={painter?.businessName}
        homeownerName={homeownerName}
        serviceType="painted" // Default service type
        primaryColor={embedOptions.primaryColor as string}
        onStartCapture={handleStartCapture}
        onScheduleInHome={handleScheduleInHome}
      />
      
      {/* Contact Confirmation Screen */}
      <ContactConfirmationScreen
        isVisible={currentView === 'contactConfirmation'}
        mode={confirmationMode}
        homeownerName={homeownerName}
        businessName={painter?.businessName}
        primaryColor={embedOptions.primaryColor as string}
        painter={painter}
        onClose={handleCloseConfirmation}
      />
      
      {/* Camera View */}
      <CameraView
        isVisible={currentView === 'camera'}
        imageCount={camera.imageCount}
        businessName={painter?.businessName}
        instructionsShown={instructionsShown}
        onInstructionsClose={() => setInstructionsShown(true)}
        onToggleView={toggleView}
        onCaptureImage={camera.captureImage}
        onClose={handleEarlyScanExit}
        onSetCameraRefs={handleSetCameraRefs}
      />
      
      {/* Room List View */}
      <RoomListView
        isVisible={currentView === 'roomList'}
        rooms={rooms.rooms}
        temporaryRooms={rooms.temporaryRooms}
        activeRoom={rooms.activeRoom}
        classifiedRoomNames={rooms.classifiedRoomNames}
        processingRoom={rooms.processingRoom}
        isProcessingAnyRoom={rooms.isProcessingAnyRoom}
        primaryColor={embedOptions.primaryColor as string}
        onRoomSelect={rooms.handleRoomSelect}
        onRoomNameChange={rooms.handleRoomNameChange}
        onRoomNameSave={rooms.saveRoomName}
        onToggleView={toggleView}
        onGenerateQuote={handleGenerateQuote}
        onClose={handleEarlyScanExit}
        onSetRefs={handleSetRoomRefs}
      />
      
      {/* Quote View */}
      <QuoteView
        isVisible={currentView === 'quote'}
        quoteItems={quote.quoteItems}
        totalQuoteAmount={quote.totalQuoteAmount}
        painter={painter}
        onAcceptQuote={handleQuoteAccept}
        onScheduleIntroCall={handleScheduleIntroCall}
        onQuoteFeedback={handleQuoteFeedback}
      />
    </div>
  );
}
