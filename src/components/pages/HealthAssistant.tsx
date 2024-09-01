'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import HealthAssistantPage from './HealthAssistantPage';

interface PersonalData {
  name: string;
  age: string;
  bloodGroup: string;
  sugarLevel: string;
  bloodPressure: string;
  heartCondition: string;
  otherConditions: string;
  medicalReports: File | null;
}

const HealthAssistant: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [personalData, setPersonalData] = useState<PersonalData>({
    name: '',
    age: '',
    bloodGroup: '',
    sugarLevel: '',
    bloodPressure: '',
    heartCondition: '',
    otherConditions: '',
    medicalReports: null,
  });

  const LoginPage: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Your AI Health Assistant</h2>
          <Input
            type="text"
            placeholder="Username"
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Password"
            className="mb-6"
          />
          <Button onClick={() => setCurrentPage('personalData')} className="w-full">
            Sign In / Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const PersonalDataPage: React.FC = () => {
    const [localPersonalData, setLocalPersonalData] = useState<PersonalData>(personalData);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setLocalPersonalData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setLocalPersonalData(prevData => ({
          ...prevData,
          medicalReports: e.target.files![0]
        }));
      }
    };

    const handleSubmit = () => {
      setPersonalData(localPersonalData);
      setCurrentPage('assistant');
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Tell Us About Your Health</h2>
            <Input
              type="text"
              name="name"
              placeholder="Full Name"
              value={localPersonalData.name}
              onChange={handleInputChange}
              className="mb-4"
            />
            <Input
              type="number"
              name="age"
              placeholder="Age"
              value={localPersonalData.age}
              onChange={handleInputChange}
              className="mb-4"
            />
            <Input
              type="text"
              name="bloodGroup"
              placeholder="Blood Group"
              value={localPersonalData.bloodGroup}
              onChange={handleInputChange}
              className="mb-4"
            />
            <Input
              type="text"
              name="sugarLevel"
              placeholder="Sugar Level"
              value={localPersonalData.sugarLevel}
              onChange={handleInputChange}
              className="mb-4"
            />
            <Input
              type="text"
              name="bloodPressure"
              placeholder="Blood Pressure"
              value={localPersonalData.bloodPressure}
              onChange={handleInputChange}
              className="mb-4"
            />
            <Input
              type="text"
              name="heartCondition"
              placeholder="Heart Condition (if any)"
              value={localPersonalData.heartCondition}
              onChange={handleInputChange}
              className="mb-4"
            />
            <textarea
              name="otherConditions"
              placeholder="Other Medical Conditions"
              value={localPersonalData.otherConditions}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded"
              rows={4}
            />
            <Input
              type="file"
              onChange={handleFileChange}
              className="mb-4"
            />
            <Button onClick={handleSubmit} className="w-full">
              Start Using Health Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-screen">
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'personalData' && <PersonalDataPage />}
      {currentPage === 'assistant' && <HealthAssistantPage />}
    </div>
  );
};

export default HealthAssistant;