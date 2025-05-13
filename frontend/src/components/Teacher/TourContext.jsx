// TourContext.js
import React from "react";
import { ShepherdTour, ShepherdTourContext } from "react-shepherd";

const steps = [
  {
    id: "notification",
    attachTo: { element: ".notification-wrapper", on: "bottom" },
    title: "Notifications",
    text: ["Click the bell to view unread messages, updates, or alerts."],
    buttons: [
      {
        text: "Got it!",
        action: ShepherdTourContext?.tour?.complete,
      },
    ],
  },
];

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: { enabled: true },
    scrollTo: true,
  },
  useModalOverlay: true,
};

export const TourProvider = ({ children }) => (
  <ShepherdTour steps={steps} tourOptions={tourOptions}>
    {children}
  </ShepherdTour>
);
