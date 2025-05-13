import { useState } from "react";
import Tour from "reactour";

const NotificationTutorial = ({ isOpen, setIsOpen, step }) => {
    const steps = step === "header"
        ? [
            {
                selector: ".notification-wrapper", // ✅ Bell icon
                content: "Click the bell icon to view your notifications.",
            }
        ]
        : [
            {
                selector: ".main-thing", // ✅ Notification page
                content: "This is where all your notifications appear. You can mark them as read or clear them.",
            }
        ];

    return <Tour steps={steps} isOpen={isOpen} onRequestClose={() => setIsOpen(false)} />;
};


export default NotificationTutorial;
