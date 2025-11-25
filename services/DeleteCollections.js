import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "./config";

export const deleteAllDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));

    const batchDeletes = [];
    querySnapshot.forEach((document) => {
      batchDeletes.push(deleteDoc(doc(db, collectionName, document.id)));
    });

    await Promise.all(batchDeletes);

    return true;
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
};
