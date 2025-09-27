import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Read Firebase API key from Vite environment variables
const apiKeyFromEnv = import.meta?.env?.VITE_FIREBASE_API_KEY as string | undefined;

const firebaseConfig = {
  apiKey: apiKeyFromEnv,
  projectId: 'greenpath-9a7f8',
  storageBucket: 'greenpath-9a7f8.firebasestorage.app',
  messagingSenderId: '223498735725',
  appId: '1:223498735725:web:3d5e585c1883e1f6382f64',
  measurementId: 'G-JPY9354HKP',
};

let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  if (!firebaseConfig.apiKey) {
    console.warn('VITE_FIREBASE_API_KEY not set. Creating mock Firebase app.');
    // Return a mock app object to prevent crashes
    cachedApp = {} as FirebaseApp;
    return cachedApp;
  }
  try {
    cachedApp = initializeApp(firebaseConfig);
    return cachedApp;
  } catch (e) {
    console.error('Failed to initialize Firebase app:', e);
    // Return mock app on error to prevent crashes
    cachedApp = {} as FirebaseApp;
    return cachedApp;
  }
}

export function getAuthInstance(): Auth {
  const app = getFirebaseApp();
  if (!firebaseConfig.apiKey) {
    // Return mock auth when Firebase is not configured
    return {} as Auth;
  }
  return getAuth(app);
}

export function getDb(): Firestore {
  const app = getFirebaseApp();
  return getFirestore(app);
}

export default getFirebaseApp;


