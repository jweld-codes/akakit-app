import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db } from '../config/firebaseConfig';

export default function EventEditModal({visible, event, onClose, onSave}) {

  //console.log("[EventEditModal] visible:", visible);
  //console.log("[EventEditModal] evento recibido:", event);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const [eventoAssist, setEventoAssist] = useState('No');
  const [eventoClaseId, setEventoClaseId] = useState('N/A');
  const [eventoDescripcion, setEventoDescripcion] = useState('');
  const [eventoEstado, setEventoEstado] = useState('Activo');
  const [eventoFecha, setEventoFecha] = useState(new Date());
  const [eventoImgUrl, setEventoImgUrl] = useState('');
  const [eventoLugar, setEventoLugar] = useState('');
  const [eventoPuntosCopro, setEventoPuntosCopro] = useState('0');
  const [eventoTipo, setEventoTipo] = useState('');
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [eventoUrlAccess, setEventoUrlAccess] = useState('');

  const tiposEvento = ['Webinar', 'Taller', 'Salida', 'Conferencia', 'Otro'];
  const [saving, setSaving] = useState(false);

  // carga datos del evento cuando se abre
  useEffect(() => {
    if (event) {
      setEventoAssist(event.evento_assist || 'No');
      setEventoClaseId(event.evento_clase_id || 'N/A');
      setEventoDescripcion(event.evento_descripcion || '');
      setEventoEstado(event.evento_estado || 'Activo');
      
      // Convertir Timestamp a Date
      if (event.evento_fecha) {
        const fecha = event.evento_fecha.toDate
          ? event.evento_fecha.toDate()
          : new Date(event.evento_fecha);
        setEventoFecha(fecha);
      } else {
        setEventoFecha(new Date());
      }

      setEventoImgUrl(event.evento_img_url || '');
      setEventoLugar(event.evento_lugar || '');

      setEventoPuntosCopro(
        typeof event.evento_puntos_copro === 'number'
          ? String(event.evento_puntos_copro)
          : '0'
      );

      setEventoTipo(event.evento_tipo || '');
      setEventoTitulo(event.evento_titulo || '');
      setEventoUrlAccess(event.evento_url_access || '');
    }
  }, [event]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventoFecha(selectedDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const currentDate = new Date(eventoFecha);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      setEventoFecha(currentDate);
    }
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) return 'Seleccionar fecha';
    return date.toLocaleDateString('es-HN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date || !(date instanceof Date)) return 'Seleccionar hora';
    return date.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    if (!event?.id) return;
    if (!eventoTitulo.trim()) {
      Alert.alert("Validación", "El título no puede estar vacío");
      return;
    }

    setSaving(true);

    try {
      const eventoRef = doc(db, 'idEventosCollection', event.id);
      if(eventoAssist === "Si"){
        await updateDoc(eventoRef, {
          evento_assist: eventoAssist,
          evento_clase_id: eventoClaseId,
          evento_descripcion: eventoDescripcion,
          evento_estado: "Archivado",
          evento_fecha: Timestamp.fromDate(eventoFecha),
          evento_img_url: eventoImgUrl,
          evento_lugar: eventoLugar,
          evento_puntos_copro: parseInt(eventoPuntosCopro) || 0,
          evento_tipo: eventoTipo,
          evento_titulo: eventoTitulo,
          evento_url_access: eventoUrlAccess,
        });
      }

      await updateDoc(eventoRef, {
        evento_assist: eventoAssist,
        evento_clase_id: eventoClaseId,
        evento_descripcion: eventoDescripcion,
        evento_estado: eventoEstado,
        evento_fecha: Timestamp.fromDate(eventoFecha),
        evento_img_url: eventoImgUrl,
        evento_lugar: eventoLugar,
        evento_puntos_copro: parseInt(eventoPuntosCopro) || 0,
        evento_tipo: eventoTipo,
        evento_titulo: eventoTitulo,
        evento_url_access: eventoUrlAccess,
      });

      Alert.alert('Éxito', 'Evento actualizado correctamente');
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      Alert.alert('Error', 'No se pudo actualizar el evento');
    } finally {
      setSaving(false);
    }
  };

  const toggleAsistencia = () => {
    if(eventoAssist === "No"){
      setEventoAssist(eventoAssist === 'Si' ? 'No' : 'Si');
      setEventoEstado(eventoEstado === "Archivado" ? "Activo" : "Archivado")
    } else {
      setEventoAssist(eventoAssist === 'Si' ? 'No' : 'Si');
    }
  };

  const [loadClass, setloadClass] = useState(true);
  const loadClassRefresh = async () => {
    setLoading(true);
    const eventosList = await getClassDocumentCollection("idFlujogramaClases");
    setClasses(claseList);
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="create-outline" size={24} color="#782170" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Editar Evento</Text>
                <Text style={styles.headerSubtitle}>Actualiza la información del evento</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color="#999" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* SECCIÓN: Información Básica */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#782170" />
                <Text style={styles.sectionTitle}>Información Básica</Text>
              </View>

              {/* Título */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Título <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="text-outline" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={eventoTitulo}
                    onChangeText={setEventoTitulo}
                    placeholder="Nombre del evento"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Tipo de evento */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de evento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                  {tiposEvento.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, eventoTipo === t && styles.typeChipSelected]}
                      onPress={() => setEventoTipo(t)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.typeChipText, eventoTipo === t && styles.typeChipTextSelected]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <View style={styles.textAreaContainer}>
                  <Ionicons name="document-text-outline" size={18} color="#999" style={styles.textAreaIcon} />
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={eventoDescripcion}
                    onChangeText={setEventoDescripcion}
                    placeholder="Describe el evento..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            {/* SECCIÓN: Fecha y Ubicación */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={20} color="#782170" />
                <Text style={styles.sectionTitle}>Fecha y Ubicación</Text>
              </View>

              {/* Fecha y Hora */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Fecha y Hora</Text>
                  {(showDatePicker || showTimePicker) && (
                    <TouchableOpacity 
                      onPress={() => {
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                      }}
                      style={styles.hideButton}
                    >
                      <Ionicons name="eye-off-outline" size={16} color="#782170" />
                      <Text style={styles.hideButtonText}>Ocultar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.dateTimeGrid}>
                  <TouchableOpacity
                    style={styles.dateTimeCard}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateTimeCardHeader}>
                      <Ionicons name="calendar" size={20} color="#782170" />
                      <Text style={styles.dateTimeCardLabel}>Fecha</Text>
                    </View>
                    <Text style={styles.dateTimeCardValue}>{formatDate(eventoFecha)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeCard}
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateTimeCardHeader}>
                      <Ionicons name="time" size={20} color="#782170" />
                      <Text style={styles.dateTimeCardLabel}>Hora</Text>
                    </View>
                    <Text style={styles.dateTimeCardValue}>{formatTime(eventoFecha)}</Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={eventoFecha}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onChangeDate}
                      themeVariant="light"
                    />
                  </View>
                )}

                {showTimePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={eventoFecha}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onChangeTime}
                      themeVariant="light"
                    />
                  </View>
                )}
              </View>

              {/* Lugar/Modalidad */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Modalidad</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="location-outline" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={eventoLugar}
                    onChangeText={setEventoLugar}
                    placeholder="Virtual, Presencial, Híbrido..."
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {/* SECCIÓN: Asistencia y Estado */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#782170" />
                <Text style={styles.sectionTitle}>Asistencia y Estado</Text>
              </View>

              {/* Asistencia - Checkbox */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Asistencia al evento</Text>
                <TouchableOpacity
                  style={[
                    styles.checkboxContainer,
                    eventoAssist === 'Si' && styles.checkboxContainerActive
                  ]}
                  onPress={toggleAsistencia}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkboxRow}>
                    <View style={[
                      styles.checkboxIcon,
                      eventoAssist === 'Si' && styles.checkboxIconActive
                    ]}>
                      <Ionicons 
                        name={eventoAssist === 'Si' ? 'checkmark' : 'close'} 
                        size={20} 
                        color={eventoAssist === 'Si' ? '#fff' : '#999'} 
                      />
                    </View>
                    <View style={styles.checkboxTextContainer}>
                      <Text style={[
                        styles.checkboxTitle,
                        eventoAssist === 'Si' && styles.checkboxTitleActive
                      ]}>
                        {eventoAssist === 'Si' ? 'Asistí al evento' : 'No asistí'}
                      </Text>
                      <Text style={styles.checkboxSubtitle}>
                        {eventoAssist === 'Si' 
                          ? 'Has confirmado tu asistencia' 
                          : 'Marca si asististe al evento'
                        }
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Estado */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Estado del evento</Text>
                <View style={styles.estadoContainer}>
                  <TouchableOpacity
                    style={[
                      styles.estadoButton,
                      eventoEstado === 'Activo' && styles.estadoButtonActive
                    ]}
                    onPress={() => setEventoEstado('Activo')}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color={eventoEstado === 'Activo' ? '#fff' : '#27ae60'} 
                    />
                    <Text style={[
                      styles.estadoButtonText,
                      eventoEstado === 'Activo' && styles.estadoButtonTextActive
                    ]}>
                      Activo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.estadoButton,
                      eventoEstado === 'Archivado' && styles.estadoButtonArchived
                    ]}
                    onPress={() => setEventoEstado('Archivado')}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="archive" 
                      size={20} 
                      color={eventoEstado === 'Archivado' ? '#fff' : '#f1c40f'} 
                    />
                    <Text style={[
                      styles.estadoButtonText,
                      eventoEstado === 'Archivado' && styles.estadoButtonTextArchived
                    ]}>
                      Archivado
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* SECCIÓN: Enlaces y Recursos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="link-outline" size={20} color="#782170" />
                <Text style={styles.sectionTitle}>Enlaces y Recursos</Text>
              </View>

              {/* URL de acceso */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL de acceso</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="globe-outline" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={eventoUrlAccess}
                    onChangeText={setEventoUrlAccess}
                    placeholder="https://..."
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              {/* URL de imagen */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL de imagen</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="image-outline" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={eventoImgUrl}
                    onChangeText={setEventoImgUrl}
                    placeholder="https://..."
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>
            </View>

            {/* SECCIÓN: Información Adicional */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles-outline" size={20} color="#782170" />
                <Text style={styles.sectionTitle}>Información Adicional</Text>
              </View>

              {/* Puntos COPRO */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Puntos COPRO</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="trophy-outline" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={eventoPuntosCopro}
                    onChangeText={setEventoPuntosCopro}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* ID de Clase */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ID de Clase (opcional)</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="bookmark-outline" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={eventoClaseId}
                    onChangeText={setEventoClaseId}
                    placeholder="N/A"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {/* Botones */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={20} color="#666" />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.7}
              >
                {saving ? (
                  <>
                    <Ionicons name="hourglass-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Guardando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Espacio inferior */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: 'flex-end',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  scrollContent: { 
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },

  // Secciones
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2c3e50',
  },
  textAreaContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    padding: 12,
  },
  textAreaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Tipo selector
  typeSelector: {
    flexDirection: 'row',
    marginTop: 4,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: '#782170',
    borderColor: '#782170',
  },
  typeChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  typeChipTextSelected: {
    color: '#fff',
  },

  // Date Time
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f4f8',
    borderRadius: 12,
  },
  hideButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#782170',
  },
  dateTimeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeCard: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
  },
  dateTimeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dateTimeCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#782170',
    textTransform: 'uppercase',
  },
  dateTimeCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pickerContainer: {
    marginTop: 12,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  // Checkbox
  checkboxContainer: {
    backgroundColor: '#fafafa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  checkboxContainerActive: {
    backgroundColor: '#f8f4f8',
    borderColor: '#782170',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxIconActive: {
    backgroundColor: '#782170',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  checkboxTitleActive: {
    color: '#782170',
  },
  checkboxSubtitle: {
    fontSize: 13,
    color: '#666',
  },

  // Estado
  estadoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  estadoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  estadoButtonActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  estadoButtonArchived: {
    backgroundColor: '#f1c40f',
    borderColor: '#f1c40f',
  },
  estadoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  estadoButtonTextActive: {
    color: '#fff',
  },
  estadoButtonTextArchived: {
    color: '#fff',
  },

  // Botones principales
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#782170',
    shadowColor: '#782170',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});