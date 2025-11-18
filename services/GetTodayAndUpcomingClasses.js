import { getClassDocumentCollection } from "./GetClassDocumentCollection";

const daysMap = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

const parseTimeStringToDate = (timeString) => {
  if (!timeString) return null;

  const clean = timeString.trim().toLowerCase().replace(/\./g, "");

  const parts = clean.split(/\s+/);

  if (parts.length === 1) {
    const [hours, minutes] = parts[0].split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const [time, modifier] = parts;

  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "pm" && hours !== 12) hours += 12;
  if (modifier === "am" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
};

export const getClassesData = async () => {
  try {
    const classes = await getClassDocumentCollection("idClaseCollection");

    const today = daysMap[new Date().getDay()];
    const now = new Date();

    //console.log("Hoy es:", today);
    //console.log("Total de clases en DB:", classes.length);


    // Filtrar solo clases de hoy
     const todayClasses = classes.filter((cls) =>
      cls.class_days?.includes(today)
    );

    /* Para formato con comas (string)
    const todayClasses = classes.filter((cls) => {
      if (!cls.class_days) return false;
      
      // Dividir por comas y limpiar espacios
      const days = cls.class_days.split(',').map(d => d.trim());
      return days.includes(today);
    }); */

    //console.log("Clases de hoy encontradas:", todayClasses.length);
    /*console.log("Clases de hoy:", todayClasses.map(c => ({
      nombre: c.class_name,
      dias: c.class_days,
      horas: c.class_hours
    })));*/

    // Ver todas las clases y sus días configurados
   /* console.log("Todos los días configurados:", 
      classes.map(c => ({ nombre: c.class_name, dias: c.class_days }))
    );*/

    // Si no hay clases hoy, mostrar advertencia
    if (todayClasses.length === 0) {
      //console.warn(`No hay clases programadas para ${today}`);
      return {
        todayClasses: [],
        ongoingClass: null,
        upcomingClass: null,
      };
    }

    // Ordenar las clases por hora de inicio
const sortedTodayClasses = todayClasses.sort((a, b) => {
  const [aStart] = a.class_hours.split("-");
  const [bStart] = b.class_hours.split("-");
  return parseTimeStringToDate(aStart.trim()) - parseTimeStringToDate(bStart.trim());
});

// Detectar si hay una clase en curso ahora
const ongoingClass = sortedTodayClasses.find((cls) => {
  if (!cls.class_hours) return false;

  const [startTimeStr, endTimeStr] = cls.class_hours.split("-");
  const startTime = parseTimeStringToDate(startTimeStr.trim());
  const endTime = parseTimeStringToDate(endTimeStr.trim());

  return now >= startTime && now <= endTime;
});

// Buscar la siguiente clase basada en la hora actual (después de ordenar)
const upcomingClass = sortedTodayClasses.find((cls) => {
  if (!cls.class_hours) return false;

  const [startTimeStr] = cls.class_hours.split("-");
  const startTime = parseTimeStringToDate(startTimeStr.trim());

  return now < startTime; // solo futuras
});

    //console.log("Ahora:", now);
    //console.log("En curso:", ongoingClass);
    //console.log("Próxima clase:", upcomingClass);

    return {
      todayClasses,
      ongoingClass,
      upcomingClass,
    };
  } catch (error) {
    console.error("Error al obtener las clases:", error);
    return {
      todayClasses: [],
      ongoingClass: null,
      upcomingClass: null,
    };
  }
};

