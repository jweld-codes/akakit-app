import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getPeriodById = async(periodoId) => {
    try{
        if(!periodoId){
            return null;
        }
        

        const periodoRef = collection(db, "idPeriodoCollection");
        const q = query(periodoRef, where("periodo_id", "==", periodoId));
        const snap = await getDocs(q);

        if (!snap.empty) {
        const data = snap.docs[0].data();
        //console.log("Periodo encontrado:", data);
        return data;
        } else {
        //console.log("No se encontró ninguna clase con ese periodo ID:", periodoId);
        return null;
        }
    } catch (e) {
        //console.error("Error obteniendo el periodo id:", e);
        return null;
    }
}