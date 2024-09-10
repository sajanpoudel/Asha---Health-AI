'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import HealthAssistantPage from './HealthAssistantPage';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

interface PersonalData {
  name: string;
  email: string;
  picture: string;
}

const HealthAssistant: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('personalData');
    const storedToken = localStorage.getItem('accessToken');
    if (storedData && storedToken) {
      setPersonalData(JSON.parse(storedData));
      setAccessToken(storedToken);
      setCurrentPage('assistant');
    }
  }, []);

  const handleGoogleLogin = async (tokenResponse: any) => {
    try {
      console.log('Token Response:', tokenResponse);
      setAccessToken(tokenResponse.access_token);
      
      // Fetch user info using the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoResponse.json();
      console.log('User Info:', userInfo);
      
      const newPersonalData: PersonalData = {
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      };
      setPersonalData(newPersonalData);
      localStorage.setItem('personalData', JSON.stringify(newPersonalData));
      localStorage.setItem('accessToken', tokenResponse.access_token);
      setCurrentPage('assistant');
    } catch (error) {
      console.error('Error during Google login:', error);
      setError('Failed to log in with Google. Please try again.');
    }
  };

  const LoginPage: React.FC = () => {
    const login = useGoogleLogin({
      onSuccess: handleGoogleLogin,
      onError: () => {
        console.log('Login Failed');
        setError('Login failed. Please try again.');
      },
      scope: 'email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly',
      flow: 'implicit'
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

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="h-screen">
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'assistant' && personalData && accessToken && (
          <HealthAssistantPage personalData={personalData} accessToken={accessToken} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default HealthAssistant;