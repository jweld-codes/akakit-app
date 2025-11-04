// components/Calendar/EventDayModal.jsx
import { Ionicons } from '@expo/vector-icons';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { db } from '../../config/firebaseConfig';
import colors from '../../constants/colors';
import { formatEventTime, getEventsByDate } from '../../services/GetEventsByDate';

export default function EventDayModal({ visible, selectedDate, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (visible && selectedDate) {
      loadEvents();
    }
  }, [visible, selectedDate]);

  const loadEvents = async () => {
    setLoading(true);
    const eventsData = await getEventsByDate(selectedDate);
    setEvents(eventsData);
    setLoading(false);

  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-HN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleArchive = async (id) => {
  try {
    const ref = doc(db, 'idEventosCollection', id);
    await updateDoc(ref, { estado: 'Archivado' });
    console.log('Evento archivado');

    setEvents(prev => prev.filter(e => e.id !== id)); // 💥 quita el evento archivado
  } catch (error) {
    console.error('Error al archivar:', error);
  }
};

const handleDelete = async (id) => {
  try {
    const ref = doc(db, 'idEventosCollection', id);
    await deleteDoc(ref);
    console.log('Evento eliminado');

    setEvents(prev => prev.filter(e => e.id !== id)); // 💥 quita el evento eliminado
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};
  
    const renderRightActions = (progress, dragX, id) => {
      const scale = dragX.interpolate({
        inputRange: [-70, 0],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
      });
  
      return (
        <View style={styles.actionsContainer}>
  
          <Animated.View style={[styles.actionButton, { backgroundColor: '#f1c40f',transform: [{ scale }] }]}>
            <TouchableOpacity onPress={handleArchive}>
              <Ionicons name="archive-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
  
          <Animated.View style={[styles.actionButton, { backgroundColor: '#e74c3c', transform: [{ scale }] }]}>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
  
        </View>
      );
    };

  return (
    
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerDate}>
              {selectedDate ? formatDate(selectedDate) : ''}
            </Text>
            <Text style={styles.headerCount}>
              {events.length} {events.length === 1 ? 'evento' : 'eventos'}
            </Text>
          </View>
        </View>

          {loading ? (
            <Text style={styles.loadingText}>Cargando eventos...</Text>
            ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No hay eventos este día</Text>
            </View>
            ) : (
            events.map((evento) => (
                <Swipeable
                style={styles.scrollView}
                key={evento.id}
                renderRightActions={(progress, dragX) => (
                  <View style={styles.actionsContainer}>
                    <Animated.View style={[styles.actionButton, { backgroundColor: '#f1c40f', transform: [{ scale: dragX.interpolate({
                      inputRange: [-70, 0],
                      outputRange: [1, 0.5],
                      extrapolate: 'clamp',
                    }) }] }]}>
                      <TouchableOpacity onPress={() => handleArchive(evento.id)}>
                        <Ionicons name="archive-outline" size={22} color="#fff" />
                      </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={[styles.actionButton, { backgroundColor: '#e74c3c', transform: [{ scale: dragX.interpolate({
                      inputRange: [-70, 0],
                      outputRange: [1, 0.5],
                      extrapolate: 'clamp',
                    }) }] }]}>
                      <TouchableOpacity onPress={() => handleDelete(evento.id)}>
                        <Ionicons name="trash-outline" size={22} color="#fff" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                )}
              >

              <View style={styles.eventCard}>
                {/* Hora */}
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatEventTime(evento.evento_fecha_date)}
                  </Text>
                </View>

                {/* Contenido del evento */}
                <View style={styles.eventContent}>
                  {/* Tipo */}
                  {evento.evento_tipo && evento.evento_tipo !== "N/A" && (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{evento.evento_tipo}</Text>
                    </View>
                  )}

                  {/* Título */}
                  <Text style={styles.eventTitle}>{evento.evento_titulo}</Text>

                  {/* Descripción */}
                  {evento.evento_descripcion && evento.evento_descripcion !== "N/A" && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {evento.evento_descripcion}
                    </Text>
                  )}

                  {/* Modalidad y lugar */}
                  <View style={styles.detailsRow}>
                    <Ionicons 
                      name={evento.evento_lugar === "Virtual" ? "videocam" : "location"} 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.detailText}>
                      {evento.evento_lugar || "No especificado"}
                    </Text>
                  </View>

                </View>
              </View>
            </Swipeable>

            )
          ))}
        
        {/* Lista de eventos */}
        <ScrollView style={styles.scrollView}>
          
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  headerContent: {
    marginTop: 10,
  },
  headerDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  headerCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 5,
    top: 10,
    marginLeft: 5,
    marginRight: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    width: 90,
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventContent: {
    flex: 1,
    padding: 15,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066cc',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  linkText: {
    fontSize: 14,
    color: colors.color_palette_1.lineArt_Purple,
    marginLeft: 6,
    fontWeight: '600',
  },

  actionsContainer: { flexDirection: 'row', top:10, width: 120, justifyContent: 'flex-end', alignItems: 'center' },
  actionButton: { width: 70, height: '94%', justifyContent: 'center', alignItems: 'center' },
});