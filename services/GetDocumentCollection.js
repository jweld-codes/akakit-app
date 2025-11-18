// services/GetDocumentCollection.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getDocumentCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const dataList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return dataList;
  } catch (error) {
    //console.error(`Error al obtener los documentos de ${collectionName}:`, error);
    return [];
  }
  
};
