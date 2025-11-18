// services/GetPeriodDocumentCollection.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const getPeriodDocumentCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return documents;
  } catch (error) {
    console.error('Error al obtener períodos:', error);
    return [];
  }
};
