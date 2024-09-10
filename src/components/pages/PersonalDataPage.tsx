import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface PersonalDataPageProps {
  onComplete: (data: PersonalData) => void;
}

interface PersonalData {
  name: string;
  age: string;
  bloodGroup: string;
  medicalHistory: string;
}

const PersonalDataPage: React.FC<PersonalDataPageProps> = ({ onComplete }) => {
  const [personalData, setPersonalData] = useState<PersonalData>({
    name: '',
    age: '',
    bloodGroup: '',
    medicalHistory: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onComplete(personalData);
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
            value={personalData.name}
            onChange={handleInputChange}
            className="mb-4"
          />
          <Input
            type="number"
            name="age"
            placeholder="Age"
            value={personalData.age}
            onChange={handleInputChange}
            className="mb-4"
          />
          <Input
            type="text"
            name="bloodGroup"
            placeholder="Blood Group"
            value={personalData.bloodGroup}
            onChange={handleInputChange}
            className="mb-4"
          />
          <textarea
            name="medicalHistory"
            placeholder="Medical History (e.g., conditions, medications)"
            value={personalData.medicalHistory}
            onChange={handleInputChange}
            className="w-full p-2 mb-6 border rounded"
            rows={4}
          />
          <Button onClick={handleSubmit} className="w-full">
            Start Using Health Assistant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDataPage;