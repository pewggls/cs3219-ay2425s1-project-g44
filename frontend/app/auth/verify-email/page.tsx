"use client"

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { getCookie } from '@/app/utils/cookie-manager';

function VerifyEmail() {
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');

  // Get the search params from the URL
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const type = searchParams.get('type')
  const email = searchParams.get('email');

  let adminJWT: string | null = null;
  let tokenTimestamp: number | null = null;
  async function getAdminJWT() {
      // Check if the token is cached and not expired
      const tokenValidFor = 24 * 60 * 60 * 1000;
      const currentTime = Date.now();
    
      if (adminJWT && tokenTimestamp && (currentTime - tokenTimestamp < tokenValidFor)) {
          return adminJWT;
      }
    
      // If no token or token expired, login as admin to get a new token
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/login`, {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              "email": process.env.NEXT_PUBLIC_EMAIL_USER,
              "password": process.env.NEXT_PUBLIC_EMAIL_PASS
          }),
      });
    
      if (!loginResponse.ok) {
          setStatus('error');
          setMessage('Unexpected error occured. Please check the URL or request a new one.');
          throw new Error(`Failed to fetch admin JWT token. Status: ${loginResponse.status}, Message: ${loginResponse.statusText}`);
      }
    
      const loginData = await loginResponse.json();
      adminJWT = loginData.data.accessToken;
      tokenTimestamp = currentTime;
      return adminJWT;
  }

  
  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!id) {
        setMessage('Invalid verification link. Please check the URL or request a new one.');
        setStatus('error');
        return;
      }

      try {
        // Check if param userId of url is valid
        console.log("In verify user page: call api to check if user exist")
        const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/check?id=${id}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!checkResponse.ok) {
          const errorMessage = (await checkResponse.json()).message;
          setMessage('Invalid verification link. Please check the URL or request a new one.');
          setStatus('error');
          throw Error("Failed to verify user: " + errorMessage);
        }
        
        // Update user verified state 
        if (type == 'sign-up') {
          console.log("In verify user page: fetch admin jwt token api");
          const adminJWT = await getAdminJWT();
          console.log("In verify user page: call update user verify status api")
          const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminJWT}`,
            },
            body: JSON.stringify({
              isVerified: true,
            })
          });
          console.log("update response: ", updateResponse)
          if (!updateResponse.ok) {
            const errorMessage = (await updateResponse.json()).message;
            setMessage('Unexpected error occured. Please check the URL or request a new one.');
            setStatus('error');
            throw Error("Failed to update user verified state: " + errorMessage);
          }
          setMessage('You can now log in.');
        } else {
          const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${getCookie('token')}`
            },
            body: JSON.stringify({ email: email }),
          });
          if (!response.ok) {
            const errorMessage = (await response.json()).message;
            setMessage('Unexpected error occured. Please check the URL or request a new one.');
            setStatus('error');
            throw Error("Failed to update user email: " + errorMessage);
          }
          setMessage('Your email address has been successfully updated!');
        }

        setStatus('success');
      } catch (error) {
        console.error(error);
      }
    };

    verifyUserEmail();
  }, [id, email, getAdminJWT, type]);

  return (
    <div className="min-h-screen laptop:w-screen text-black font-sans flex flex-col items-center justify-center gap-6 mx-auto w-[350px]">
      {status === 'loading' && (
        <div className="flex flex-col text-center gap-2">
          <p className="font-light text-gray-600">Verifying your email, please wait...</p>
        </div>
      )}
      {status === 'success' && (
        <>
          <div className="flex flex-col gap-2 text-center">
            <span className="font-serif font-light text-4xl text-green-600 tracking-tight">
              Email Verified!
            </span>
            <p className="text-gray-800">{message}</p>
            <Link href={type === 'sign-up' ? '/auth/login' : '/questions'}>
              <Button className="btn mt-4" >{type === 'sign-up' ? 'Go to Login' : 'Go to Homepage'}</Button>
            </Link>
          </div>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="flex flex-col gap-2 text-center">
            <span className="font-serif font-light text-4xl text-red-600 tracking-tight">
              Verification Failed
            </span>
            <p className="text-gray-800">{message}</p>
            <Link href={type === 'sign-up' ? '/auth/sign-up' : '/profile'}>
              <Button className="btn mt-4" variant="destructive">Go Back to Profile</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}