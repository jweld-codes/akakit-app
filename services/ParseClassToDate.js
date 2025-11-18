// Convierte "Lunes y Jueves" → ["Lunes", "Jueves"]
export const getNextClassDate = (daysString, hoursString) => {
  if (!daysString || !hoursString) return null;

  const daysMap = {
    "Domingo": 0, "Lunes": 1, "Martes": 2,
    "Miércoles": 3, "Jueves": 4,
    "Viernes": 5, "Sábado": 6,
  };

  const days = daysString
    .split(/,|y/)
    .map(d => d.trim())
    .filter(Boolean);

  // Día actual
  const now = new Date();
  let todayIdx = now.getDay();

  // Buscar el próximo día válido
  let selectedDayIdx = null;
  for (const d of days) {
    if (daysMap[d] !== undefined) {
      const idx = daysMap[d];
      if (idx === todayIdx && getTimeFromHours(hoursString) > now) {
        // Hoy pero en el futuro
        selectedDayIdx = idx;
        break;
      }
    }
  }

  if (!selectedDayIdx) {
    // Elegir el siguiente día de la semana
    const idxs = days.map(d => daysMap[d]).sort((a,b)=>a-b);
    selectedDayIdx = idxs.find(i => i > todayIdx) ?? idxs[0];
  }

  // Crear la fecha base
  const result = new Date(now);
  const diff = (selectedDayIdx - todayIdx + 7) % 7;
  result.setDate(now.getDate() + diff);

  // Asignar hora
  const startTime = getTimeFromHours(hoursString);
  result.setHours(startTime.hours);
  result.setMinutes(startTime.minutes);
  result.setSeconds(0);
  result.setMilliseconds(0);

  return result;
};

// Extrae la hora de "7:00 p.m - 9:10 a.m"
const getTimeFromHours = (hoursString) => {
  const start = hoursString.split("-")[0].trim(); // "7:00 p.m"
  const [time, modifier] = start.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toLowerCase().includes("p") && hours !== 12) hours += 12;
  if (modifier.toLowerCase().includes("a") && hours === 12) hours = 0;

  return { hours, minutes };
};
