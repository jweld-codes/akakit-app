// services/GetPendingTasks.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getPendingTasks = async (limit = 10) => {
  try {
    const tasksSnapshot = await getDocs(collection(db, "idTareasCollection"));
    const classesSnapshot = await getDocs(collection(db, "idClaseCollection"));
    
    const classList = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar tareas en curso
    const taskList = tasksSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(task => 
        task.tarea_estado === "En Proceso" || 
        task.tarea_estado === "Pendiente"
      );

    const tasksWithClassInfo = taskList.map((task) => {
      const clase = classList.find(
        (cls) => cls.id === task.tarea_id_clase || cls.clase_id === task.tarea_id_clase
      );

      const fechaEntrega = task.tarea_fecha_entrega?.seconds
        ? new Date(task.tarea_fecha_entrega.seconds * 1000)
        : null;

      return {
        ...task,
        class_name: clase ? clase.class_name : "Clase no encontrada",
        class_section: clase ? clase.class_section : "N/A",
        class_type: clase ? clase.class_type : "General",
        tarea_fecha_entrega_date: fechaEntrega,
      };
    });

    const sortedTasks = tasksWithClassInfo
      .filter(task => task.tarea_fecha_entrega_date) // Solo tareas con fecha
      .sort((a, b) => a.tarea_fecha_entrega_date - b.tarea_fecha_entrega_date);

    //console.log(`${sortedTasks.length} tareas pendientes encontradas`);
    
    return sortedTasks.slice(0, limit);
  } catch (error) {
    console.error("Error al obtener tareas pendientes:", error);
    return [];
  }
};

// Función para obtener días restantes hasta la entrega
export const getDaysUntilDeadline = (deadlineDate) => {
  if (!deadlineDate) return "Sin fecha";
  
  const now = new Date();
  const deadline = deadlineDate instanceof Date ? deadlineDate : new Date(deadlineDate);
  
  // Resetear horas para comparar solo días
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Atrasada";
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays <= 7) return `${diffDays} días`;
  
  return `${Math.ceil(diffDays / 7)} semanas`;
};

// Función para determinar el color del badge según urgencia
export const getUrgencyColor = (deadlineDate) => {
  if (!deadlineDate) return "#999";
  
  const now = new Date();
  const deadline = deadlineDate instanceof Date ? deadlineDate : new Date(deadlineDate);
  
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "#e74c3c"; // Rojo - Atrasada
  if (diffDays === 0) return "#e67e22"; // Naranja - Hoy
  if (diffDays <= 2) return "#f39c12"; // Amarillo - Muy pronto
  if (diffDays <= 7) return "#3498db"; // Azul - Esta semana
  
  return "#27ae60"; // Verde - Tiempo suficiente
};