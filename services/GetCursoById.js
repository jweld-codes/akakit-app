import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getCursoById = async(cursoId) => {
  try {
    if (!cursoId) {
      //console.warn("getCursoById: ID de curso inválido:", cursoId);
      return null;
    }

   //console.log("Buscando curso con ID:", cursoId);
    
    const cursoRef = collection(db, "idCursoCollection");
    const q = query(cursoRef, where("curso_id", "==", cursoId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      //console.log("Curso encontrado:", data);
      return data;
    } else {
      console.log("No se encontró ninguna clase con ese curso ID:", cursoId);
      return null;
    }
  } catch (e) {
    console.error("Error obteniendo el curso id:", e);
    return null;
  }
}