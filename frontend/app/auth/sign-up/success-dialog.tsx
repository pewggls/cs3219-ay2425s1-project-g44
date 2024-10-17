import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Info, LoaderCircle, CheckCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";

interface SuccessDialogProps {
  message: string | null;
  onClose: () => void;
  onResend: () => void;
}

export default function SuccessDialog({
  message,
  onClose,
  onResend,
}: SuccessDialogProps) {
    const [showFeedback, setShowFeedback] = useState(false);
    // const [resendCount, setResendCount] = useState(0); // Track how many times resend is clicked
    // const [resendMessage, setResendMessage] = useState(message);
    // const maxResendAttempts = 3; // Maximum resend attempts

    // const handleResendClick = () => {
    //     if (resendCount < maxResendAttempts) {
    //       onResend();
    //       setResendCount(resendCount + 1); // Increment the resend count
    //       setResendMessage("The email has been resent. Please check your inbox.");
    //     } else {
    //       setResendMessage("You have reached the maximum number of resend attempts.");
    //     }
    //   };
    const handleResendClick = () => {
        onResend();
        setShowFeedback(true);

        // Hide the UI and close the dialog after 3 seconds (3000ms) to avoid user multiple attempt of resend email
        setTimeout(() => {
            setShowFeedback(false);
            onClose();
        }, 3000); // Adjust the time as necessary
    };


    return (
        <Dialog open={!!message} onOpenChange={onClose}>
        <DialogContent
            className=" bg-white text-black font-sans rounded-2xl"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
        >           
            <DialogHeader className="items-start">
            <DialogTitle className="text-normal text-3xl">
                {/* { resendCount <= maxResendAttempts ? 
                    (resendMessage?.includes("haven't verified") ? "Reminder" : "Success!") : "Resend Limit Reached"
                } */}
                { 
                    message?.includes("haven't verified") ? "Reminder" : "Success!"
                }
            </DialogTitle>
            <DialogDescription className="text-base">{message}</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
                {/* Show the resend link only if under the limit */}
                {/* {resendCount <= maxResendAttempts && (
                    <p>
                        Didn’t receive the code?{" "}
                        <span className="text-blue-500 cursor-pointer" onClick={handleResendClick}>
                            Resend
                        </span>
                    </p>
                )} */}
                {
                    <p>
                        Didn’t receive the code? It might be in your spam folder, or you can{" "}
                        <span className="text-blue-500 cursor-pointer" onClick={handleResendClick}>
                            Resend the link
                        </span>
                    </p>
                }
                {showFeedback && (
                    <Alert className="text-green-500">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Email has been resent! Please check your inbox.</AlertTitle>
                    </Alert>
                )}
            </div>
            <DialogFooter>
            <Button onClick={onClose} className="rounded-lg bg-gray-950 hover:bg-gray-800">Close</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}
