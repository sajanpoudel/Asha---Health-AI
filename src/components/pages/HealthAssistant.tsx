'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import { signInWithCredential, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import HealthAssistantPage from './HealthAssistantPage';

interface PersonalData {
  name: string;
  email: string;
  picture: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

const LoginComponent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse: TokenResponse) => {
      try {
        const credential = GoogleAuthProvider.credential(null, tokenResponse.access_token);
        const result = await signInWithCredential(auth, credential);
        
        if (result.user) {
          const userData: PersonalData = {
            name: result.user.displayName || '',
            email: result.user.email || '',
            picture: result.user.photoURL || '',
          };
          
          await setDoc(doc(db, 'users', result.user.uid), userData);
          localStorage.setItem('accessToken', tokenResponse.access_token);
          localStorage.setItem('personalData', JSON.stringify(userData));

          router.push('/health-assistant');
        }
      } catch (error) {
        console.error('Error during Google login:', error);
        setError('Failed to log in with Google. Please try again.');
      }
    },
    onError: (errorResponse: any) => {
      console.error('Login Failed:', errorResponse);
      setError('Login failed. Please try again.');
    },
    scope: 'email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly',
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Your AI Health Assistant</h2>
          <Button onClick={() => login()} className="w-full">Sign in with Google</Button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

const HealthAssistant: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedPersonalData = localStorage.getItem('personalData');
        
        if (storedAccessToken && storedPersonalData) {
          setIsAuthenticated(true);
          setAccessToken(storedAccessToken);
          setPersonalData(JSON.parse(storedPersonalData));
        } else {
          // If we have a user but no stored data, we might need to fetch it
          // This is a fallback and might not be necessary if login always sets localStorage
          router.push('/');
        }
      } else {
        setIsAuthenticated(false);
        setAccessToken(null);
        setPersonalData(null);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isAuthenticated && personalData && accessToken) {
    return <HealthAssistantPage personalData={personalData} accessToken={accessToken} />;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <LoginComponent />
    </GoogleOAuthProvider>
  );
};

export default HealthAssistant;