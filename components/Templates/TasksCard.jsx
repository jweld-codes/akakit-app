// components/Templates/TasksCard.jsx
import colors from "@/constants/colors";
import global from "@/constants/global";
import { Ionicons } from "@expo/vector-icons";
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TaskDetailModal from '../../modals/TaskDetailModal';
import { getDaysUntilDeadline, getUrgencyColor } from "../../services/GetPendingTasks";
import UpdateTask from '../Tasks/CRUD/UpdateTask';

export default function TasksCard({ task, onRemove }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  
  // Editar tarea
  const handleEdit = (task) => {
  setTaskToEdit(task);
  setShowUpdateModal(true);
  };

const handleDelete = async (task) => {
    Alert.alert(
      'Eliminar Tarea',
      `¿Estás seguro de eliminar "${task.tarea_titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const taskDocId = task.docId || task.id;
              
              if (!taskDocId) {
                console.error('No se encontró ID del documento');
                Alert.alert('Error', 'No se pudo identificar la tarea');
                return;
              }

              console.log('Eliminando tarea:', taskDocId);

              // Eliminar de Firebase
              const taskRef = doc(db, 'idTareasCollection', taskDocId);
              await deleteDoc(taskRef);

              console.log('Tarea eliminada de Firebase');

              if (onRemove) {
                onRemove(taskDocId);
              }

              if (showTaskModal && selectedTask?.id === taskDocId) {
                setShowTaskModal(false);
                setSelectedTask(null);
              }

              Alert.alert('✅', 'Tarea eliminada correctamente');
            } catch (error) {
              console.error('❌ Error al eliminar:', error);
              Alert.alert('Error', `No se pudo eliminar la tarea: ${error.message}`);
            }
          }
        }
      ]
    );
  };


  const timestamp = task.tarea_fecha_entrega_date || 
    (task.tarea_fecha_entrega?.seconds 
      ? new Date(task.tarea_fecha_entrega.seconds * 1000)
      : null);

  const fechaEntrega = timestamp
    ? timestamp.toLocaleDateString('es-ES', { 
        weekday: 'long',
        month: 'long',    
        day: 'numeric'
      })
    : "Sin fecha";

  const horaEntrega = timestamp
    ? timestamp.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    : "Sin hora";

  const getColorsByClassType = (type) => {
    switch (type?.toLowerCase()) {
      case "general":
      case "general y complementaria":
        return {
          header: colors.color_palette_4.general_orange,
          background: "#f7ebdbff",
          color: colors.color_palette_1.yellow_darker
        };
      case "datos":
      case "ciencias de datos":
        return {
          header: colors.color_palette_4.datos_blue,
          background: "#e6f8ffff",
          color: colors.color_palette_2.lineArt_Blue
        };
      case "exactas":
      case "matemáticas":
        return {
          header: colors.color_palette_4.exactas_pink,
          background: "#fbeee7ff",
          color: colors.color_palette_2.lineArt_Blue
        };
      case "negocios":
        return {
          header: colors.color_palette_4.negocio_green,
          background: "#e6fadeff",
          color: colors.color_palette_1.green_darker
        };
      case "programación":
        return {
          header: colors.color_palette_4.code_yellow,
          background: "#fffbe6ff",
          color: colors.color_palette_1.orange_darker
        };
      default:
        return {
          header: "#a95656ff",
          background: "#f5f5f5",
          color: "#000"
        };
    }
  };

  const { header, background, color } = getColorsByClassType(task.class_type);
  const daysUntil = getDaysUntilDeadline(timestamp);
  const urgencyColor = getUrgencyColor(timestamp);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: background }]}
      activeOpacity={0.8}
    >
      {/* Header con color */}
      <View style={[styles.cardHeader, { backgroundColor: header }]} />

      {/* Badge de urgencia */}
      <View style={[styles.badge, { backgroundColor: urgencyColor }]}>
        <Text style={styles.badgeText}>{daysUntil}</Text>
      </View>

      {/* Placeholder de imagen con ícono */}
      <View style={[styles.imageContainer, { backgroundColor: header }]}>
        <Ionicons 
          name="document-text-outline" 
          size={50} 
          color={background} 
        />
      </View>

      {/* Contenido */}
      <View style={styles.cardContent}>
        {/* Tipo de tarea o estado */}
        <View style={[styles.typeContainer, { backgroundColor: header }]}>
          <Text style={[styles.typeText, { color: color }]}>
            {task.tarea_estado || "En Proceso"}
          </Text>
        </View>

        {/* Título */}
        <Text style={styles.title} numberOfLines={4}>
          {task.tarea_titulo}
        </Text>

        {/* Descripción */}
        <Text style={styles.description} numberOfLines={4}>
          {task.tarea_descripcion || "Sin descripción"}
        </Text>

        {/* Fecha y hora */}
        <View style={styles.dateContainer}>
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color="#666" 
          />
          <Text style={styles.dateText}>{fechaEntrega}</Text>
        </View>

        <View style={styles.timeContainer}>
          <Ionicons 
            name="time-outline" 
            size={16} 
            color="#666" 
          />
          <Text style={styles.timeText}>{horaEntrega}</Text>
        </View>

        {/* Botón de acción */}
        <View>
          <TouchableOpacity onPress={() => handleTaskPress(task)} style={[styles.actionButton, { backgroundColor: header }]}>
          
          <Text style={[styles.actionButtonText, { color: color }]}>
            Ver Tarea
          </Text>
          </TouchableOpacity>
          <TaskDetailModal
            visible={showTaskModal}
            task={selectedTask}
            onClose={() => {
              setShowTaskModal(false);
              setSelectedTask(null);
            }}
            onEdit={handleEdit}
            />
          <UpdateTask
            visible={showUpdateModal}
            task={taskToEdit}
            onClose={() => {
                setShowUpdateModal(false);
                setTaskToEdit(null);
            }}
            onUpdated={() => {
                setShowUpdateModal(false);
                setTaskToEdit(null);
            }}
          />

        </View>
        
        {/* Footer con info de clase */}
        <View style={[global.aside ,styles.footer]}>
          <Text style={styles.footerText} numberOfLines={3}>
            {task.class_name}
          </Text>
          <Text style={styles.footerText}>
            Sección {task.class_section}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 6,
  },
  badge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 15,
  },
  typeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 22,
    lineHeight: 18,
    height:70
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,

  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
});