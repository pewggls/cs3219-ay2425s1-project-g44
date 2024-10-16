"use client"

import React from 'react';
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";

const PasswordChangeSuccess = () => {
  const router = useRouter();

  const handleReturn = () => {
    router.push('/');
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="flex flex-col items-center mb-4">
          <svg className="w-24 h-24 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" stroke="currentColor">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 24l6 6L34 16" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">Password Changed!</h1>
        <p className="mt-2 text-gray-600">Your password has been changed successfully.</p>
        <Button onClick={handleReturn} className="mt-6 w-full max-w-xs" variant="default">
          Go to Login
        </Button>
      </div>
  );
};

export default PasswordChangeSuccess;
