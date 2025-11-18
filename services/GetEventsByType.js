// services/GetEventsByType.js
import { where } from 'firebase/firestore';

export const getEventsByType = async (type = 'all') => {
  try {
    let q;
    if (type === 'all') {
      q = collection(db, 'idEventosCollection');
    } else {
      q = query(
        collection(db, 'idEventosCollection'),
        where('evento_tipo', '==', type)
      );
    }

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return events;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];
  }
};