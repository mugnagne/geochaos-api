import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

const configModules = import.meta.glob('../../firebase-applet-config.json', { eager: true }) as Record<string, { default: any }>;
const firebaseConfig = configModules['../../firebase-applet-config.json']?.default || {};

const envConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID && import.meta.env.VITE_FIREBASE_DATABASE_ID !== '(default)') 
    ? import.meta.env.VITE_FIREBASE_DATABASE_ID 
    : (firebaseConfig.firestoreDatabaseId || '(default)'),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
};

const isConfigMissing = !envConfig.apiKey || envConfig.apiKey === 'MISSING' || envConfig.apiKey === 'MISSING_PLEASE_CHECK_SETTINGS';

if (typeof window !== 'undefined') {
  console.log("--- 🕵️ DIAGNOSTIC FIREBASE COMPLET ---");
  console.log("URL Actuelle:", window.location.href);
  console.log("Project ID:", envConfig.projectId);
  console.log("Database ID:", envConfig.firestoreDatabaseId);
  console.log("API Key présente ?", !!envConfig.apiKey && envConfig.apiKey !== 'MISSING');
  console.log("Auth Domain:", envConfig.authDomain);
  console.log("-------------------------------------");
}

// Initialize services 
// Si la databaseId est vide, on force l'utilisation de (default) mais on prévient
const finalDbId = envConfig.firestoreDatabaseId || '(default)';
if (finalDbId === '(default)') {
  console.warn("⚠️ Database ID est vide. Utilisation de '(default)'. Si votre base a un ID spécifique (ex: ai-studio-...), la connexion échouera.");
}

export const app = initializeApp(isConfigMissing ? { ...envConfig, apiKey: 'MISSING' } : envConfig);

// Using initializeFirestore instead of getFirestore to provide settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, finalDbId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test 
async function testConnection() {
  try {
    if (!isConfigMissing) {
      // Use getDocFromServer for a strict server check
      await getDocFromServer(doc(db, '_connection_test_', 'test'));
      console.log("✅ Firestore : Connexion établie avec succès.");
    } else {
      console.warn("⚠️ Firestore : Connexion sautée (Config manquante).");
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes('permission')) {
      console.log("ℹ️ Firestore : Le serveur est joignable mais vos règles bloquent l'accès (normal pour un test).");
      return;
    }
    
    console.error("❌ Firestore : Erreur de connexion :", msg);
    
    if (msg.includes('offline')) {
      console.warn("ℹ️ Firestore : Le client se croit hors-ligne. Vérifiez que la variable VITE_FIREBASE_DATABASE_ID est correcte sur Netlify.");
    }
  }
}
// We don't necessarily need to block on this
testConnection();

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
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isOffline = errorMessage.toLowerCase().includes('offline');

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
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

  if (isOffline) {
    console.warn('Firestore Offline: ', JSON.stringify(errInfo));
    // Don't throw for offline errors to allow app logic to continue with local data if possible
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
