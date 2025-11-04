
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getClassDocumentCollection = async (collectionName) => {
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const dataClassList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return dataClassList;

  } catch (error) {
    console.error(`Error al obtener los documentos de ${collectionName}:`, error);
    return [];
  }
};
