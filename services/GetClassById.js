import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getClassById = async(claseIdd) => {
  try {
    if (!claseIdd) {
      //console.warn("getClassById: ID de clase inválido:", claseIdd);
      return null;
    }

   //console.log("Buscando clase con ID:", claseIdd); // Debug
    
    const claseRef = collection(db, "idClaseCollection");
    const q = query(claseRef, where("clase_id", "==", claseIdd));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      //console.log("Clase encontrada:", data); // Debug
      return data;
    } else {
      console.log("No se encontró ninguna clase con ese ID:", claseIdd);
      return null;
    }
  } catch (e) {
    console.error("Error obteniendo la clase id:", e);
    return null;
  }
}