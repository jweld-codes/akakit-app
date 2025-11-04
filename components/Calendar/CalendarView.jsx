// components/Calendar/CalendarView.jsx
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import colors from '../../constants/colors';
import { getMarkedDates } from '../../services/GetMarkedDates';

// Configurar el idioma español
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ],
  dayNames: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarView({ onDayPress }) {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    loadMarkedDates();
  }, []);

  const loadMarkedDates = async () => {
    const dates = await getMarkedDates();
    setMarkedDates(dates);
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    // Combinar fechas marcadas con la selección actual
    const updatedMarkedDates = {
      ...markedDates,
      [dateString]: {
        ...markedDates[dateString],
        selected: true,
        selectedColor: colors.color_palette_4.babyBlue,
      }
    };

    // Limpiar selección anterior
    Object.keys(updatedMarkedDates).forEach(key => {
      if (key !== dateString) {
        delete updatedMarkedDates[key].selected;
        delete updatedMarkedDates[key].selectedColor;
      }
    });

    setMarkedDates(updatedMarkedDates);
    
    // Notificar al componente padre
    if (onDayPress) {
      const date = new Date(day.year, day.month - 1, day.day);
      onDayPress(date, day);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={new Date().toISOString().split('T')[0]}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: colors.color_palette_4.babyBlue,
          selectedDayTextColor: '#190237ff',
          todayBackgroundColor: colors.color_palette_1.lineArt_Purple,
          todayTextColor: '#fff',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#ffffff',
          selectedDotColor: '#ffffff',
          arrowColor: colors.color_palette_1.lineArt_Purple,
          monthTextColor: '#2d4150',
          textDayFontFamily: 'poppins-regular',
          textMonthFontFamily: 'poppins-semibold',
          textDayHeaderFontFamily: 'poppins-regular',
          textDayFontSize: 14,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12
        }}
        style={styles.calendar}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 12,
  },
});