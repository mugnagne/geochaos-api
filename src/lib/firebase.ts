import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration from environment variables
const getEnvConfig = () => ({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
});

let firebaseApp: any = null;
let firestoreDb: any = null;
let firebaseAuth: any = null;

async function getFirebaseConfig() {
  const envConfig = getEnvConfig();
  if (envConfig.apiKey) return envConfig;

  try {
    // We attempt to load the local config file only if env vars are missing.
    // This is useful for the AI Studio preview environment.
    // We use a dynamic import to avoid build errors on GitHub where this file is ignored.
    // @ts-ignore
    const localConfig = await import('../../firebase-applet-config.json');
    return localConfig.default;
  } catch (e) {
    console.error("Firebase configuration not found in environment variables or local fallback.");
    return null;
  }
}

export const getApp = async () => {
  if (!firebaseApp) {
    const config = await getFirebaseConfig();
    if (!config) throw new Error("Firebase config missing");
    firebaseApp = initializeApp(config);
  }
  return firebaseApp;
};

export const getDb = async () => {
  if (!firestoreDb) {
    const app = await getApp();
    const config = await getFirebaseConfig();
    firestoreDb = getFirestore(app, config?.firestoreDatabaseId);
  }
  return firestoreDb;
};

export const getAuthInstance = async () => {
  if (!firebaseAuth) {
    const app = await getApp();
    firebaseAuth = getAuth(app);
  }
  return firebaseAuth;
};

// For backward compatibility and ease of use in most components, 
// we also export the direct instances. 
// We use the environment variables which are now set up in .env 
// and will be available both in AI Studio and on GitHub/Netlify (if configured).
const finalConfig = getEnvConfig();

// If apiKey is missing here, it means .env wasn't loaded or isn't set.
if (!finalConfig.apiKey) {
  console.warn("Firebase API Key is missing! Ensure you've set up VITE_FIREBASE_API_KEY in your environment variables (Netlify/GitHub).");
}

export const app = initializeApp(finalConfig.apiKey ? finalConfig : { ...finalConfig, apiKey: 'MISSING' });
export const db = getFirestore(app, finalConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
