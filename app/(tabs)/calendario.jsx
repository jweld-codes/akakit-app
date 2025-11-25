// app/(tabs)/calendar.jsx
import { Link } from "expo-router";
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalendarView from '../../components/Calendar/CalendarView';
import EventDayModal from '../../components/Calendar/EventDayModal';
import UpcomingEventsList from '../../components/Calendar/UpcoomingEventsList';
import SearchBar from '../../components/SearchBar';

import { Ionicons } from '@expo/vector-icons';
import global from "../../constants/global";


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

            {/* SearchBar */}
            <View style={styles.searchContainer}>
               <View srtyle={global.aside}>
                  
                  <Link href="/QADir/Eventos/ArchivedEventsScreen" asChild>
                    <TouchableOpacity style={styles.menuItem}>
                      <Ionicons name="archive-outline" size={22} color="#77065fff" />
                    </TouchableOpacity>
                  </Link>

                  <SearchBar 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar eventos..."
                    style={styles.searchBarContainer}
                    inputStyle={styles.searchBarInput}
                  />
               </View>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Calendario */}
            <View style={styles.calendarContainer}>
              <CalendarView onDayPress={handleDayPress} />
            </View>

            {/* Lista de próximos eventos */}
            <View style={styles.eventsListContainer}>
              <UpcomingEventsList searchQuery={searchQuery} />
            </View>

            {/* Espacio adicional para el FAB */}
            <View style={{ height: 100 }} />
          </ScrollView>

            {/* Modal de eventos del día */}
            <EventDayModal
              visible={showDayModal}
              selectedDate={selectedDate}
              onClose={handleCloseDayModal}
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
  menuItem: {
    top: 10,
    right: 10
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

  //SeacrhBar
  searchBarContainer: {
    backgroundColor: 'rgba(231, 231, 231, 0.95)',
    marginTop: -25,
    marginBottom: 5,
    left: 30,
    width: 300
  },
  searchBarInput: {
    fontFamily: 'poppins-regular',
  },
});