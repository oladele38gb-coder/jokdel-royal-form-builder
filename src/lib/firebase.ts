import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { FormResponse, ResponseStatus, StaffNote } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBEt0BZKat2idUIAKVza--cv8NYzvjVZBA",
  authDomain: "jokdel-forms.firebaseapp.com",
  projectId: "jokdel-forms",
  storageBucket: "jokdel-forms.firebasestorage.app",
  messagingSenderId: "823971413383",
  appId: "1:823971413383:web:05ea556fc6fb389f2c2722",
  measurementId: "G-J6ZEZMZYK9"
};

// Initialize Firebase App & Cloud Firestore
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const RESPONSES_COLLECTION = 'responses';

/**
 * Subscribe to real-time updates for form responses.
 * Triggers automatically whenever any client submits or updates a response.
 */
export function subscribeToResponses(
  onUpdate: (responses: FormResponse[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, RESPONSES_COLLECTION), orderBy('submittedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: FormResponse[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FormResponse);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore subscription error (check rules if permission denied):', err);
      onError?.(err);
    }
  );
}

/**
 * Save new submission to Firestore
 */
export async function saveResponseToFirestore(response: FormResponse): Promise<void> {
  await setDoc(doc(db, RESPONSES_COLLECTION, response.id), response);
}

/**
 * Update response status in Firestore
 */
export async function updateResponseStatusInFirestore(
  responseId: string,
  newStatus: ResponseStatus,
  newNotes: StaffNote[]
): Promise<void> {
  await updateDoc(doc(db, RESPONSES_COLLECTION, responseId), {
    status: newStatus,
    notes: newNotes,
  });
}

/**
 * Add note to response in Firestore
 */
export async function addResponseNoteInFirestore(
  responseId: string,
  updatedNotes: StaffNote[]
): Promise<void> {
  await updateDoc(doc(db, RESPONSES_COLLECTION, responseId), {
    notes: updatedNotes,
  });
}

/**
 * Delete a single response from Firestore
 */
export async function deleteResponseFromFirestore(responseId: string): Promise<void> {
  await deleteDoc(doc(db, RESPONSES_COLLECTION, responseId));
}

/**
 * Clear all responses in Firestore
 */
export async function clearAllResponsesFromFirestore(): Promise<void> {
  const snapshot = await getDocs(collection(db, RESPONSES_COLLECTION));
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}
