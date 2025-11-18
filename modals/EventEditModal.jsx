import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebaseConfig';

const EventEditModal = ({ visible, evento, onClose, onSave }) => {

  const [eventoAssist, setEventoAssist] = useState(evento?.evento_assist || "");
  const [eventoClaseId, setEventoClaseId] = useState(evento?.evento_clase_id || "N/A");
  const [eventoDescripcion, setEventoDescripcion] = useState(evento?.evento_descripcion || "");
  const [eventoEstado, setEventoEstado] = useState(evento?.evento_estado || "Activo");
  const [eventoFecha, setEventoFecha] = useState(evento?.evento_fecha || "");
  const [eventoImgUrl, setEventoImgUrl] = useState(evento?.evento_img_url || "");
  const [eventoLugar, seEventotLugar] = useState(evento?.evento_lugar || "");
  const [eventoPuntosCopro, setEventoPuntosCopro] = useState(evento?.evento_puntos_copro || 0);
  const [eventoTipo, setEventoTipo] = useState(evento?.evento_tipo || "");
  const [eventoTitulo, setEventoTitulo] = useState(evento?.evento_titulo || "");
  const [eventoUrlAccess, setEventoUrlAccess] = useState(evento?.evento_url_access || "");

  const [saving, setSaving] = useState(false);

  const tiposEvento = ['Webinar', 'Taller', 'Salida', 'Conferencia', 'Otro'];

  useEffect(() => {
    if (visible && evento) {
      loadClassData();
      loadFlowchartData();
    }
  }, [visible, evento]);

  useEffect(() => {
    if (evento && visible) {
      setEventoAssist(evento.evento_assist || '');
      setEventoDescripcion(evento.evento_descripcion || '');
      setEventoEstado(evento.evento_estado || 'Activo');
      setEventoImgUrl(evento.evento_img_url || 'Activo');
      setEventoPuntosCopro(evento.evento_puntos_copro || 0);
      setEventoTipo(evento.evento_tipo || '');
      setEventoTitulo(evento.evento_titulo || '');
      setEventoUrlAccess(evento.evento_url_access || '');


      // Convertir Timestamp a Date
    if (evento.evento_fecha) {
      const apertura = evento.evento_fecha.toDate
        ? evento.evento_fecha.toDate()
        : new Date(evento.evento_fecha);
      setEventoFecha(apertura);
    } else {
      setEventoFecha(new Date());
    }

      setTitulo();
      setDescripcion(evento.evento_descripcion || '');
      setLugar(evento.evento_lugar || '');
      setTipo(evento.evento_tipo || '');
      setUrlAccess(evento.evento_url_access || '');
      setPuntosCopro(
        typeof evento.evento_puntos_copro === "number"
            ? String(evento.evento_puntos_copro)
            : "0"
        );
    }
  }, [evento]);

  const handleSave = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const eventoRef = doc(db, 'idEventosCollection', evento.id);
      await updateDoc(eventoRef, {
        evento_titulo: titulo,
        evento_descripcion: descripcion,
        evento_lugar: lugar,
        evento_tipo: tipo,
        evento_url_access: urlAccess,
        evento_puntos_copro: parseInt(puntosCopro) || 0
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.editModalTitle}>Editar Evento</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.textInput}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Nombre del evento"
                placeholderTextColor="#999"
              />
            </View>

            {/* Tipo de evento */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de evento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {tiposEvento.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, tipo === t && styles.typeChipSelected]}
                    onPress={() => setTipo(t)}
                  >
                    <Text style={[styles.typeChipText, tipo === t && styles.typeChipTextSelected]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Lugar */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Modalidad</Text>
              <TextInput
                style={styles.textInput}
                value={lugar}
                onChangeText={setLugar}
                placeholder="Virtual, Presencial, etc."
                placeholderTextColor="#999"
              />
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción del evento"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* URL de acceso */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL de acceso</Text>
              <TextInput
                style={styles.textInput}
                value={urlAccess}
                onChangeText={setUrlAccess}
                placeholder="https://..."
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            {/* Puntos COPRO */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Puntos COPRO</Text>
              <TextInput
                style={styles.textInput}
                value={puntosCopro}
                onChangeText={setPuntosCopro}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Botones */}
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]} 
                onPress={onClose}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]} 
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
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
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  inputGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
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
  editButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#782170',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EventEditModal;