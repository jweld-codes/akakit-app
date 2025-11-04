// components/Calendar/UpcomingEventsList.jsx
import { Ionicons } from '@expo/vector-icons';
import { Link } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../constants/colors';
import { getUpcomingEvents } from '../../services/GetUpcomingEvents';
import EventListItem from './EventListItem';

export default function UpcomingEventsList({ searchQuery = '' }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const eventsData = await getUpcomingEvents(20);
    setEvents(eventsData);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // Filtrar eventos según búsqueda
  const filteredEvents = events.filter(evento => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      evento.evento_titulo?.toLowerCase().includes(query) ||
      evento.evento_descripcion?.toLowerCase().includes(query) ||
      evento.evento_tipo?.toLowerCase().includes(query) ||
      evento.evento_lugar?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.loadingText}>Cargando eventos...</Text>
      </View>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery ? 'No se encontraron eventos' : 'No hay eventos próximos'}
        </Text>
        <Text style={styles.emptySubtext}>
          {searchQuery ? 'Intenta con otra búsqueda' : 'Los próximos eventos aparecerán aquí'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.color_palette_1.lineArt_Purple}
        />
      }
    >
      <View>
        <Link href="/(extras)/settings" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="archive-outline" size={22} color="#77065fff" />
            </TouchableOpacity>
          </Link>
        
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Próximos Eventos</Text>
        <Text style={styles.headerCount}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
        </Text>
      </View>

      {filteredEvents.map((evento) => (
        <EventListItem key={evento.id} evento={evento} onRemove={(id) => setEvents(prev => prev.filter(e => e.id !== id))} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerCount: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});