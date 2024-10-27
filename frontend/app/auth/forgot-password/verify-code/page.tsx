"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { OTPInput, SlotProps } from 'input-otp'
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";
import { AlertCircle, Info, LoaderCircle, CheckCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
 
// adapted from: https://input-otp.rodz.dev/
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function FakeCaret() {
    return (
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
        <div className="w-px h-8 bg-white" />
      </div>
    )
}

function Slot(props: SlotProps) {
    return (
      <div
        className={cn(
          'relative w-20 h-24 text-[2rem]',
          'flex items-center justify-center',
          'transition-all duration-300',
          'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
          'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
          'outline outline-0 outline-accent-foreground/20',
          { 'outline-[3px] outline-accent-foreground': props.isActive },
        )}
      >
        {props.char !== null && <div>{props.char}</div>}
        {props.hasFakeCaret && <FakeCaret />}
      </div>
    )
} 

const FormSchema = z.object({
  otp: z.string().min(6, {
    message: "Your code must be exactly 6 digits.",
  }),
});

function OTPForm() {
//   const [value, setValue] = useState("");
//   const [timer, setTimer] = useState(60);
//   const [disable, setDisable] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const param_email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Timer effect for Resend OTP
  //   useEffect(() => {
  //     if (disable && timer > 0) {
  //       const timer = setInterval(() => {
  //         setTimer(prev => prev - 1);
  //       }, 1000);
  //       return () => clearInterval(timer);
  //     } else if (timer === 0) {
  //       setDisable(false);
  //     }
  //   }, [disable, timer]);

  //   const handleChange = (e: { target: { value: any; }; }, index: string | number) => {
  //     const value = e.target.value;
  //     if (/^[0-9]$/.test(value)) {
  //       const newOtp = [...otp];
  //       newOtp[index] = value;
  //       setOtp(newOtp);
  //     }
  //   };

  //   const resendOTP = () => {
  //     if (!disable) {
  //       // Logic to resend the OTP
  //       console.log('Resend OTP');
  //       setDisable(true);
  //       setTimer(30);  // Reset the timer
  //     }
  //   };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let isErrorSet = false;
    try {
        await form.trigger();
        if (!form.formState.isValid) {
            return;
        }
        
        setIsLoading(true);
        setError(""); // Clear any previous errors

        if (param_email === null) {
          setError("Email is missing. Please try again.");
          return;
        }

        // Verify code with backend
        console.log("In verify code page: call api to verify 6 digit code");
        const verifyCodeResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/verify-otp`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: param_email,
                otp: data.otp,
            })
        });
        if (verifyCodeResponse.status == 400) {
            setError("We couldn't identify your account. It looks like the email is missing in the link. Please try again");
            isErrorSet = true;
            throw new Error("Missing email: " + verifyCodeResponse.statusText);
        } else if (verifyCodeResponse.status == 403) {
            const responseMessage = (await verifyCodeResponse.json()).message;
            if (responseMessage.includes("expired")) {
                setError("The verification code has expired. Please request a new one.");
                isErrorSet = true;
            } else if (responseMessage.includes("Incorrect")) {
                setError("The code you entered is incorrect. Please try again.");
                isErrorSet = true;
            } else {
                setError("Your account doesn't need verification at this time.");
                isErrorSet = true;
            }
            throw new Error("Error during verification: " + verifyCodeResponse.statusText);
        } else if (verifyCodeResponse.status == 404) {
            setError("The email associated with this link doesn't exist in our system. Have you registered yet?");
            isErrorSet = true;
            throw new Error("User doesn't exist: " + verifyCodeResponse.statusText);
        } else if (verifyCodeResponse.status == 500) {
            setError("Database or server error. Please try again.");
            isErrorSet = true;
            throw new Error("Database or server error: " + verifyCodeResponse.statusText);
        } else if (!verifyCodeResponse.ok) {
            setError("There was an error verifying the code.");
            isErrorSet = true;
            throw new Error("Error verifying code: " + verifyCodeResponse.statusText);
        }
        const responseData = await verifyCodeResponse.json();
        const resetPasswordToken = responseData.data.token;
        router.push(`/auth/reset-password?email=${encodeURIComponent(param_email)}&token=${resetPasswordToken}`);
    } catch (err) {
        if (!isErrorSet) {
            setError("Something went wrong on our backend. Please retry shortly.");
        }
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen font-sans">
      <div className="flex flex-col bg-white px-6 pt-10 pb-9 drop-shadow-xl w-full max-w-2xl rounded-2xl">
        <div className="flex flex-col gap-2 text-center">
            <span className="font-serif font-light text-4xl text-primary tracking-tight">
              Email Verification
            </span>
            <p className="text-sm text-muted-foreground">
              We have sent a code to your email{param_email && ": " + param_email}
            </p>
        </div>
        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center space-y-5 mt-5"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <OTPInput
                        maxLength={6}
                        containerClassName="group flex text-black items-center has-[:disabled]:opacity-30"
                        render={({ slots }) => (
                            <>
                            <div className="flex">
                                {slots.map((slot, idx) => (
                                <Slot key={idx} {...slot} />
                                ))}
                            </div>
                            </>
                        )}
                    {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-4/5 rounded-xl py-6">
                {isLoading ? (
                    <LoaderCircle className="animate-spin" />
                ) : (
                    "Verify"
                )}
            </Button>
          </form>
        </Form>
        {/* <div className="flex items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                <p>Didn't recieve code?</p>{" "}
                <a
                    className="flex flex-row items-center"
                    style={{
                    color: disable ? "gray" : "blue",
                    cursor: disable ? "none" : "pointer",
                    textDecorationLine: disable ? "none" : "underline",
                    }}
                    onClick={() => resendOTP()}
                >
                    {disable ? `Resend OTP in ${timerCount}s` : "Resend OTP"}
                </a>
            </div> */}
      </div>
    </div>
  );
}

export default function OTPFormPage() {
  return (
    <Suspense>
      <OTPForm />
    </Suspense>
  )
}