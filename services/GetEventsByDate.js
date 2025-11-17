// services/GetEventsByDate.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getEventsByDate = async (date) => {
  try {
    // Crear inicio y fin del día
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await getDocs(collection(db, "idEventosCollection"));
    
    const eventos = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        evento_fecha_date: doc.data().evento_fecha?.toDate(),
      }))
      .filter(evento => {
        const eventoDate = evento.evento_fecha_date;
        return eventoDate && 
               eventoDate >= startOfDay && 
               eventoDate <= endOfDay &&
               evento.evento_estado === "Activo";
      })
      .sort((a, b) => a.evento_fecha_date - b.evento_fecha_date);

    //console.log(`Eventos en ${date.toLocaleDateString()}:`, eventos.length);
    return eventos;
  } catch (error) {
    console.error("Error al obtener eventos del día:", error);
    return [];
  }
};

/**
 * Formatear la hora del evento
 */
export const formatEventTime = (date) => {
  if (!date) return "";
  return date.toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};