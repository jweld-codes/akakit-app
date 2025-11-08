// components/Home/AddTask.jsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";
import ios_utils_screen from '../../../constants/ios/ios_utils_screen';

export default function AddTask({onClose}) {
  const [tareaId, setTareaId] = useState(1);
  const [tareaClaseId, setTareaClaseId] = useState(0);

  const [tareaDescripcion, setTareaDescripcion] = useState("");
  const [tareaFechaEntrega, setTareaFechaEntrega] = useState(new Date());
  const [tareaFechaApertura, setTareaFechaApertura] = useState(new Date());
  const [showDatePickerApertura, setShowDatePickerApertura] = useState(false);
  const [showDatePickerEntrega, setShowDatePickerEntrega] = useState(false);
  const [showTimePickerApertura, setShowTimePickerApertura] = useState(false);
  const [showTimePickerEntrega, setShowTimePickerEntrega] = useState(false);

  const [tareaEstado, setTareaEstado] = useState("");
  const [tareaPeriodo, setTareaPeriodo] = useState("");
  const [tareaParcial, setTareaParcial] = useState(0);
  const [tareaSemana, setTareaSemana] = useState(0);

  const [tareaTitulo, setTareaTitulo] = useState("");
  const [tareaValor, setTareaValor] = useState(0);
  const [tareaValorFinal, setTareaValorFinal] = useState(0);

  const [clase, setClase] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "idTareasCollection"), orderBy("tarea_id", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lastTask = snapshot.docs[0].data();
        setTareaId(lastTask.tarea_id + 1);
      }

      // Obtener clases
      const claseSnapshot = await getDocs(collection(db, "idClaseCollection"));
      const claseList = claseSnapshot.docs.map(doc => doc.data());
      setClase(claseList);
    };

    fetchData();
  }, []);

  const onChangeDateApertura = (event, selectedDate) => {
    setShowDatePickerApertura(Platform.OS === 'ios');
    if (selectedDate) {
      setTareaFechaApertura(selectedDate);
    }
  };
  const onChangeDateEntrega = (event, selectedDate) => {
    setShowDatePickerEntrega(Platform.OS === 'ios');
    if (selectedDate) {
      setTareaFechaEntrega(selectedDate);
    }
  };

  const onChangeTimeApertura = (event, selectedTime) => {
    setShowTimePickerApertura(Platform.OS === 'ios');
    if (selectedTime) {
      const currentDate = new Date(tareaFechaApertura);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      setTareaFechaApertura(currentDate);
    }
  };

  const onChangeTimeEntrega = (event, selectedTime) => {
    setShowTimePickerEntrega(Platform.OS === 'ios');
    if (selectedTime) {
      const currentDate = new Date(tareaFechaEntrega);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      setTareaFechaEntrega(currentDate);
    }
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) return 'Seleccionar fecha';
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
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

  const handleAddTarea = async () => {
    if (!tareaTitulo || !tareaFechaEntrega) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios");
      return;
    }

    try {
      const tareaAperturaTimestamp = Timestamp.fromDate(tareaFechaApertura);
      const tareaEntregaTimestamp = Timestamp.fromDate(tareaFechaEntrega);

      await addDoc(collection(db, "idTareasCollection"), {
        tarea_id: tareaId,
        tarea_titulo: tareaTitulo,
        tarea_descripcion: tareaDescripcion || "N/A",
        tarea_periodo: tareaPeriodo || "N/A",
        tarea_parcial: tareaParcial || "N/A",
        tarea_semana: tareaSemana || "N/A",
        tarea_id_clase: tareaClaseId || "N/A",
        tarea_estado: tareaEstado || "En Proceso",
        tarea_fecha_entrega: tareaEntregaTimestamp,
        tarea_fecha_apertura: tareaAperturaTimestamp,
        tarea_valor: tareaValor,
        tarea_valor_final: tareaValorFinal || 0,
        createdAt: Timestamp.now(),
      });

      Alert.alert("Tarea agregada", "La tarea fue guardado correctamente");
      
      resetForm();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      Alert.alert("Error", "No se pudo guardar la tarea");
    }
  };

  const resetForm = () => {
    setTareaDescripcion("");
    setTareaEstado("");
    setTareaPeriodo("");
    setTareaParcial("");
    setTareaSemana("");
    setTareaTitulo("");
    setTareaFechaEntrega(new Date());
    setTareaFechaApertura(new Date());
    setTareaId(tareaId + 1);
    setTareaValor(0);
    setTareaValorFinal(0);
  };

  const router = useRouter();
  
  return (
    <View style={[styles.mainContainer, {zIndex: 1000}]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={ios_utils_screen.utils_tabs_black}><Text>.</Text></View>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
          onPress={() => {
            if (onClose) {
              onClose();
            } else {
              router.back(); 
            }
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Nueva Tarea</Text>
            <View style={styles.idBadge}>
              <Ionicons name="pricetag-outline" size={14} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.idText}>ID: {tareaId}</Text>
            </View>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* Título Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Información Básica</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título de la Tarea *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: Proyecto Final, Quiz 1, Tarea 3..." 
                placeholderTextColor="#999"
                value={tareaTitulo} 
                onChangeText={setTareaTitulo} 
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Describe los detalles de la tarea..."
                placeholderTextColor="#999"
                value={tareaDescripcion} 
                onChangeText={setTareaDescripcion}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Fechas Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Fechas y Horarios</Text>
            </View>
            
            {/* Fecha Apertura */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Fecha de Apertura</Text>
                {(showDatePickerApertura || showTimePickerApertura) && (
                  <TouchableOpacity 
                    onPress={() => [setShowDatePickerApertura(false), setShowTimePickerApertura(false)]}
                    style={styles.hideButton}
                  >
                    <Text style={styles.hideButtonText}>Ocultar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.dateTimeRow}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => [setShowTimePickerApertura(false), setShowDatePickerApertura(true)]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar" size={18} color={colors.color_palette_1.lineArt_Purple} />
                  <Text style={styles.dateTimeButtonText}>{formatDate(tareaFechaApertura)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => [setShowDatePickerApertura(false), setShowTimePickerApertura(true)]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time" size={18} color={colors.color_palette_1.lineArt_Purple} />
                  <Text style={styles.dateTimeButtonText}>{formatTime(tareaFechaApertura)}</Text>
                </TouchableOpacity>
              </View>

              {showDatePickerApertura && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tareaFechaApertura}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeDateApertura}
                    textColor="#000"
                  />
                </View>
              )}

              {showTimePickerApertura && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tareaFechaApertura}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeTimeApertura}
                    textColor="#000"
                  />
                </View>
              )}
            </View>

            {/* Fecha Entrega */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Fecha de Entrega *</Text>
                {(showDatePickerEntrega || showTimePickerEntrega) && (
                  <TouchableOpacity 
                    onPress={() => [setShowDatePickerEntrega(false), setShowTimePickerEntrega(false)]}
                    style={styles.hideButton}
                  >
                    <Text style={styles.hideButtonText}>Ocultar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.dateTimeRow}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => [setShowTimePickerEntrega(false), setShowDatePickerEntrega(true)]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar" size={18} color={colors.color_palette_1.lineArt_Purple} />
                  <Text style={styles.dateTimeButtonText}>{formatDate(tareaFechaEntrega)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => [setShowDatePickerEntrega(false), setShowTimePickerEntrega(true)]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time" size={18} color={colors.color_palette_1.lineArt_Purple} />
                  <Text style={styles.dateTimeButtonText}>{formatTime(tareaFechaEntrega)}</Text>
                </TouchableOpacity>
              </View>

              {showDatePickerEntrega && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tareaFechaEntrega}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeDateEntrega}
                    textColor="#000"
                  />
                </View>
              )}

              {showTimePickerEntrega && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tareaFechaEntrega}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeTimeEntrega}
                    textColor="#000"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Detalles Académicos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Detalles Académicos</Text>
            </View>
            
            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.pickerWrapperState}>
                  <Picker 
                    style={styles.picker}
                    selectedValue={tareaEstado} 
                    onValueChange={setTareaEstado}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Seleccionar" value="" />
                    <Picker.Item label="En Proceso" value="En Proceso" />
                    <Picker.Item label="Completado" value="Completado" />
                  </Picker>
                </View>
              </View>

              <View style={styles.halfColumn}>
                <Text style={styles.label}>Periodo</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej: 2024-1"
                  placeholderTextColor="#999"
                  value={tareaPeriodo} 
                  onChangeText={setTareaPeriodo}
                />
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Parcial</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="1-4"
                  placeholderTextColor="#999"
                  value={tareaParcial} 
                  onChangeText={setTareaParcial} 
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfColumn}>
                <Text style={styles.label}>Semana</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="1-16"
                  placeholderTextColor="#999"
                  value={tareaSemana} 
                  onChangeText={setTareaSemana} 
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Calificación Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Calificación</Text>
            </View>
            
            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Valor Total</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej: 10"
                  placeholderTextColor="#999"
                  value={tareaValor} 
                  onChangeText={setTareaValor} 
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfColumn}>
                <Text style={styles.label}>Valor Obtenido</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej: 8.5"
                  placeholderTextColor="#999"
                  value={tareaValorFinal} 
                  onChangeText={setTareaValorFinal} 
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Clase Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
              <Text style={styles.sectionTitle}>Clase</Text>
              <TouchableOpacity 
                onPress={() => router.push("/QADir/Clases/AddClassScreen")}
                style={styles.addButton}
              >
                <Ionicons name="add-circle" size={24} color={colors.color_palette_1.lineArt_Purple} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerWrapperClass}>
              <Picker 
                style={styles.picker}
                selectedValue={tareaClaseId} 
                onValueChange={setTareaClaseId} 
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Selecciona una Clase" value="N/A" />
                {clase.map((doc, index) => (
                  <Picker.Item key={index} label={doc.class_name} value={doc.id || doc.clase_id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleAddTarea}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Tarea</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'poppins-bold',
    color: '#fff',
    marginBottom: 5,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  idText: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
    color: colors.color_palette_1.lineArt_Purple,
    marginLeft: 4,
  },
  
  // Form Container
  formContainer: {
    padding: 20,
  },
  
  // Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  
  // Input Group
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#555',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'poppins-regular',
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  
  // Two Column Layout
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  halfColumn: {
    flex: 1,
  },
  
  // Date Time Styles
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  dateTimeButtonText: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#333',
  },
  pickerContainer: {
    marginTop: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Picker Styles
  pickerWrapperState: {
    borderWidth: 2,
    borderColor: '#f6f6f6ff',
    borderRadius: 12,
    backgroundColor: '#f0f0f0ff',
    overflow: 'hidden',
    height: 70,
    width: 152
  },
  pickerWrapperClass: {
    borderWidth: 2,
    borderColor: '#f6f6f6ff',
    borderRadius: 12,
    overflow: 'hidden',
    height: 70,
  },

  picker: {
    bottom: 75,
  },
  
   pickerItem: {
    color: '#530344ff',
    backgroundColor: '#f0f0f0ff',
    fontSize: 16,
  },

  input_picker: {
    color: '#000',
    fontSize: 15,
  },
  
  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: colors.color_palette_1.lineArt_Purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 17,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginLeft: 8,
  },
  
  bottomSpacer: {
    height: 40,
  },
});