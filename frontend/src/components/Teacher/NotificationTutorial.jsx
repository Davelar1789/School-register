import { useState } from "react";
import Tour from "reactour";

const NotificationTutorial = ({ isOpen, setIsOpen, step }) => {
    const [currentStep, setCurrentStep] = useState(0); // ✅ Tracks the current tutorial step

    const steps = step === "dashboard"
        ? [
            {
                selector: ".notification-wrapper", // ✅ Bell icon
                content: "Click the bell icon to view your notifications.",
            }
        ]
        : [
            {
                selector: ".main-thing", // ✅ Notification page
                content: "This is where all your notifications appear. You can mark them as read.",
            }
        ];

    return (
        <Tour 
            steps={steps} 
            isOpen={isOpen} 
            onRequestClose={() => setIsOpen(false)} 
            getCurrentStep={(step) => setCurrentStep(step)} // ✅ Auto-tracks the current step
        />
    );
};

export default NotificationTutorial;
