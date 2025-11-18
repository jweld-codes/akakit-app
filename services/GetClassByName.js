import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getClassByName = async(claseName) => {
  try {
    if (!claseName) {
      console.warn("getClassByName: Nombre de clase inválido:", claseName);
      return null;
    }

   //console.log("Buscando clase con Nombre:", claseName);
    
    const claseRef = collection(db, "idClaseCollection");
    const q = query(claseRef, where("class_name", "==", claseName));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      //console.log("Clase encontrada:", data);
      return data;
    } else {
      //console.log("No se encontró ninguna clase con ese nombre:", claseName);
      return null;
    }
  } catch (e) {
    console.error("Error obteniendo nombre de la clase:", e);
    return null;
  }
}