// services/UpdateClassGrade.js
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const updateClassGrade = async (classId, notaFinal) => {
  try {
    if (!classId) {
      console.error('ID de clase no proporcionado');
      return false;
    } 

    const notaFinalNum = parseFloat(notaFinal);
    if (isNaN(notaFinalNum)) {
      console.error('Nota final inválida:', notaFinal);
      return false;
    }    

    const classSnap = await getDocs(collection(db, "idClaseCollection"));
    const claseDoc = classSnap.docs.find(doc => {
      const data = doc.data();
      return (
        data.clase_id === classId || 
        data.clase_id === String(classId) ||
        data.clase_id === Number(classId)
      );
    });

       if (!claseDoc) {
      console.error(`No se encontró clase con clase_id: ${classId}`);
      return false;
    }

    // Actualizar el documento encontrado
    const classRef = doc(db, 'idClaseCollection', claseDoc.id);
    
    await updateDoc(classRef, {
      class_promedio: notaFinalNum.toFixed(2),
      class_fecha_actualizacion: new Date()
    });

    //console.log(`Promedio actualizado para clase_id ${classId} (doc: ${claseDoc.id}): ${notaFinalNum.toFixed(2)}`);
    return true;
    
  } catch (error) {
    console.error('Error al actualizar promedio:', error);
    //console.error('clase_id recibido:', classId);
    //console.error('Nota final recibida:', notaFinal);
    return false;
  }
};