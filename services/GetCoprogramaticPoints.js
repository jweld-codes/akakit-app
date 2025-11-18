import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// services/GetCoprogramaticPoints.js
export const getCoprogramaticPoints = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'idEventosCollection'));
    
    let totalPoints = 0;
    let attendedEvents = 0;
    
    eventsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Solo contar eventos a los que asistió
      if (data.evento_assist === 'Si' || data.evento_assist === true) {
        totalPoints += parseFloat(data.evento_puntos_copro || 0);
        attendedEvents++;
      }
    });

    return {
      totalPoints,
      attendedEvents,
      totalEvents: eventsSnapshot.size
    };
  } catch (error) {
    console.error('Error al calcular puntos coprogramáticos:', error);
    return {
      totalPoints: 0,
      attendedEvents: 0,
      totalEvents: 0
    };
  }
};