// components/Periods/AddPeriodModal.jsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from '../constants/colors';
import { addPeriod } from '../services/AddPeriod';

const AddPeriodModal = ({ visible, onClose, onPeriodAdded }) => {
  const [cursoAnio, setCursoAnio] = useState('1');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFinal, setFechaFinal] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!cursoAnio) {
      Alert.alert('Error', 'Por favor selecciona el año del curso');
      return;
    }

    if (fechaInicio >= fechaFinal) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha final');
      return;
    }

    setLoading(true);
    
    try {
      const result = await addPeriod({
        curso_anio: cursoAnio,
        fecha_inicio: fechaInicio,
        fecha_final: fechaFinal,
      });

      if (result.success) {
        Alert.alert('Período creado', `Período ${result.periodo_id} agregado correctamente`);
        
        // Reset form
        setCursoAnio('1');
        setFechaInicio(new Date());
        setFechaFinal(new Date());
        
        if (onPeriodAdded) {
          onPeriodAdded();
        }
        
        onClose();
      } else {
        Alert.alert('Error', 'No se pudo crear el período');
      }
    } catch (error) {
      console.error('Error al guardar período:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar el período');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-HN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            <Text style={styles.modalTitle}>Nuevo Período</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Año del Curso */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Año del Curso *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={cursoAnio}
                  onValueChange={setCursoAnio}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Primer Año" value="1" />
                  <Picker.Item label="Segundo Año" value="2" />
                  <Picker.Item label="Tercer Año" value="3" />
                  <Picker.Item label="Cuarto Año" value="4" />
                </Picker>
              </View>
            </View>

            {/* Fecha de Inicio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Inicio *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                <Text style={styles.dateButtonText}>{formatDate(fechaInicio)}</Text>
              </TouchableOpacity>
              
              {showStartDatePicker && (
                <DateTimePicker
                  value={fechaInicio}
                  textColor="#000"
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFechaInicio(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Fecha Final */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha Final *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                <Text style={styles.dateButtonText}>{formatDate(fechaFinal)}</Text>
              </TouchableOpacity>
              
              {showEndDatePicker && (
                <DateTimePicker
                  value={fechaFinal}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFechaFinal(selectedDate);
                    }
                  }}
                  minimumDate={fechaInicio}
                  textColor="#000"
                />
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Guardando...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#555',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
  },
  pickerItem: {
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#333',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
  },

  dateButtonText: {
    fontSize: 15,
    fontFamily: 'poppins-medium',
    color: '#333',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#1976d2',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
});

export default AddPeriodModal;