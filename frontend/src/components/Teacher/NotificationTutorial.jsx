import { useState } from "react";
import Tour from "reactour";

const NotificationTutorial = ({ isOpen, setIsOpen, onComplete }) => {
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
            onRequestClose={() => { setIsOpen(false); onComplete(); }} // ✅ Close tutorial properly
            getCurrentStep={(step) => setCurrentStep(step)}
            showCloseButton={true} // ✅ Makes the close (X) button visible
            disableInteraction={false} // ✅ Allows clicking on elements normally
            lastStepNextButton={
                <button onClick={() => { setIsOpen(false); onComplete(); }}>Got It</button> // ✅ Fully closes tutorial
            }
        />
    );
};

export default NotificationTutorial;
