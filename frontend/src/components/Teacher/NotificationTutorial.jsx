import { useState } from "react";
import Tour from "reactour";

const NotificationTutorial = ({ isOpen, setIsOpen, step }) => {
    const [currentStep, setCurrentStep] = useState(0); // ✅ Tracks the current tutorial step

     const steps = [
        {
            selector: ".notification-wrapper", // ✅ Bell icon
            content: "Click the bell icon to view your notifications.",
        }
    ];

    return (
        <Tour 
            steps={steps} 
            isOpen={isOpen} 
            onRequestClose={() => setIsOpen(false)} 
            getCurrentStep={(step) => setCurrentStep(step)} // ✅ Auto-tracks the current step
            showButtons={true} // ✅ Ensure navigation buttons appear
            showCloseButton={true} // ✅ Adds a visible close (X) button
            lastStepNextButton={<button onClick={() => setIsOpen(false)}>Got It</button>} // ✅ Adds a manual close button
        />
    );
};

export default NotificationTutorial;
