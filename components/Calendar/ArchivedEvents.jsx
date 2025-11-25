// ==================== ArchivedEventsScreen.js ====================
import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebaseConfig';
import EventDetailModal from '../../modals/EventDetailModal';
import EventEditModal from '../../modals/EventEditModal';

export default function ArchivedEvents() {
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'idEventosCollection'),
      where('evento_estado', '==', 'Archivado')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        evento_fecha_date: doc.data().evento_fecha?.toDate()
      }));

      //console.log("Eventos recibidos desde Firebase:", events);
      
      // Ordenar por fecha descendente
      events.sort((a, b) => {
        const dateA = a.evento_fecha_date || new Date(0);
        const dateB = b.evento_fecha_date || new Date(0);
        return dateB - dateA;
      });

      setArchivedEvents(events);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRestoreEvent = async (eventId) => {
    Alert.alert(
      'Restaurar Evento',
      '¿Deseas restaurar este evento a eventos activos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            try {
              const eventRef = doc(db, 'idEventosCollection', eventId);
              await updateDoc(eventRef, { evento_estado: 'Activo' });
              Alert.alert('Éxito', 'Evento restaurado correctamente');
            } catch (error) {
              console.error('Error al restaurar:', error);
              Alert.alert('Error', 'No se pudo restaurar el evento');
            }
          }
        }
      ]
    );
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Eliminar Evento',
      '¿Estás seguro de que deseas eliminar permanentemente este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const eventRef = doc(db, 'idEventosCollection', eventId);
              await deleteDoc(eventRef);
              Alert.alert('Éxito', 'Evento eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar el evento');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (event) => {
    //console.log("Evento presionado para editar:", event);
    setSelectedEvent(event);

    setShowEditModal(true);
    //console.log("showEditModal puesto en true");
  };

  const handleEventPress = (event) => {
    //console.log("Evento presionado:", event);
    setSelectedEvent(event);

    setShowDetailModal(true);
    //console.log("showDetailModal puesto en true");
  };

  const getTypeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'webinar': return '#3498db';
      case 'taller': return '#9b59b6';
      case 'salida': return '#e67e22';
      case 'conferencia': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const renderArchivedEvent = ({ item }) => {
    const eventDate = item.evento_fecha_date;
    
    const formattedDate = eventDate
      ? eventDate.toLocaleDateString('es-HN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      : 'Sin fecha';

    return (
      <TouchableOpacity 
        style={styles.eventCard} 
        onPress={() => handleEventPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.colorBar, { backgroundColor: getTypeColor(item.evento_tipo) }]} />
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            {item.evento_tipo && item.evento_tipo !== "N/A" && (
              <Text style={[styles.typeText, { color: getTypeColor(item.evento_tipo) }]}>
                {item.evento_tipo}
              </Text>
            )}
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.evento_titulo}
          </Text>

          <View style={styles.eventFooter}>
            <View style={styles.locationContainer}>
              <Ionicons
                name={item.evento_lugar === "Virtual" ? "videocam-outline" : "location-outline"}
                size={14}
                color="#999"
              />
              <Text style={styles.locationText}>{item.evento_lugar || "Sin modalidad"}</Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.restoreButton}
                onPress={() => handleRestoreEvent(item.id)}
              >
                <Ionicons name="arrow-undo-outline" size={18} color="#27ae60" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteEvent(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#782170" />
        <Text style={styles.loadingText}>Cargando eventos archivados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="archive-outline" size={28} color="#782170" />
          <Text style={styles.headerTitle}>Eventos Archivados</Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{archivedEvents.length}</Text>
        </View>
      </View>

      {archivedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="archive-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay eventos archivados</Text>
          <Text style={styles.emptySubtitle}>
            Los eventos que archives aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={archivedEvents}
          renderItem={renderArchivedEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de detalles */}
      <EventDetailModal 
        visible={showDetailModal}
        evento={selectedEvent}
        onClose={() => setShowDetailModal(false)}
        onEdit={() => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
        onArchive={null} 
        onDelete={() => handleDeleteEvent(selectedEvent?.id)}
      />

      {/* Modal de edición */}
      <EventEditModal
        visible={showEditModal}
        event={selectedEvent}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedEvent) => {
          handleEdit(selectedEvent?.id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    marginTop: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  counterBadge: {
    backgroundColor: '#782170',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  colorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  restoreButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});