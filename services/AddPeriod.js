// services/AddPeriod.js
import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const addPeriod = async (periodData) => {
  try {
    // Obtener el último ID
    const q = query(
      collection(db, 'idPeriodoCollection'),
      orderBy('periodo_id', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    let newPeriodId = "1";
    if (!snapshot.empty) {
      const lastPeriod = snapshot.docs[0].data();
      newPeriodId = String(parseInt(lastPeriod.periodo_id) + 1);
    }

    const docRef = await addDoc(collection(db, 'idPeriodoCollection'), {
      periodo_id: newPeriodId,
      periodo_curso_anio: periodData.curso_anio,
      periodo_fecha_inicio: Timestamp.fromDate(periodData.fecha_inicio),
      periodo_fecha_final: Timestamp.fromDate(periodData.fecha_final),
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      id: docRef.id,
      periodo_id: newPeriodId
    };
  } catch (error) {
    console.error('Error al agregar período:', error);
    return {
      success: false,
      error: error.message
    };
  }
};