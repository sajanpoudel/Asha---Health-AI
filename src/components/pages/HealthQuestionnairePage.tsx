
// src/components/pages/HealthQuestionnairePage.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

interface QuestionnaireData {
  bloodGroup: string;
  height: string;
  weight: string;
  hasDiabetes: string;
  lastDiabetesReading?: string;
  hasHighBloodPressure: string;
  lastBloodPressureReading?: string;
  exerciseFrequency: string;
  sleepHours: string;
  stressLevel: string;
  dietType: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
  smoker: string;
  alcoholConsumption: string;
}

const questions = [
  {
    id: 'generalHealth',
    title: 'General Health',
    questions: [
      { id: 'bloodGroup', question: 'What is your blood group?' },
      { id: 'height', question: 'What is your height in cm?' },
      { id: 'weight', question: 'What is your weight in kg?' },
    ]
  },
  {
    id: 'medicalHistory',
    title: 'Medical History',
    questions: [
      { id: 'hasDiabetes', question: 'Do you have diabetes?' },
      { id: 'hasHighBloodPressure', question: 'Do you have high blood pressure?' },
      { id: 'allergies', question: 'Do you have any allergies?' },
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    questions: [
      { id: 'exerciseFrequency', question: 'How many times do you exercise per week?' },
      { id: 'sleepHours', question: 'How many hours do you sleep on average?' },
      { id: 'dietType', question: 'What type of diet do you follow?' },
    ]
  },
  {
    id: 'mentalHealth',
    title: 'Mental Health',
    questions: [
      { id: 'stressLevel', question: 'How would you rate your stress level?' },
      { id: 'smoker', question: 'Do you smoke?' },
      { id: 'alcoholConsumption', question: 'How often do you consume alcohol?' },
    ]
  },
];

const HealthQuestionnairePage: React.FC = () => {
  const [data, setData] = useState<QuestionnaireData>({
    bloodGroup: '',
    height: '',
    weight: '',
    hasDiabetes: '',
    hasHighBloodPressure: '',
    exerciseFrequency: '',
    sleepHours: '',
    stressLevel: '',
    dietType: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    smoker: '',
    alcoholConsumption: '',
  });
  const [currentSection, setCurrentSection] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.error('User not authenticated');
        alert('User not authenticated. Please log in again.');
        router.push('/');
      } else {
        // Load existing data if available
        loadExistingData(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadExistingData = async (userId: string) => {
    const docRef = doc(db, 'healthQuestionnaires', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setData(docSnap.data() as QuestionnaireData);
    }
  };

  const handleInputChange = (id: string, value: any) => {
    setData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentSection < questions.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated. Please log in again.');
      router.push('/');
      return;
    }

    try {
      await setDoc(doc(db, 'healthQuestionnaires', user.uid), data);
      alert('Health questionnaire submitted successfully!');
      router.push('/health-assistant');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert(`Failed to submit questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderQuestion = (id: string, question: string) => {
    switch (id) {
      case 'bloodGroup':
        return (
          <Select
            value={data.bloodGroup}
            onValueChange={(value: string) => handleInputChange('bloodGroup', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
              <SelectItem value="unknown">Don't Know</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'height':
      case 'weight':
        return (
          <Input
            type="number"
            value={data[id]}
            onChange={(e) => handleInputChange(id, e.target.value)}
            placeholder={id === 'height' ? 'Height in cm' : 'Weight in kg'}
          />
        );
      case 'hasDiabetes':
      case 'hasHighBloodPressure':
      case 'smoker':
        return (
          <RadioGroup
            value={data[id]}
            onValueChange={(value) => handleInputChange(id, value)}
          >
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${id}-yes`} />
                <Label htmlFor={`${id}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${id}-no`} />
                <Label htmlFor={`${id}-no`}>No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unknown" id={`${id}-unknown`} />
                <Label htmlFor={`${id}-unknown`}>Don't Know</Label>
              </div>
            </div>
          </RadioGroup>
        );
      case 'exerciseFrequency':
      case 'sleepHours':
      case 'stressLevel':
      case 'alcoholConsumption':
        return (
          <Select
            value={data[id]}
            onValueChange={(value: string) => handleInputChange(id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${id.replace(/([A-Z])/g, ' $1').toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {id === 'exerciseFrequency' && [
                <SelectItem key="0" value="0">0 times per week</SelectItem>,
                <SelectItem key="1-2" value="1-2">1-2 times per week</SelectItem>,
                <SelectItem key="3-4" value="3-4">3-4 times per week</SelectItem>,
                <SelectItem key="5+" value="5+">5+ times per week</SelectItem>,
              ]}
              {id === 'sleepHours' && [
                <SelectItem key="<6" value="<6">Less than 6 hours</SelectItem>,
                <SelectItem key="6-7" value="6-7">6-7 hours</SelectItem>,
                <SelectItem key="7-8" value="7-8">7-8 hours</SelectItem>,
                <SelectItem key="8+" value="8+">More than 8 hours</SelectItem>,
              ]}
              {id === 'stressLevel' && [
                <SelectItem key="low" value="low">Low</SelectItem>,
                <SelectItem key="moderate" value="moderate">Moderate</SelectItem>,
                <SelectItem key="high" value="high">High</SelectItem>,
                <SelectItem key="very-high" value="very-high">Very High</SelectItem>,
              ]}
              {id === 'alcoholConsumption' && [
                <SelectItem key="never" value="never">Never</SelectItem>,
                <SelectItem key="occasionally" value="occasionally">Occasionally</SelectItem>,
                <SelectItem key="weekly" value="weekly">Weekly</SelectItem>,
                <SelectItem key="daily" value="daily">Daily</SelectItem>,
              ]}
            </SelectContent>
          </Select>
        );
      case 'dietType':
        return (
          <Select
            value={data.dietType}
            onValueChange={(value: string) => handleInputChange('dietType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Diet Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="omnivore">Omnivore</SelectItem>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
              <SelectItem value="pescatarian">Pescatarian</SelectItem>
              <SelectItem value="keto">Keto</SelectItem>
              <SelectItem value="paleo">Paleo</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'allergies':
      case 'chronicConditions':
      case 'medications':
        return (
          <Input
            value={data[id]}
            onChange={(e) => handleInputChange(id, e.target.value)}
            placeholder={`Enter ${id} (comma-separated)`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-blue-800">Health Questionnaire</h1>
            <Link href="/health-assistant">
              <Button variant="outline">Back to Chat</Button>
            </Link>
          </div>
          <Progress 
            value={((currentSection + 1) / questions.length) * 100} 
            className="mb-8 h-2 bg-blue-200"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-semibold mb-4 text-blue-700">
                {questions[currentSection].title}
              </h2>
              {questions[currentSection].questions.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 bg-white rounded-lg shadow-md"
                >
                  <h3 className="text-xl font-medium mb-4 text-blue-600">{q.question}</h3>
                  {renderQuestion(q.id, q.question)}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-8">
            <Button 
              onClick={handlePrevious} 
              disabled={currentSection === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition duration-300"
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition duration-300"
            >
              {currentSection === questions.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthQuestionnairePage;