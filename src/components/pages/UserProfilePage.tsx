'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserProfile {
  name: string;
  email: string;
  secondaryEmail: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  medicalRecordUrl?: string;
}

const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    secondaryEmail: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // First, get the basic user data
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        // Then, get the profile data
        const profileDocRef = doc(db, 'userProfiles', user.uid);
        const profileDocSnap = await getDoc(profileDocRef);

        if (profileDocSnap.exists()) {
          // If profile exists, use it
          setProfile({ ...profileDocSnap.data() as UserProfile });
        } else if (userDocSnap.exists()) {
          // If profile doesn't exist but user data does, initialize profile with user data
          const userData = userDocSnap.data();
          setProfile({
            name: userData.name || '',
            email: userData.email || '',
            secondaryEmail: '',
            dateOfBirth: '',
            gender: '',
            height: '',
            weight: '',
          });
        } else {
          // If neither exists (shouldn't happen), initialize with empty data
          setProfile({ ...profile, email: user.email || '' });
        }
      } else {
        console.error('User not authenticated');
        alert('User not authenticated. Please log in again.');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name !== 'email') { // Prevent email from being changed
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
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
      if (file) {
        const storageRef = ref(storage, `medicalRecords/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        profile.medicalRecordUrl = downloadURL;
      }
  
      // Update both the users collection and the userProfiles collection
      await setDoc(doc(db, 'users', user.uid), { name: profile.name, email: profile.email }, { merge: true });
      await setDoc(doc(db, 'userProfiles', user.uid), profile);

      alert('Profile updated successfully!');
      router.push('/health-assistant');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">User Profile</h1>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Full Name"
              />
              <Input
                name="email"
                value={profile.email}
                readOnly
                placeholder="Email"
                type="email"
              />
              <Input
                name="secondaryEmail"
                value={profile.secondaryEmail}
                onChange={handleInputChange}
                placeholder="Secondary Email (for emergency contact)"
                type="email"
              />
              <Input
                name="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={handleInputChange}
                placeholder="Date of Birth"
                type="date"
              />
              <Input
                name="gender"
                value={profile.gender}
                onChange={handleInputChange}
                placeholder="Gender"
              />
              <Input
                name="height"
                value={profile.height}
                onChange={handleInputChange}
                placeholder="Height (cm)"
                type="number"
              />
              <Input
                name="weight"
                value={profile.weight}
                onChange={handleInputChange}
                placeholder="Weight (kg)"
                type="number"
              />
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
              <Button type="submit">Save Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;