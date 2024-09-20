'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import {auth} from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';


interface QuestionnaireData {
  bloodGroup: string;
  hasDiabetes: boolean;
  maxSugarLevel?: string;
  minSugarLevel?: string;
  hasHighBloodPressure: boolean;
  maxBloodPressure?: string;
}

const HealthQuestionnairePage: React.FC = () => {
  const [data, setData] = useState<QuestionnaireData>({
    bloodGroup: '',
    hasDiabetes: false,
    hasHighBloodPressure: false,
  });
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.error('User not authenticated');
        alert('User not authenticated. Please log in again.');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated. Please log in again.');
      router.push('/');
      return;
    }

    try {
        console.log('Current user:', user);
        await setDoc(doc(db, 'healthQuestionnaires', user.uid), data);
        alert('Health questionnaire submitted successfully!');
        router.push('/health-assistant');
      } catch (error) {
        console.error('Error submitting questionnaire:', error);
        alert(`Failed to submit questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Health Questionnaire</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>Blood Group</label>
              <Select
                value={data.bloodGroup}
                onValueChange={(value: string) => setData(prev => ({ ...prev, bloodGroup: value }))}
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
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDiabetes"
                checked={data.hasDiabetes}
                onCheckedChange={handleCheckboxChange('hasDiabetes')}
              />
              <label htmlFor="hasDiabetes">Do you have diabetes?</label>
            </div>

            {data.hasDiabetes && (
              <>
                <Input
                  name="maxSugarLevel"
                  value={data.maxSugarLevel || ''}
                  onChange={handleInputChange}
                  placeholder="Max Sugar Level (mg/dL)"
                  type="number"
                />
                <Input
                  name="minSugarLevel"
                  value={data.minSugarLevel || ''}
                  onChange={handleInputChange}
                  placeholder="Min Sugar Level (mg/dL)"
                  type="number"
                />
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasHighBloodPressure"
                checked={data.hasHighBloodPressure}
                onCheckedChange={handleCheckboxChange('hasHighBloodPressure')}
              />
              <label htmlFor="hasHighBloodPressure">Do you have high blood pressure?</label>
            </div>

            {data.hasHighBloodPressure && (
              <Input
                name="maxBloodPressure"
                value={data.maxBloodPressure || ''}
                onChange={handleInputChange}
                placeholder="Max Blood Pressure (mmHg)"
                type="number"
              />
            )}

            <Button type="submit">Submit Questionnaire</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthQuestionnairePage;