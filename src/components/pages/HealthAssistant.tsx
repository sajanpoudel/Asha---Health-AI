'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import HealthAssistantPage from './HealthAssistantPage';

interface PersonalData {
  name: string;
  email: string;
  picture: string;
}

const LoginComponent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      console.log('Access Token:', token);
      
      if (result.user && token) {
        const userData: PersonalData = {
          name: result.user.displayName || '',
          email: result.user.email || '',
          picture: result.user.photoURL || '',
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userData);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('personalData', JSON.stringify(userData));

        router.push('/health-assistant');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      setError('Failed to log in with Google. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Your AI Health Assistant</h2>
          <Button onClick={login} className="w-full">Sign in with Google</Button>
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      if (user) {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedPersonalData = localStorage.getItem('personalData');
        
        if (storedAccessToken && storedPersonalData) {
          setIsAuthenticated(true);
          setAccessToken(storedAccessToken);
          setPersonalData(JSON.parse(storedPersonalData));
        } else {
          router.push('/');
        }
      } else {
        setIsAuthenticated(false);
        setAccessToken(null);
        setPersonalData(null);
        router.push('/');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && personalData && accessToken) {
    return <HealthAssistantPage personalData={personalData} accessToken={accessToken} />;
  }

  return <LoginComponent />;
};

export default HealthAssistant;