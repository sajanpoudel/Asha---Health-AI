'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Mail, Calendar, Ruler, Scale, Droplet, AlertTriangle, Edit2, Camera, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  bloodType: string;
  allergies: string;
  profilePicture?: string;
}

interface UserProfilePageProps {
  toggleVoiceListening: (enabled: boolean) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ toggleVoiceListening }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    bloodType: '',
    allergies: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isVoiceListeningEnabled, setIsVoiceListeningEnabled] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileDocRef = doc(db, 'userProfiles', user.uid);
        const profileDocSnap = await getDoc(profileDocRef);

        if (profileDocSnap.exists()) {
          setProfile({ ...profileDocSnap.data() as UserProfile });
        } else {
          setProfile({ ...profile, email: user.email || '' });
        }
      } else {
        console.error('User not authenticated');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated. Please log in again.');
      router.push('/');
      return;
    }
  
    try {
      if (profilePicture) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, profilePicture);
        const downloadURL = await getDownloadURL(storageRef);
        profile.profilePicture = downloadURL;
      }

      await setDoc(doc(db, 'userProfiles', user.uid), profile);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          alert('Error uploading profile picture. Please check your permissions and try again.');
        } else {
          alert(`Failed to update profile: ${error.message}`);
        }
      } else {
        alert('An unknown error occurred while updating the profile.');
      }
    }
  };

  const toggleEditing = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const handleVoiceListeningToggle = useCallback((checked: boolean) => {
    setIsVoiceListeningEnabled(checked);
    toggleVoiceListening(checked);
  }, [toggleVoiceListening]);

  const ProfileField = useMemo(() => {
    return ({ icon, label, value, name }: { icon: React.ReactNode; label: string; value: string; name: string }) => (
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
        {icon}
        <div className="flex-grow">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          {isEditing ? (
            <Input
              name={name}
              value={value}
              onChange={handleInputChange}
              className="mt-1"
            />
          ) : (
            <p className="font-semibold">{value || 'Not specified'}</p>
          )}
        </div>
      </div>
    );
  }, [isEditing, handleInputChange]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8"
    >
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4 md:mb-0 md:mr-6 relative group">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                  <User size={64} className="text-gray-600 dark:text-gray-300" />
                </div>
              )}
              {isEditing && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="text-white" size={24} />
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
            </div>
            <Button 
              onClick={toggleEditing} 
              className="ml-auto"
              variant="outline"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
              <Edit2 size={16} className="ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Mic size={20} />
              <span>Voice Listening</span>
            </div>
            <Switch
              checked={isVoiceListeningEnabled}
              onCheckedChange={handleVoiceListeningToggle}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ProfileField icon={<User size={20} />} label="Name" value={profile.name} name="name" />
              <ProfileField icon={<Mail size={20} />} label="Email" value={profile.email} name="email" />
              <ProfileField icon={<Calendar size={20} />} label="Date of Birth" value={profile.dateOfBirth} name="dateOfBirth" />
              <ProfileField icon={<User size={20} />} label="Gender" value={profile.gender} name="gender" />
              <ProfileField icon={<Ruler size={20} />} label="Height" value={profile.height} name="height" />
              <ProfileField icon={<Scale size={20} />} label="Weight" value={profile.weight} name="weight" />
              <ProfileField icon={<Droplet size={20} />} label="Blood Type" value={profile.bloodType} name="bloodType" />
              <ProfileField icon={<AlertTriangle size={20} />} label="Allergies" value={profile.allergies} name="allergies" />
            </div>

            {isEditing && (
              <Button type="submit" className="w-full">
                Save Profile
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserProfilePage;