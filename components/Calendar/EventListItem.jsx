import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { db } from '../../config/firebaseConfig';
import { formatEventTime } from '../../services/GetEventsByDate';
import { getDaysUntilEvent, getUrgencyColor } from '../../services/GetUpcomingEvents';

export default function EventListItem({ evento, onRemove }) {
  const router = useRouter();


  const handlePress = () => router.push(`/`);

  const eventDate = evento.evento_fecha_date || evento.evento_fecha?.toDate();
  const daysUntil = getDaysUntilEvent(eventDate);
  const urgencyColor = getUrgencyColor(eventDate);


    const handleArchive = async () => {
    try {
      const ref = doc(db, 'idEventosCollection', evento.id);
      await updateDoc(ref, { estado: 'Archivado' });
      console.log('Evento archivado');
      
      if (onRemove) onRemove(evento.id);
    } catch (error) {
      console.error('Error al archivar:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const ref = doc(db, 'idEventosCollection', evento.id);
      await deleteDoc(ref);
      console.log('Evento eliminado');

      if (onRemove) onRemove(evento.id);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const renderRightActions = (progress, dragX) => {
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

  const getTypeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'webinar': return '#3498db';
      case 'taller': return '#9b59b6';
      case 'salida': return '#e67e22';
      case 'conferencia': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  
  return (
    <Swipeable 
    renderRightActions={renderRightActions}
    >
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.colorBar, { backgroundColor: getTypeColor(evento.evento_tipo) }]} />

        <View style={styles.dateContainer}>
          <Text style={styles.dayText}>
            {eventDate ? new Date(eventDate).getDate() : '-'}
          </Text>
          <Text style={styles.monthText}>
            {eventDate ? new Date(eventDate).toLocaleDateString('es-HN', { month: 'short' }) : '-'}
          </Text>
          <Text style={styles.timeText}>
            {formatEventTime(eventDate)}
          </Text>
        </View>

        <View style={styles.content}>
          {evento.evento_tipo && evento.evento_tipo !== "N/A" && (
            <Text style={[styles.typeText, { color: getTypeColor(evento.evento_tipo) }]}>
              {evento.evento_tipo}
            </Text>
          )}

          <Text style={styles.title} numberOfLines={2}>
            {evento.evento_titulo}
          </Text>

          <View style={styles.detailsRow}>
            <Ionicons
              name={evento.evento_lugar === "Virtual" ? "videocam-outline" : "location-outline"}
              size={14}
              color="#999"
            />
            <Text style={styles.detailText}>{evento.evento_lugar || "Sin modalidad"}</Text>
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: urgencyColor }]}>
          <Text style={styles.badgeText}>{daysUntil}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
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
    position: 'relative',
  },
  colorBar: { width: 4 },
  dateContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  dayText: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  monthText: { fontSize: 12, color: '#666', textTransform: 'uppercase', marginTop: 2 },
  timeText: { fontSize: 11, color: '#999', marginTop: 4 },
  content: { flex: 1, padding: 12, justifyContent: 'center' },
  typeText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 6 },
  detailsRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 12, color: '#999', marginLeft: 4 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  actionsContainer: { flexDirection: 'row',bottom: 5, width: 140, justifyContent: 'flex-end', alignItems: 'center' },
  actionButton: { width: 70, height: '80%', justifyContent: 'center', alignItems: 'center' },
});