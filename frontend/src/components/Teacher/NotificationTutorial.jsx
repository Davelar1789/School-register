import { useState } from "react";
import Tour from "reactour";

const NotificationTutorial = ({ isOpen, setIsOpen }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            selector: ".notification-wrapper", // ✅ Bell icon
            content: "You can now click the bell icon to view your notifications.",
        }
    ];

    return (
        <Tour
            steps={steps}
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)} // ✅ Close when clicking outside or pressing ESC
            getCurrentStep={(step) => setCurrentStep(step)}
            showCloseButton={true} // ✅ Ensures visible close button
            lastStepNextButton={
                <button onClick={() => setIsOpen(false)}>Got It</button> // ✅ Fix: Properly closes tutorial
            }
        />
    );
};

export default NotificationTutorial;
