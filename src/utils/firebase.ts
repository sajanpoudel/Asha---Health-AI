import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAL--H2Gl47f8hfu1zovK_oKNmeNkjnkd0",
    authDomain: "ashaai-cf728.firebaseapp.com",
    projectId: "ashaai-cf728",
    storageBucket: "ashaai-cf728.appspot.com",
    messagingSenderId: "147157345320",
    appId: "1:147157345320:web:576b6c8066d80cdfe7811d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Optionally export the app if needed elsewhere
export default app;