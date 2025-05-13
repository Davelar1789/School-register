import React, { createContext, useContext } from "react";
import { ShepherdTour } from "react-shepherd";

// Create a context to manage the tour state globally
const TourContext = createContext();

export const useTour = () => {
  return useContext(TourContext);
};

// Define the tour steps
const steps = [
  {
    id: "notification",
    attachTo: { element: ".notification-wrapper", on: "bottom" },
    title: "Notifications",
    text: ["Click the bell to view unread messages, updates, or alerts."],
    buttons: [
      {
        text: "Got it!",
        action: (tour) => {
          tour.complete(); // Complete the tour when the button is clicked
        },
      },
    ],
  },
];

// Define the tour options
const tourOptions = {
  defaultStepOptions: {
    cancelIcon: { enabled: true },
    scrollTo: true,
  },
  useModalOverlay: true,
};

// Create the TourProvider component to wrap around the app
export const TourProvider = ({ children }) => {
  return (
    <ShepherdTour steps={steps} tourOptions={tourOptions}>
      {children}
    </ShepherdTour>
  );
};
