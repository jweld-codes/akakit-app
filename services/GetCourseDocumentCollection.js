// services/GetCourseDocumentCollection.js
export const getCourseDocumentCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return documents;
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return [];
  }
};