// services/GetRecursosByClassId.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const getRecursosByClassId = async (classId) => {
  try {
    const recursosRef = collection(db, 'idRecursosCollection');
    const q = query(recursosRef, where('recurso_clase_id', '==', classId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      //console.log('No se encontraron recursos para esta clase');
      return [];
    }
    
    const recursos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return recursos;
    
  } catch (error) {
    console.error('Error obteniendo recursos:', error);
    return [];
  }
};