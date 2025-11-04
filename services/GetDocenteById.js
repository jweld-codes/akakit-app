import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function getDocenteById(docenteId) {
  try {
    if (!docenteId) {
      console.warn("getDocenteById: ID de docente inválido:", docenteId);
      return null;
    }

    //console.log("Buscando docente con ID:", docenteId);

    const docentesRef = collection(db, "idDocentesCollection");
    const q = query(docentesRef, where("docente_id", "==", docenteId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      //console.log("Docente encontrado:", data);

      return data
    } else {
      //console.log("No se encontró ningún docente con ese ID");
      return null;
    }
  } catch (e) {
    //console.error("Error obteniendo docente:", e);
    return null;
  }
}
