// components/Modals/TaskDetailModal.jsx
import { Ionicons } from '@expo/vector-icons';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { formatDeadline, getTaskStatusColor } from '../services/GetTareaByClassId';

export default function TaskDetailModal({ visible, task, onClose, onEdit, onDelete }) {
  if (!task) return null;

  const statusColor = getTaskStatusColor(task.tarea_estado);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: statusColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Tarea</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Estado Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{task.tarea_estado}</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>{task.tarea_titulo}</Text>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
              {task.tarea_descripcion || 'Sin descripción'}
            </Text>
          </View>

          {/* Información */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información</Text>
            
            <InfoRow 
              icon="calendar-outline" 
              label="Fecha de apertura"
              value={formatDeadline(task.tarea_fecha_apertura_date)}
            />
            <InfoRow 
              icon="alarm-outline" 
              label="Fecha de entrega"
              value={formatDeadline(task.tarea_fecha_entrega_date)}
              highlight
            />
            <InfoRow 
              icon="layers-outline" 
              label="Parcial"
              value={`Parcial ${task.tarea_parcial}`}
            />
            <InfoRow 
              icon="calendar-number-outline" 
              label="Semana"
              value={`Semana ${task.tarea_semana}`}
            />
            <InfoRow 
              icon="time-outline" 
              label="Periodo"
              value={`Periodo ${task.tarea_periodo}`}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archivo</Text>
            
            <View style={styles.gradeContainer}>
              <View style={styles.gradeBox}>
                <InfoRow 
                icon="document-outline" 
                label="Tarea Enviada"
                value={`${task.tarea_doc_titulo || 'Sin Enviar'}`}
              />
                <TouchableOpacity style={{marginTop: 15, alignItems: 'flex-start'}} onPress={() => Linking.openURL(task.tarea_doc_url)}>
                  <Text style={styles.gradeLabel}>
                    Ir a Drive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calificación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calificación</Text>
            
            <View style={styles.gradeContainer}>
              <View style={styles.gradeBox}>
                <Text style={styles.gradeLabel}>Valor</Text>
                <Text style={styles.gradeValue}>{task.tarea_valor}%</Text>
              </View>
              
              {task.tarea_valor_final && (
                <View style={styles.gradeBox}>
                  <Text style={styles.gradeLabel}>Obtenido</Text>
                  <Text style={[styles.gradeValue, { color: '#27ae60' }]}>
                    {task.tarea_valor_final}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentarios de retroalimentación</Text>
            <Text style={styles.description}>
              {task.tarea_comentario || 'Sin descripción'}
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer con acciones */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              onClose();
              onEdit(task);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              onClose();
              onDelete(task);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const InfoRow = ({ icon, label, value, highlight }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color={highlight ? '#e74c3c' : '#666'} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: '#e74c3c', fontWeight: 'bold' }]}>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gradeBox: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  gradeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  gradeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});