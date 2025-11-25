// services/GetUpcomingEvents.js
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getUpcomingEvents = async (limit = 5) => {
  try {
    const now = Timestamp.now();
    
    const q = query(
      collection(db, "idEventosCollection"),
      where("evento_fecha", ">", now),
      where("evento_estado", "==", "Activo"),
      orderBy("evento_fecha", "asc")
    );

    const snapshot = await getDocs(q);
    
    const eventos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      evento_fecha_date: doc.data().evento_fecha?.toDate(),
    }));

    //console.log(`${eventos.length} eventos próximos encontrados`);
    
    return eventos.slice(0, limit);
  } catch (error) {
    console.error("Error al obtener eventos próximos:", error);
    return [];
  }
};

export const isEventPast = (eventoFecha) => {
  if (!eventoFecha) return true;
  
  const eventDate = eventoFecha instanceof Date 
    ? eventoFecha 
    : eventoFecha.toDate();
  
  return eventDate < new Date();
};

export const formatEventDate = (date) => {
  if (!date) return "Fecha no disponible";
  
  const eventDate = date instanceof Date ? date : date.toDate();
  
  return eventDate.toLocaleDateString('es-HN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysUntilEvent = (eventDate) => {
  if (!eventDate) return "Sin fecha";
  
  const now = new Date();
  const event = eventDate instanceof Date ? eventDate : eventDate.toDate();
  
  now.setHours(0, 0, 0, 0);
  event.setHours(0, 0, 0, 0);
  
  const diffTime = event - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Pasado";
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays <= 7) return `${diffDays} días`;
  
  const weeks = Math.ceil(diffDays / 7);
  return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
};

export const getUrgencyColor = (eventDate) => {
  if (!eventDate) return "#999";
  
  const now = new Date();
  const event = eventDate instanceof Date ? eventDate : eventDate.toDate();
  
  // Resetear horas para comparar solo días
  now.setHours(0, 0, 0, 0);
  event.setHours(0, 0, 0, 0);
  
  const diffTime = event - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "#e74c3c"; // Rojo - Pasado
  if (diffDays === 0) return "#e67e22"; // Naranja - Hoy
  if (diffDays <= 2) return "#f39c12"; // Amarillo - Muy pronto (1-2 días)
  if (diffDays <= 7) return "#3498db"; // Azul - Esta semana
  
  return "#27ae60"; // Verde - Tiempo suficiente
};