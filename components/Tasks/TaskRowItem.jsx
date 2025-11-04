// components/Tasks/TaskRowItem.jsx
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { formatDeadline, getTaskStatusColor } from '../../services/GetTareaByClassId';

export default function TaskRowItem({ task, onPress, onEdit, onDelete }) {
  const swipeableRef = useRef(null);
  const statusColor = getTaskStatusColor(task.tarea_estado);

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.swipeActionsContainer,
          { transform: [{ translateX: trans }] }
        ]}
      >
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onEdit(task);
          }}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
          <Text style={styles.swipeActionText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(task);
          }}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.swipeActionText}>Eliminar</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity 
        style={styles.container}
        onPress={() => onPress(task)}
        activeOpacity={0.7}
      >
        {/* Barra de estado */}
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

        {/* Contenido */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {task.tarea_titulo}
            </Text>
            
            {/* Badge de calificación */}
            {task.tarea_valor_final ? (
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>
                  {task.tarea_valor_final}/{task.tarea_valor}
                </Text>
              </View>
            ) : (
              <View style={[styles.gradeBadge, styles.pendingGrade]}>
                <Text style={styles.gradeText}>{task.tarea_valor}%</Text>
              </View>
            )}
          </View>

          {/* Fecha de entrega */}
          <View style={styles.dateRow}>
            <Ionicons name="alarm-outline" size={14} color="#999" />
            <Text style={styles.dateText}>
              {formatDeadline(task.tarea_fecha_entrega_date)}
            </Text>
          </View>

          {/* Estado */}
          <View style={styles.footer}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{task.tarea_estado}</Text>
          </View>
        </View>

        {/* Icono de chevron */}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  gradeBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingGrade: {
    backgroundColor: '#3498db',
  },
  gradeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    width: 160,
  },
  swipeAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAction: {
    backgroundColor: '#3498db',
  },
  deleteAction: {
    backgroundColor: '#e74c3c',
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});