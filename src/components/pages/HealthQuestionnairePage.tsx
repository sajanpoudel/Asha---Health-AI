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
import Sidebar from '@/components/Sidebar';
import { ClipboardList } from 'lucide-react';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.error('User not authenticated');
        alert('User not authenticated. Please log in again.');
        router.push('/');
      } else {
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
      case 'exerciseFrequency':
      case 'sleepHours':
      case 'stressLevel':
      case 'alcoholConsumption':
      case 'dietType':
        return (
          <div className="relative">
            <Select
              value={data[id]}
              onValueChange={(value: string) => handleInputChange(id, value)}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-700">
                <SelectValue placeholder={`Select ${id.replace(/([A-Z])/g, ' $1').toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700">
                {id === 'bloodGroup' && [
                  <SelectItem key="A+" value="A+">A+</SelectItem>,
                  <SelectItem key="A-" value="A-">A-</SelectItem>,
                  <SelectItem key="B+" value="B+">B+</SelectItem>,
                  <SelectItem key="B-" value="B-">B-</SelectItem>,
                  <SelectItem key="AB+" value="AB+">AB+</SelectItem>,
                  <SelectItem key="AB-" value="AB-">AB-</SelectItem>,
                  <SelectItem key="O+" value="O+">O+</SelectItem>,
                  <SelectItem key="O-" value="O-">O-</SelectItem>,
                  <SelectItem key="unknown" value="unknown">Don't Know</SelectItem>
                ]}
                {id === 'exerciseFrequency' && [
                  <SelectItem key="0" value="0">0 times per week</SelectItem>,
                  <SelectItem key="1-2" value="1-2">1-2 times per week</SelectItem>,
                  <SelectItem key="3-4" value="3-4">3-4 times per week</SelectItem>,
                  <SelectItem key="5+" value="5+">5+ times per week</SelectItem>
                ]}
                {/* Add similar options for other select fields */}
              </SelectContent>
            </Select>
          </div>
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

  // Update this function to correctly calculate progress
  const calculateProgress = () => {
    const totalQuestions = questions.reduce((acc, section) => acc + section.questions.length, 0);
    const answeredQuestions = Object.values(data).filter(value => value !== '').length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        createNewChat={() => {}}
        setActiveTab={() => {}}
        activeTab="questionnaire"
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-start justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden my-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <ClipboardList className="mr-2" size={24} />
                  Health Questionnaire
                </h1>
              </div>
              <Progress 
                value={calculateProgress()} 
                className="mb-6 h-2 bg-gray-200 dark:bg-gray-700"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    {questions[currentSection].title}
                  </h2>
                  {questions[currentSection].questions.map((q) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md mb-8"
                    >
                      <h3 className="text-base font-medium mb-3 text-gray-600 dark:text-gray-300">{q.question}</h3>
                      <div className="mb-2">
                        {renderQuestion(q.id, q.question)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={handlePrevious} 
                  disabled={currentSection === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition duration-300 text-sm"
                >
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition duration-300 text-sm"
                >
                  {currentSection === questions.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthQuestionnairePage;
