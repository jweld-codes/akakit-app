// contexts/OverviewDataContext.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import colors from '../constants/colors';
import { getDocumentCollection } from '../services/GetDocumentCollection';

// Keys para AsyncStorage
const STORAGE_KEYS = {
  TASKS: '@overview_tasks_metadata',
  CLASSES: '@overview_classes_metadata',
  LAST_UPDATE: '@overview_last_update',
};

const OverviewDataContext = createContext();

export const useOverviewData = ({ children }) => {
  const context = useContext(OverviewDataContext);
  if (!context) {
    throw new Error('useOverviewData debe usarse dentro de OverviewDataProvider');
  }
  return context;
};

// Provider del contexto
export const OverviewDataProvider = ({ children }) => {
  // Estados para Tasks
  const [taskStatus, setTaskStatus] = useState([]);
  const [tasksMetadata, setTasksMetadata] = useState({
    completed: 0,
    inProgress: 0,
    total: 0,
  });

   const [tasksValueMetadata, setTasksValueMetadata] = useState({
    tareas_con_valor_inicial: 0,
    tareas_calificadas: 0,
    valor_total_obtenido: '0.00',
    valor_total_posible: '0.00',
    promedio_general: '0.00',
    porcentaje_completado: '0.00',
    promedios_por_periodo: {},
    promedios_por_clase: {},
  });

  // Estados para Classes
  const [clasee, setClassList] = useState([]);
  const [classesMetadata, setClassesMetadata] = useState({
    enrolled: 0,
    finished: 0,
    remaining: 0,
    total: 0,
  });

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Función helper para validar y parsear JSON
  const safeJsonParse = (jsonString, fallback = null) => {
    try {
      if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
        return fallback;
      }
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return fallback;
    }
  };

  // Función para cargar datos desde AsyncStorage (cache)
  const loadFromCache = async () => {
    try {
      const [tasksCache, classesCache, lastUpdateCache] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.CLASSES),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE),
      ]);

      let hasCache = false;

      if (tasksCache && tasksCache !== 'undefined') {
        const parsed = safeJsonParse(tasksCache, { list: [], metadata: {} });
        if (parsed && parsed.list && parsed.metadata) {
          setTasksMetadata(parsed.metadata);
          setTaskStatus(parsed.list);
          if (parsed.valueMetadata) {
            setTasksValueMetadata(parsed.valueMetadata);
          }
          hasCache = true;
        }
      }

      if (classesCache && classesCache !== 'undefined') {
        const parsed = safeJsonParse(classesCache, { list: [], metadata: {} });
        if (parsed && parsed.list && parsed.metadata) {
          setClassesMetadata(parsed.metadata);
          setClassList(parsed.list);
          hasCache = true;
        }
      }

      if (lastUpdateCache && lastUpdateCache !== 'undefined') {
        const parsed = safeJsonParse(lastUpdateCache);
        if (parsed) {
          setLastUpdate(parsed);
        }
      }

      //console.log(hasCache ? 'Cache cargado' : 'No hay cache disponible');
      return { hasCache };
    } catch (error) {
      console.error('Error loading from cache:', error);
      return { hasCache: false };
    }
  };

  // Función para calcular metadata de tareas
  const calculateTasksMetadata = (taskList) => {
    const completed = taskList.filter(
      task => task.tarea_estado === "Completado"
    ).length;
    
    const inProgress = taskList.filter(
      task => task.tarea_estado === "En Proceso" || task.tarea_estado === "Pendiente"
    ).length;
    
    const total = taskList.length;

    return { completed, inProgress, total };
  };

// Función para calcular metadata de valor de tareas con agrupaciones
const calculateTasksValueMetadata = (taskList, classList = []) => {
  if (!Array.isArray(taskList)) {
    return {
      tareas_con_valor_inicial: 0,
      tareas_calificadas: 0,
      valor_total_obtenido: '0.00',
      valor_total_posible: '0.00',
      promedio_general: '0.00',
      porcentaje_completado: '0.00',
      promedios_por_periodo: {},
      promedios_por_clase: {},
    };
  }

  // Crear un mapa de clases para búsqueda rápida
  const clasesMap = {};
  if (Array.isArray(classList)) {
    //console.log('Total de clases recibidas:', classList.length);
    
    classList.forEach((clase, index) => {
      const possibleIds = [
        clase.clase_id,
        clase.idClase,
      ];

      const className = clase.class_name || clase.className || clase.name || `Clase ${index + 1}`;

      possibleIds.forEach(id => {
        if (id !== undefined && id !== null) {
          clasesMap[id] = className;
          clasesMap[String(id)] = className;
          clasesMap[Number(id)] = className;
        }
      });

      //console.log(`Clase ${index}: ID=${clase.clase_id}, Nombre=${className}`);
    });
  }

  //console.log('Mapa completo de clases:', clasesMap);

  const tareas_con_valor_inicial = taskList.filter(
    task => task.tarea_valor > 0
  ).length;
  
  const tareas_calificadas = taskList.filter(
    task => task.tarea_valor_final !== undefined && 
           task.tarea_valor_final !== null && 
           task.tarea_valor_final >= 0
  ).length;
  
  const valor_total_obtenido = taskList.reduce((sum, task) => {
    const valorFinal = parseFloat(task.tarea_valor_final) || 0;
    return sum + valorFinal;
  }, 0);

  const valor_total_posible = taskList.reduce((sum, task) => {
    const valorInicial = parseFloat(task.tarea_valor) || 0;
    return sum + valorInicial;
  }, 0);

  const promedio_general = tareas_calificadas > 0
    ? valor_total_obtenido / tareas_calificadas
    : 0;

  const porcentaje_completado = valor_total_posible > 0
    ? (valor_total_obtenido / valor_total_posible) * 100
    : 0;

  // ==========================================
  // PROMEDIOS POR PERIODO
  // ==========================================
  const promedios_por_periodo = taskList.reduce((acc, task) => {
    const periodo = task.tarea_periodo || 'Sin periodo';
    const valorFinal = parseFloat(task.tarea_valor_final);
    
    if (!acc[periodo]) {
      acc[periodo] = {
        total_obtenido: 0,
        total_posible: 0,
        tareas_calificadas: 0,
        tareas_totales: 0,
      };
    }
    
    acc[periodo].tareas_totales += 1;
    acc[periodo].total_posible += parseFloat(task.tarea_valor) || 0;
    
    if (valorFinal !== undefined && valorFinal !== null && valorFinal >= 0) {
      acc[periodo].total_obtenido += valorFinal;
      acc[periodo].tareas_calificadas += 1;
    }
    
    return acc;
  }, {});

  // Calcular promedios finales por periodo
  Object.keys(promedios_por_periodo).forEach(periodo => {
    const data = promedios_por_periodo[periodo];
    data.promedio = data.tareas_calificadas > 0
      ? (data.total_obtenido / data.tareas_calificadas).toFixed(2)
      : '0.00';
    data.porcentaje = data.total_posible > 0
      ? ((data.total_obtenido / data.total_posible) * 100).toFixed(2)
      : '0.00';
  });

  // ==========================================
  // PROMEDIOS POR CLASE
  // ==========================================
  const promedios_por_clase = taskList.reduce((acc, task) => {
    const claseId = task.tarea_id_clase || 'Sin clase';
    const valorFinal = parseFloat(task.tarea_valor_final);

    if (!acc[claseId]) {
      let nombreEncontrado = clasesMap[claseId] || 
                             clasesMap[String(claseId)] || 
                             clasesMap[Number(claseId)];

      if (!nombreEncontrado && Array.isArray(classList)) {
        const claseEncontrada = classList.find(c => 
          c.id === claseId || 
          c.id === String(claseId) || 
          c.id === Number(claseId) ||
          c.class_id === claseId ||
          c.idClase === claseId
        );
        nombreEncontrado = claseEncontrada?.class_name || claseEncontrada?.className;
      }

      acc[claseId] = {
        clase_id: claseId,
        clase_nombre: nombreEncontrado || `Clase ID: ${claseId}`,
        total_obtenido: 0,
        total_posible: 0,
        tareas_calificadas: 0,
        tareas_totales: 0,
      };

    // console.log(`Procesando clase ${claseId}: Nombre = ${acc[claseId].clase_nombre}`);
    }
    
    acc[claseId].tareas_totales += 1;
    acc[claseId].total_posible += parseFloat(task.tarea_valor) || 0;
    
    if (valorFinal !== undefined && valorFinal !== null && valorFinal >= 0) {
      acc[claseId].total_obtenido += valorFinal;
      acc[claseId].tareas_calificadas += 1;
    }
    
    return acc;
  }, {});

  // Calcular promedios finales por clase
  Object.keys(promedios_por_clase).forEach(claseId => {
    const data = promedios_por_clase[claseId];
    data.promedio = data.tareas_calificadas > 0
      ? (data.total_obtenido / data.tareas_calificadas).toFixed(2)
      : '0.00';
    data.porcentaje = data.total_posible > 0
      ? ((data.total_obtenido / data.total_posible) * 100).toFixed(2)
      : '0.00';
  });


  return { 
    tareas_con_valor_inicial,
    tareas_calificadas,
    valor_total_obtenido: valor_total_obtenido.toFixed(2),
    valor_total_posible: valor_total_posible.toFixed(2),
    promedio_general: promedio_general.toFixed(2),
    porcentaje_completado: porcentaje_completado.toFixed(2),
    promedios_por_periodo,
    promedios_por_clase,
  };
};

  // Función para calcular metadata de clases
  const calculateClassesMetadata = (classList) => {
    const enrolled = classList.filter(
      clase => clase.class_enrollment === "En Curso" || clase.class_enrollment === "Matriculada"
    ).length;
    
    const finished = classList.filter(
      clase => clase.class_enrollment === "Cursada"
    ).length;
    
    const total = classList.length;
    const remaining = 58 - total;

    return { enrolled, finished, total, remaining };
  };

  // Función para guardar en AsyncStorage
  const saveToCache = async (tasksData, classesData) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Validar que los datos no sean undefined o null
    const validTasksData = tasksData || { list: [], metadata: {} };
    const validClassesData = classesData || { list: [], metadata: {} };
    
    await Promise.all([
      AsyncStorage.setItem(
        STORAGE_KEYS.TASKS, 
        JSON.stringify(validTasksData)
      ),
      AsyncStorage.setItem(
        STORAGE_KEYS.CLASSES, 
        JSON.stringify(validClassesData)
      ),
      AsyncStorage.setItem(
        STORAGE_KEYS.LAST_UPDATE, 
        JSON.stringify(timestamp)
      ),
    ]);

    setLastUpdate(timestamp);
    console.log('Datos guardados en cache exitosamente');
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

  // Función para obtener datos frescos de Firebase
  const fetchFreshData = async () => {
  try {
    //console.log('Fetching fresh data...');
    
    // Fetch tasks
    const taskList = await getDocumentCollection("idTareasCollection");
    
    if (!taskList || !Array.isArray(taskList)) {
      console.warn('taskList is invalid:', taskList);
      return false;
    }

    // Fetch classes PRIMERO (para tener los nombres disponibles)
    const classList = await getDocumentCollection("idClaseCollection");
    
    if (!classList || !Array.isArray(classList)) {
      console.warn('classList is invalid:', classList);
      return false;
    }

    const classesMetadataCalculated = calculateClassesMetadata(classList);
    
    // Calcular metadata de tareas (PASANDO classList)
    const tasksMetadataCalculated = calculateTasksMetadata(taskList);
    const tasksValueMetadataCalculated = calculateTasksValueMetadata(taskList, classList);
    
    // Actualizar estados
    setTaskStatus(taskList);
    setTasksMetadata(tasksMetadataCalculated);
    setTasksValueMetadata(tasksValueMetadataCalculated);
    
    setClassList(classList);
    setClassesMetadata(classesMetadataCalculated);

    // Preparar datos para guardar
    const tasksDataToSave = {
      list: taskList,
      metadata: tasksMetadataCalculated,
      valueMetadata: tasksValueMetadataCalculated,
    };

    const classesDataToSave = {
      list: classList,
      metadata: classesMetadataCalculated,
    };

    // Guardar en cache
    await saveToCache(tasksDataToSave, classesDataToSave);

    //console.log('Datos actualizados exitosamente');
    return true;
  } catch (error) {
    console.error('Error fetching fresh data:', error);
    return false;
  }
};

  // Función para refrescar datos (manual)
  const refreshData = async () => {
    setLoading(true);
    await fetchFreshData();
    setLoading(false);
  };

  // Cargar datos al iniciar
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      const { hasCache } = await loadFromCache();
      await fetchFreshData();

      setLoading(false);
    };

    initializeData();
  }, []);

  // Función para obtener datos del gráfico de tareas
  const getTasksPieData = () => [
    {
      name: "In Process",
      population: tasksMetadata.inProgress,
      color: colors.color_palette_2.pink_darker,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Completed",
      population: tasksMetadata.completed,
      color: colors.color_palette_2.lineArt_Blue,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  // Función para obtener datos del gráfico de clases
  const getClassesPieData = () => [
    {
      name: "Finished",
      population: classesMetadata.finished,
      color: colors.color_palette_2.pink_darker,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Enroll",
      population: classesMetadata.enrolled,
      color: colors.color_palette_2.lineArt_Blue,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  // Función para limpiar cache (útil para debugging)
  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TASKS),
        AsyncStorage.removeItem(STORAGE_KEYS.CLASSES),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_UPDATE),
      ]);
      setLastUpdate(null);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const value = {
    // Tasks data
    taskStatus,
    tasksMetadata,
    tasksCompleted: tasksMetadata.completed,
    tasksInProgress: tasksMetadata.inProgress,
    totalTasks: tasksMetadata.total,

    // Tasks Value Data
    tasksValueMetadata,
    promedioGeneral: tasksValueMetadata.promedio_general,
    promediosPorPeriodo: tasksValueMetadata.promedios_por_periodo,
    promediosPorClase: tasksValueMetadata.promedios_por_clase,
    valorObtenido: tasksValueMetadata.valor_total_obtenido,
    

    // Classes data
    clasee,
    classesMetadata,
    enrolledClase: classesMetadata.enrolled,
    finishedClase: classesMetadata.finished,
    totalClasses: classesMetadata.remaining,

    // Pie chart data
    getTasksPieData,
    getClassesPieData,

    // Metadata
    loading,
    lastUpdate,

    // Actions
    refreshData,
    clearCache,
  };

  return (
    <OverviewDataContext.Provider value={value}>
      {children}
    </OverviewDataContext.Provider>
  );
};