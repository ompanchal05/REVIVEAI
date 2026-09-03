import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { RecoveryCase, AuditLog, PolicyConfig } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  };
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

// MANDATORY: Call getDocFromServer on initial boot to test connection
export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore server connection verified successfully.');
    return { connected: true, message: 'Firestore connection active' };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Client is offline or database configuration needs review.');
      return { connected: false, message: 'Client offline: please check network/Firebase setup' };
    }
    // Non-existent document or permission is still a valid response confirming reaching the server
    console.log('[Firebase] Connection reached Firestore server:', error?.message || error);
    return { connected: true, message: 'Connected to Firestore server' };
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('[Firebase Auth] Sign in failed:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('[Firebase Auth] Sign out failed:', err);
    throw err;
  }
}

// Firestore Persistence Services
export async function syncCaseToFirestore(recoveryCase: RecoveryCase, user: User): Promise<void> {
  const path = `cases/${recoveryCase.id}`;
  try {
    const caseRef = doc(db, 'cases', recoveryCase.id);
    const payload = {
      ...recoveryCase,
      owner_id: user.uid,
      updated_at: new Date().toISOString()
    };
    await setDoc(caseRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncAuditLogToFirestore(auditLog: AuditLog, user: User): Promise<void> {
  const path = `audit_logs/${auditLog.id}`;
  try {
    const logRef = doc(db, 'audit_logs', auditLog.id);
    const payload = {
      ...auditLog,
      owner_id: user.uid
    };
    await setDoc(logRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function syncPolicyToFirestore(policy: PolicyConfig, user: User): Promise<void> {
  const path = `policies/default_guardrails`;
  try {
    const policyRef = doc(db, 'policies', 'default_guardrails');
    const payload = {
      ...policy,
      id: 'default_guardrails',
      updated_by: user.email || user.uid,
      updated_at: new Date().toISOString()
    };
    await setDoc(policyRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getPolicyFromFirestore(): Promise<PolicyConfig | null> {
  const path = `policies/default_guardrails`;
  try {
    const policyRef = doc(db, 'policies', 'default_guardrails');
    const snap = await getDoc(policyRef);
    if (snap.exists()) {
      return snap.data() as PolicyConfig;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function fetchUserCasesFromFirestore(user: User): Promise<RecoveryCase[]> {
  const path = 'cases';
  try {
    const q = query(collection(db, 'cases'), where('owner_id', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => docSnap.data() as RecoveryCase);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export { onAuthStateChanged };
