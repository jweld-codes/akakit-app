// services/GetClassFinished.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getClassFinished = async () => {
  try {
    const classesRef = collection(db, "idClaseCollection");
    const q = query(classesRef, where("class_enrollment", "==", "En Curso"));
    
    const classesSnapshot = await getDocs(q);
    
    const classList = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`${classList.length} clases en curso encontradas`);
    
    return classList;
  } catch (error) {
    console.error("Error al obtener clases en curso:", error);
    return [];
  }
};

export const getClassesByEnrollment = async (enrollmentStatus = "En Curso") => {
  try {
    const classesRef = collection(db, "idClaseCollection");
    const q = query(classesRef, where("class_enrollment", "==", enrollmentStatus));
    
    const classesSnapshot = await getDocs(q);
    
    const classList = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`${classList.length} clases con estado "${enrollmentStatus}" encontradas`);
    
    return classList;
  } catch (error) {
    console.error(`Error al obtener clases con estado "${enrollmentStatus}":`, error);
    return [];
  }
};
