"use client"

import React from 'react';
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";

const PasswordChangeSuccess = () => {
  const router = useRouter();

  const handleReturn = () => {
    router.push('/auth/login');
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 rounded-lg shadow-lg text-center font-sans gap-8">
        <div className="flex flex-col items-center mb-4">
        <svg className="w-24 h-24 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" stroke="currentColor">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 24l6 6L34 16" />
          </svg>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <span className="font-serif font-light text-4xl text-primary tracking-tight">
            Password Changed
          </span>
          <p className="text text-muted-foreground">
            Your password has been changed successfully.
          </p>
        </div>
        <Button onClick={handleReturn} className="mt-6 w-full max-w-xs" variant="default">
          Sign in
        </Button>
      </div>
  );
};

export default PasswordChangeSuccess;
