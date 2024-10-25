'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doc, setDoc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from '@/components/Sidebar';
import { FileText, Upload, Folder, Eye, Download, Trash2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

interface MedicalRecord {
  fileName: string;
  category: string;
  uploadDate: string;
  fileURL: string;
}

const diseaseCategories = [
  'Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Neurological',
  'Musculoskeletal', 'Endocrine', 'Other'
];

const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<{ [key: string]: MedicalRecord[] }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadMedicalRecords(user.uid);
      } else {
        console.error('User not authenticated');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadMedicalRecords = async (userId: string) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'medicalRecords', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRecords(data as { [key: string]: MedicalRecord[] });
      } else {
        // Initialize with an empty object if no records exist
        setRecords({});
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
      toast({
        title: "Error",
        description: "Failed to load medical records. Please try again.",
        variant: "destructive",
      });
      // Initialize with an empty object on error
      setRecords({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedCategory || !auth.currentUser) return;

    setIsUploading(true);
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `medicalRecords/${userId}/${selectedCategory}/${file.name}`);
    
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const newRecord: MedicalRecord = {
        fileName: file.name,
        category: selectedCategory,
        uploadDate: new Date().toISOString(),
        fileURL: downloadURL
      };

      const updatedRecords = { ...records };
      if (!updatedRecords[selectedCategory]) {
        updatedRecords[selectedCategory] = [];
      }
      updatedRecords[selectedCategory].push(newRecord);

      // Update Firestore
      const userDocRef = doc(db, 'medicalRecords', userId);
      await setDoc(userDocRef, updatedRecords, { merge: true });

      // Update local state
      setRecords(updatedRecords);
      
      setFile(null);
      setSelectedCategory('');
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (record: MedicalRecord) => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `medicalRecords/${userId}/${record.category}/${record.fileName}`);

    try {
      await deleteObject(storageRef);
      const updatedRecords = { ...records };
      updatedRecords[record.category] = updatedRecords[record.category].filter(r => r.fileName !== record.fileName);
      await updateDoc(doc(db, 'medicalRecords', userId), {
        [record.category]: arrayRemove(record)
      });
      setRecords(updatedRecords);
      toast({
        title: "Success",
        description: "Record deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredRecords = React.useMemo(() => {
    return Object.entries(records).reduce((acc, [category, categoryRecords]) => {
      const filtered = categoryRecords.filter(record => 
        record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    }, {} as { [key: string]: MedicalRecord[] });
  }, [records, searchTerm]);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        createNewChat={() => {}}
        setActiveTab={() => {}}
        activeTab="records"
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-start justify-start p-8 overflow-y-auto">
          <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mb-8">
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center mb-6">
                <FileText className="mr-3" size={32} />
                Medical Records
              </h1>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-8">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Upload New Record</h2>
                <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
                  <div className="w-full md:w-1/3">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</Label>
                    <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                      <SelectTrigger className="bg-white dark:bg-gray-600">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-600">
                        {diseaseCategories.map((category) => (
                          <SelectItem key={category} value={category} className="text-gray-800 dark:text-gray-200">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-1/3">
                    <Label htmlFor="file" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">File (PDF only)</Label>
                    <Input id="file" type="file" onChange={handleFileChange} className="bg-white dark:bg-gray-600" accept=".pdf" />
                  </div>
                  <Button 
                    onClick={handleUpload} 
                    disabled={!file || !selectedCategory || isUploading}
                    className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-300"
                  >
                    {isUploading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <Upload className="mr-2" size={16} />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="search" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Search Records</Label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by file name or category"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <Tabs defaultValue={diseaseCategories[0]} className="w-full">
                  <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                    {diseaseCategories.map((category) => (
                      <TabsTrigger key={category} value={category} className="px-4 py-2 text-sm">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {diseaseCategories.map((category) => (
                    <TabsContent key={category} value={category}>
                      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{category} Records</h2>
                      {filteredRecords[category] && filteredRecords[category].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredRecords[category].map((record, index) => (
                            <Card key={index} className="bg-white dark:bg-gray-700 hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center overflow-hidden">
                                    <Folder className="mr-2 flex-shrink-0 text-blue-500" size={20} />
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={record.fileName}>
                                      {record.fileName}
                                    </span>
                                  </div>
                                  <div className="flex space-x-2 flex-shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedPDF(record.fileURL)}>
                                      <Eye size={16} />
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={record.fileURL} download>
                                        <Download size={16} />
                                      </a>
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setRecordToDelete(record)}>
                                          <Trash2 size={16} />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Confirm Deletion</DialogTitle>
                                          <DialogDescription>
                                            Are you sure you want to delete this record? This action cannot be undone.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => setRecordToDelete(null)}>Cancel</Button>
                                          <Button variant="destructive" onClick={() => {
                                            if (recordToDelete) {
                                              handleDelete(recordToDelete);
                                              setRecordToDelete(null);
                                            }
                                          }}>Delete</Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Uploaded on: {new Date(record.uploadDate).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No records found for this category.</p>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
          {selectedPDF && (
            <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">PDF Viewer</h2>
                  <Button onClick={() => setSelectedPDF(null)}>Close</Button>
                </div>
                <div className="w-full h-[600px]">
                  <iframe
                    src={`${selectedPDF}#view=FitH`}
                    title="PDF Viewer"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
