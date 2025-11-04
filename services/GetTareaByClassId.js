// getTaskByClassId.js (versión corregida)
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getTaskByClassId = async (classId) => {
   try {
    const tasksSnapshot = await getDocs(collection(db, "idTareasCollection"));
    
    // Filtrar tareas de esta clase
    const tasks = tasksSnapshot.docs
      .map(doc => ({
        id: doc.id,
        docId: doc.id,
        ...doc.data(),
        tarea_fecha_apertura_date: doc.data().tarea_fecha_apertura?.toDate(),
        tarea_fecha_entrega_date: doc.data().tarea_fecha_entrega?.toDate(),
      }))
      .filter(task => 
        task.tarea_id_clase === classId || 
        task.tarea_id_clase === String(classId) ||
        task.tarea_id_clase === Number(classId)
      );

    //console.log(`${tasks.length} tareas encontradas para clase ${classId}`);
    return tasks;
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return [];
  }
};

export const organizeTasksByStructure = (tasks) => {
  const organized = {};

  tasks.forEach(task => {
    const parcial = task.tarea_parcial || "Sin Parcial";
    const semana = task.tarea_semana || "Sin Semana";

    // Crear estructura si no existe
    if (!organized[parcial]) {
      organized[parcial] = {};
    }
    if (!organized[parcial][semana]) {
      organized[parcial][semana] = [];
    }

    // Agregar tarea
    organized[parcial][semana].push(task);
  });

  // Ordenar tareas dentro de cada semana por fecha de entrega
  Object.keys(organized).forEach(parcial => {
    Object.keys(organized[parcial]).forEach(semana => {
      organized[parcial][semana].sort((a, b) => {
        const dateA = a.tarea_fecha_entrega_date || new Date(0);
        const dateB = b.tarea_fecha_entrega_date || new Date(0);
        return dateA - dateB;
      });
    });
  });

  return organized;
};

/**
 * Obtener color según el estado de la tarea
 */
export const getTaskStatusColor = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'completado':
      return '#27ae60';
    case 'en proceso':
      return '#f39c12';
    case 'pendiente':
      return '#3498db';
    case 'atrasada':
      return '#e74c3c';
    default:
      return '#95a5a6';
  }
};

/**
 * Formatear fecha de entrega
 */
export const formatDeadline = (date) => {
  if (!date) return 'Sin fecha';
  
  return date.toLocaleDateString('es-HN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
