// app/(tabs)/calendar.jsx
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalendarView from '../../components/Calendar/CalendarView';
import EventDayModal from '../../components/Calendar/EventDayModal';
import UpcomingEventsList from '../../components/Calendar/UpcoomingEventsList';
import FloatingActionButton from '../../components/FloatingActionButton';
import SearchBar from '../../components/SearchBar';
import AddItemBottomSheet from '../../modals/AddItemBottomSheet';

export default function CalendarScreen() {
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

   
  const handleDayPress = useCallback((date, day) => {
    setSelectedDate(date);
    setShowDayModal(true);
  }, []);

  const handleCloseDayModal = useCallback(() => {
    setShowDayModal(false);
  }, []);

  const handleOpenBottomSheet = useCallback(() => {
    setShowBottomSheet(true);
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setShowBottomSheet(false);
  }, []);
 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View>
          
        </View>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calendario</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('es-HN', {
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Calendario */}
            <View style={styles.calendarContainer}>
              <CalendarView onDayPress={handleDayPress} />
            </View>

            {/* SearchBar */}
            <View style={styles.searchContainer}>
              <SearchBar 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar eventos..."
              />
            </View>

            {/* Lista de próximos eventos */}
            <View style={styles.eventsListContainer}>
              <UpcomingEventsList searchQuery={searchQuery} />
            </View>

            {/* Espacio adicional para el FAB */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Floating Action Button */}
          <FloatingActionButton onPress={handleOpenBottomSheet} />

          {/* Modal de eventos del día */}
          <EventDayModal
            visible={showDayModal}
            selectedDate={selectedDate}
            onClose={handleCloseDayModal}
          />

          {/* Bottom Sheet para agregar evento/tarea */}
          <AddItemBottomSheet
            isVisible={showBottomSheet}
            onClose={handleCloseBottomSheet}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'poppins-bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  eventsListContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
});