// components/Eventos/AddEvent.jsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";
import { scheduleMultipleReminders } from '../../../services/NotificationService';

export default function AddEvent() {
  const router = useRouter();
  
  const [eventoId, setEventoId] = useState(1);
  const [eventoClaseId, setEventoClaseId] = useState(0);
  const [eventoDescripcion, setEventoDescripcion] = useState("");
  const [eventoFecha, setEventoFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [eventoImg, setEventoImg] = useState("");
  const [eventoLugar, setEventoLugar] = useState("");
  const [eventoPuntos, setEventoPuntos] = useState(0);
  const [eventoTipo, setEventoTipo] = useState("");
  const [eventoTitulo, setEventoTitulo] = useState("");
  const [eventoUrl, setEventoUrl] = useState("");
  const [eventoAssist, setEventoAssist] = useState("");
  const [clase, setClase] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "idEventosCollection"), orderBy("evento_id", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lastEvent = snapshot.docs[0].data();
        setEventoId(lastEvent.evento_id + 1);
      }

      const claseSnapshot = await getDocs(collection(db, "idClaseCollection"));
      const claseList = claseSnapshot.docs.map(doc => doc.data());
      setClase(claseList);
    };

    fetchData();
  }, []);

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

  const handleAddEvento = async () => {
    if (!eventoTitulo || !eventoFecha) {
      Alert.alert("Error", "Por favor completa el título y la fecha del evento");
      return;
    }

    try {
      const eventoTimestamp = Timestamp.fromDate(eventoFecha);

      const docRef = await addDoc(collection(db, "idEventosCollection"), {
        evento_id: eventoId,
        evento_titulo: eventoTitulo,
        evento_descripcion: eventoDescripcion || "N/A",
        evento_img_url: eventoImg || "N/A",
        evento_clase_id: eventoClaseId || "N/A",
        evento_assist: eventoAssist,
        evento_estado: "Activo",
        evento_fecha: eventoTimestamp,
        evento_lugar: eventoLugar,
        evento_puntos_copro: eventoPuntos || 0,
        evento_tipo: eventoTipo || "N/A",
        evento_url_access: eventoUrl || "N/A",
        createdAt: Timestamp.now(),
      });

      const eventoConId = {
        id: docRef.id,
        evento_titulo: eventoTitulo,
        evento_fecha_date: eventoFecha,
      };

      await scheduleMultipleReminders(eventoConId, 'event', [24 * 60, 60, 20]);

      Alert.alert("✅ Evento creado", "El evento fue guardado exitosamente con recordatorios");
      resetForm();
      router.back();
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      Alert.alert("Error", "No se pudo guardar el evento");
    }
  };

  const resetForm = () => {
    setEventoAssist("");
    setEventoClaseId("");
    setEventoDescripcion("");
    setEventoFecha(new Date());
    setEventoId(eventoId + 1);
    setEventoImg("");
    setEventoLugar("");
    setEventoPuntos(0);
    setEventoTipo("");
    setEventoTitulo("");
    setEventoUrl("");
  };

  return (
    <View style={styles.container}>
      {/* Header Fixed */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nuevo Evento</Text>
          <Text style={styles.headerSubtitle}>ID del evento: #{eventoId}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información básica */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Información Básica</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título del evento *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej: Webinar de Machine Learning" 
              value={eventoTitulo} 
              onChangeText={setEventoTitulo}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Descripción del evento..." 
              value={eventoDescripcion} 
              onChangeText={setEventoDescripcion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Fecha y Hora */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={24} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Fecha y Hora</Text>
              {(showDatePicker || showTimePicker) && (
                <TouchableOpacity 
                  onPress={() => [setShowDatePicker(false), setShowTimePicker(false)]}
                  style={styles.hideButton}
                >
                  <Text style={styles.hideButtonText}>Ocultar</Text>
                </TouchableOpacity>
              )}
            </View>

          <View style={styles.inputGroup}>
              <View style={styles.dateTimeRow}>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => [setShowDatePicker(false), setShowDatePicker(true)]}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                <View style={styles.dateTimeTextContainer}>
                  <Text style={styles.dateTimeLabel}>Fecha</Text>
                  <Text style={styles.dateTimeValue}>{formatDate(eventoFecha)}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => [setShowTimePicker(false), setShowTimePicker(true)]}
              >
                <Ionicons name="time-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                <View style={styles.dateTimeTextContainer}>
                  <Text style={styles.dateTimeLabel}>Hora</Text>
                  <Text style={styles.dateTimeValue}>{formatTime(eventoFecha)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={eventoFecha}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                  textColor="#000"
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
                  textColor="#000"
                />
              </View>
            )}
          </View>

        </View>

        {/* Detalles del evento */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Detalles del Evento</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Evento</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={eventoTipo} 
                onValueChange={setEventoTipo}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Selecciona un tipo" value="" />
                <Picker.Item label="Webinar" value="Webinar" />
                <Picker.Item label="Taller" value="Taller" />
                <Picker.Item label="Salida a Empresa" value="Salida" />
                <Picker.Item label="Conferencia" value="Conferencia" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modalidad</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={eventoLugar} 
                onValueChange={setEventoLugar}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Selecciona modalidad" value="" />
                <Picker.Item label="Virtual" value="Virtual" />
                <Picker.Item label="Presencial" value="Presencial" />
                <Picker.Item label="Híbrida" value="Hibrida" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Enlaces y recursos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Enlaces y Recursos</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de la imagen</Text>
            <TextInput 
              style={styles.input} 
              placeholder="https://ejemplo.com/imagen.jpg" 
              value={eventoImg} 
              onChangeText={setEventoImg}
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de acceso (Zoom, Meet, etc.)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="https://zoom.us/j/..." 
              value={eventoUrl} 
              onChangeText={setEventoUrl}
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Clase asociada */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Clase Asociada</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿Proviene de alguna clase?</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={eventoClaseId} 
                onValueChange={setEventoClaseId}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Sin clase asociada" value="N/A" />
                {clase.map((doc, index) => (
                  <Picker.Item 
                    key={index} 
                    label={doc.class_name} 
                    value={doc.id || doc.clase_id} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer con botones */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleAddEvento}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Guardar Evento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  hideButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      backgroundColor: '#f0f0f0',
      borderRadius: 12,
    },
    hideButtonText: {
      fontSize: 12,
      fontFamily: 'poppins-medium',
      color: colors.color_palette_1.lineArt_Purple,
    },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'poppins-bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginLeft: 10,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    fontFamily: 'poppins-regular',
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },

  // Date Time
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    gap: 12,
  },
  dateTimeTextContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#888',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#333',
  },
  pickerContainer: {
    marginTop: 15,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Picker
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

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
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
    shadowColor: colors.color_palette_1.lineArt_Purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
});