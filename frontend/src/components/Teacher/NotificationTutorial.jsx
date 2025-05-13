import { useState } from "react";
import Tour from "reactour";

const NotificationTutorial = ({ isOpen, setIsOpen }) => {
    const [currentStep, setCurrentStep] = useState(0);

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
            onRequestClose={() => setIsOpen(false)} // ✅ Properly closes tutorial when clicking outside or ESC
            getCurrentStep={(step) => setCurrentStep(step)}
            showCloseButton={true} // ✅ Ensures visible close (X) button
            disableInteraction={false} // ✅ Allows clicking on elements normally
            lastStepNextButton={
                <button onClick={() => setIsOpen(false)}>Got It</button> // ✅ Fix: Properly closes tutorial
            }
        />
    );
};

export default NotificationTutorial;
