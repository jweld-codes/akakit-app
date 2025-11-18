// services/getClassById.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getRequiredClass = async (id) => {
  try {
    const claseRef = collection(db, "idFlujogramaClases");
    const q = query(claseRef, where("fc_id", "==", id));
    const snap = await getDocs(q);

    if (!snap.empty) return snap.docs[0].data();
    return null;

  } catch (e) {
    console.error("Error obteniendo clase:", e);
    return null;
  }
};
