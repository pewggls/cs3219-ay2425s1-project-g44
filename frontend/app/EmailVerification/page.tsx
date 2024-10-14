"use client"

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from 'next/link';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');

  // Get the search params from the URL
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!id) {
        setMessage('Invalid or missing id.');
        setStatus('error');
        return;
      }

      try {
        // Send token to backend for verification
        const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/verify-email?id=${id}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setMessage('Email verified successfully! You can now log in.');
          setStatus('success');
        } else {
          const errorData = await response.json();
          setMessage(errorData.message || 'Verification failed. Please try again.');
          setStatus('error');
        }
      } catch (error) {
        setMessage('An error occurred. Please try again.');
        setStatus('error');
      }
    };

    verifyUserEmail();
  }, [id]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="max-w-lg w-full p-6 shadow-lg rounded-lg">
        {status === 'loading' && (
          <CardContent className='flex justify-center items-center'>
            <p className="text-gray-600">Verifying your email, please wait...</p>
          </CardContent>
        )}

        {status === 'success' && (
          <>
            <CardHeader className='flex justify-center items-center'>
              <CardTitle className="text-green-600">Email Verified!</CardTitle>
            </CardHeader>
            <CardContent className='flex justify-center items-center'>
              <p className="text-gray-800">{message}</p>
            </CardContent>
            <CardFooter className='flex justify-center items-center'>
              <Link href="/">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardFooter>
          </>
        )}

        {status === 'error' && (
          <>
            <CardHeader className='flex justify-center items-center'>
              <CardTitle className="text-red-600">Verification Failed</CardTitle>
            </CardHeader>
            <CardContent className='flex justify-center items-center'>
              <p className="text-gray-800">{message}</p>
            </CardContent>
            <CardFooter className='flex justify-center items-center'>
              <Link href="/signup">
                <Button variant="destructive" className="w-full">Go to Sign Up</Button>
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};
