// src/api/firebaseApi.ts
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, DocumentData } from 'firebase/firestore';

const dataCollection = collection(db, 'yourCollectionName');

export const createData = async (data: DocumentData): Promise<{ id: string; [key: string]: any }> => {
  const docRef = doc(dataCollection);
  await setDoc(docRef, data);
  return { id: docRef.id, ...data };
};

export const getAllData = async (): Promise<Array<{ id: string; [key: string]: any }>> => {
  const snapshot = await getDocs(dataCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDataById = async (id: string): Promise<{ id: string; [key: string]: any } | null> => {
  const docRef = doc(dataCollection, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateData = async (id: string, data: Partial<DocumentData>): Promise<{ id: string; [key: string]: any }> => {
  const docRef = doc(dataCollection, id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const deleteData = async (id: string): Promise<{ id: string }> => {
  const docRef = doc(dataCollection, id);
  await deleteDoc(docRef);
  return { id };
};

