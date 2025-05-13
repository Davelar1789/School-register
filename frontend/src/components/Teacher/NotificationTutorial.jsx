import { useState } from "react";
import Tour from "reactour";

const NotificationTutorial = ({ isOpen, setIsOpen, step }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = step === "header"
        ? [{ selector: ".notification-wrapper", content: "Click the bell icon to view your notifications." }]
        : [{ selector: ".main-thing", content: "This is where all your notifications appear." }];

    return (
        <Tour
            steps={steps}
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)} // ✅ Allow users to close the tutorial
            getCurrentStep={(step) => setCurrentStep(step)}
            showCloseButton={true} // ✅ Ensures visible close button
            lastStepNextButton={<button onClick={() => setIsOpen(false)}>Got It</button>} // ✅ Manual close button
        />
    );
};

export default NotificationTutorial;
