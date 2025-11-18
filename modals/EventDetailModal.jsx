import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const EventDetailModal = ({ visible, evento, onClose, onEdit, onArchive, onDelete }) => {
  if (!evento) return null;

  const eventDate = evento.evento_fecha_date || evento.evento_fecha?.toDate();
  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('es-HN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Fecha no disponible';
  
  const formattedTime = eventDate ? new Date(eventDate).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '';

  const getTypeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'webinar': return '#3498db';
      case 'taller': return '#9b59b6';
      case 'salida': return '#e67e22';
      case 'conferencia': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const handleOpenLink = () => {
    if (evento.evento_url_access) {
      Linking.openURL(evento.evento_url_access);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#2c3e50" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              {onEdit && (
                <TouchableOpacity onPress={() => { onClose(); onEdit(); }} style={styles.iconButton}>
                  <Ionicons name="create-outline" size={24} color="#782170" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Imagen del evento */}
            {evento.evento_img_url && (
              <Image 
                source={{ uri: evento.evento_img_url }} 
                style={styles.eventImage}
                resizeMode="cover"
              />
            )}

            {/* Tipo de evento */}
            {evento.evento_tipo && evento.evento_tipo !== "N/A" && (
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(evento.evento_tipo) }]}>
                <Text style={styles.typeBadgeText}>{evento.evento_tipo}</Text>
              </View>
            )}

            {/* Título */}
            <Text style={styles.modalTitle}>{evento.evento_titulo}</Text>

            {/* Información principal */}
            <View style={styles.infoSection}>
              {/* Fecha */}
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar-outline" size={24} color="#782170" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Fecha y Hora</Text>
                  <Text style={styles.infoValue}>{formattedDate}</Text>
                  {formattedTime && <Text style={styles.infoSubValue}>{formattedTime}</Text>}
                </View>
              </View>

              {/* Lugar */}
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={evento.evento_lugar === "Virtual" ? "videocam-outline" : "location-outline"} 
                    size={24} 
                    color="#782170" 
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Modalidad</Text>
                  <Text style={styles.infoValue}>{evento.evento_lugar || "No especificado"}</Text>
                </View>
              </View>

              {/* Puntos COPRO */}
              {evento.evento_puntos_copro && (
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="trophy-outline" size={24} color="#782170" />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Puntos COPRO</Text>
                    <Text style={styles.infoValue}>{evento.evento_puntos_copro} puntos</Text>
                  </View>
                </View>
              )}

              {/* Estado de asistencia */}
              {evento.evento_assist && (
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons 
                      name={evento.evento_assist === "Si" ? "checkmark-circle-outline" : "close-circle-outline"} 
                      size={24} 
                      color={evento.evento_assist === "Si" ? "#27ae60" : "#e74c3c"} 
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Asistencia</Text>
                    <Text style={styles.infoValue}>
                      {evento.evento_assist === "Si" ? "Confirmada" : "No confirmada"}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Descripción */}
            {evento.evento_descripcion && evento.evento_descripcion !== "N/A" && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.descriptionText}>{evento.evento_descripcion}</Text>
              </View>
            )}

            {/* Botón de acceso */}
            {evento.evento_url_access && (
              <TouchableOpacity style={styles.accessButton} onPress={handleOpenLink}>
                <Ionicons name="link-outline" size={20} color="#fff" />
                <Text style={styles.accessButtonText}>Acceder al evento</Text>
              </TouchableOpacity>
            )}

            {/* Acciones */}
            <View style={styles.actionsSection}>
              {onArchive && evento.evento_estado !== "Archivado" && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.archiveButton]} 
                  onPress={() => { onClose(); onArchive(); }}
                >
                  <Ionicons name="archive-outline" size={20} color="#f1c40f" />
                  <Text style={[styles.actionButtonText, { color: '#f1c40f' }]}>Archivar</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => { onClose(); onDelete(); }}
                >
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 20,
    marginBottom: 0,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  infoSubValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  accessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#782170',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  accessButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  archiveButton: {
    borderColor: '#f1c40f',
    backgroundColor: '#fffbf0',
  },
  deleteButton: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EventDetailModal;