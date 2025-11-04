// services/GetMarkedDates.js
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getMarkedDates = async () => {
  try {
    const now = Timestamp.now();
    
    // Obtener eventos activos
    const q = query(
      collection(db, "idEventosCollection"),
      where("evento_estado", "==", "Activo")
    );

    const snapshot = await getDocs(q);
    const markedDates = {};

    snapshot.docs.forEach(doc => {
      const evento = doc.data();
      const eventoDate = evento.evento_fecha?.toDate();
      
      if (eventoDate) {
        // Formato YYYY-MM-DD requerido por react-native-calendars
        const dateString = eventoDate.toISOString().split('T')[0];
        
        if (!markedDates[dateString]) {
          markedDates[dateString] = {
            marked: true,
            dotColor: '#db34b1ff',
            activeOpacity: 0.5,
          };
        }
      }
    });

   // console.log('Fechas marcadas:', Object.keys(markedDates).length);
    return markedDates;
  } catch (error) {
    console.error("Error al obtener fechas marcadas:", error);
    return {};
  }
};