import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";

export default function AddPeriod() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditMode = !!params.periodId;

  const [periodId, setPeriodId] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // DatePicker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          await loadPeriodData(params.periodId);
        } else {
          await getNextPeriodId();
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isEditMode, params.periodId]);

  const loadPeriodData = async (periodId) => {
    try {
      const q = query(collection(db, "idPeriodoCollection"));
      const snapshot = await getDocs(q);
      
      const periodDoc = snapshot.docs.find(
        doc => doc.data().periodo_id === periodId
      );

      if (periodDoc) {
        const data = periodDoc.data();
        setPeriodId(data.periodo_id);
        setCourseYear(data.periodo_curso_anio);
        
        if (data.periodo_fecha_inicio) {
          setStartDate(data.periodo_fecha_inicio.toDate());
        }
        if (data.periodo_fecha_final) {
          setEndDate(data.periodo_fecha_final.toDate());
        }
      }
    } catch (error) {
      console.error("Error al cargar periodo:", error);
      throw error;
    }
  };

  const getNextPeriodId = async () => {
    try {
      const q = query(
        collection(db, "idPeriodoCollection"), 
        orderBy("periodo_id", "desc"), 
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const lastPeriod = snapshot.docs[0].data();
        const nextId = (parseInt(lastPeriod.periodo_id) + 1).toString();
        setPeriodId(nextId);
      } else {
        setPeriodId("1");
      }
    } catch (error) {
      console.error("Error al obtener ID:", error);
      setPeriodId("1");
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      
      if (selectedDate > endDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setMonth(newEndDate.getMonth() + 4); 
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      if (selectedDate < startDate) {
        Alert.alert(
          "Fecha Inválida", 
          "La fecha final debe ser posterior a la fecha de inicio"
        );
        return;
      }
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const validateForm = () => {
    if (!courseYear.trim()) {
      Alert.alert("Campo Requerido", "Por favor ingresa el año del curso");
      return false;
    }

    if (endDate <= startDate) {
      Alert.alert(
        "Fechas Inválidas", 
        "La fecha final debe ser posterior a la fecha de inicio"
      );
      return false;
    }

    return true;
  };

  const handleSavePeriod = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const periodData = {
        periodo_id: periodId,
        periodo_curso_anio: courseYear.trim(),
        periodo_fecha_inicio: Timestamp.fromDate(startDate),
        periodo_fecha_final: Timestamp.fromDate(endDate),
        createdAt: isEditMode ? undefined : Timestamp.now()
      };

      if (isEditMode) {
        const q = query(collection(db, "idPeriodoCollection"));
        const snapshot = await getDocs(q);
        
        const periodDoc = snapshot.docs.find(
          doc => doc.data().periodo_id === periodId
        );

        if (periodDoc) {
          await updateDoc(doc(db, "idPeriodoCollection", periodDoc.id), {
            periodo_id: periodData.periodo_id,
            periodo_curso_anio: periodData.periodo_curso_anio,
            periodo_fecha_inicio: periodData.periodo_fecha_inicio,
            periodo_fecha_final: periodData.periodo_fecha_final
          });

          Alert.alert(
            "✅ Actualizado", 
            "El periodo fue actualizado correctamente",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      } else {
        await addDoc(collection(db, "idPeriodoCollection"), periodData);

        Alert.alert(
          "✅ Éxito", 
          "El periodo fue creado correctamente",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }

      resetForm();
    } catch (error) {
      console.error("Error al guardar el periodo:", error);
      Alert.alert("Error", "No se pudo guardar el periodo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!isEditMode) {
      setCourseYear("");
      setStartDate(new Date());
      setEndDate(new Date());
      setPeriodId(periodId);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.color_palette_1.lineArt_Purple} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.color_palette_1.lineArt_Purple} 
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Editar Periodo' : 'Agregar Periodo'}
            </Text>
            <Text style={styles.headerSubtitle}>Periodo {periodId}</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>

          {/* Año del Curso */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Periodo del Curso <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color="#999" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ej: 1,2,3"
                value={periodId}
                onChangeText={setPeriodId}
              />
            </View>
            <Text style={styles.helperText}>
              Ingresa el año o nombre del periodo académico
            </Text>
          </View>
          
          {/* Año del Curso */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Año del Curso <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color="#999" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ej: 2025, 1er Semestre 2025"
                value={courseYear}
                onChangeText={setCourseYear}
              />
            </View>
            <Text style={styles.helperText}>
              Ingresa el año o nombre del periodo académico
            </Text>
          </View>

          {/* Fecha de Inicio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Fecha de Inicio <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={colors.color_palette_1.lineArt_Purple}
                style={styles.inputIcon}
              />
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onStartDateChange}
              textColor="#000"
            />
          )}

          {/* Fecha Final */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Fecha Final <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={colors.color_palette_1.lineArt_Purple}
                style={styles.inputIcon}
              />
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color="#999"
              />
            </TouchableOpacity>
            <Text style={styles.helperText}>
              La fecha final debe ser posterior a la fecha de inicio
            </Text>
          </View>

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onEndDateChange}
              minimumDate={startDate}
              textColor="#000"
            />
          )}

          {/* Información de Duración */}
          <View style={styles.durationCard}>
            <Ionicons 
              name="time-outline" 
              size={24} 
              color={colors.color_palette_1.lineArt_Purple}
            />
            <View style={styles.durationInfo}>
              <Text style={styles.durationLabel}>Duración del Periodo</Text>
              <Text style={styles.durationValue}>
                {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} días
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSavePeriod}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={isEditMode ? "save" : "checkmark-circle"} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.saveButtonText}>
                    {isEditMode ? 'Actualizar' : 'Guardar'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'poppins-bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 2,
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'poppins-regular',
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginTop: 5,
    marginLeft: 5,
  },

  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'poppins-medium',
    color: '#333',
  },

  // Duration Card
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.color_palette_1.lineArt_Purple + '30',
  },
  durationInfo: {
    flex: 1,
    marginLeft: 15,
  },
  durationLabel: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#666',
  },
  durationValue: {
    fontSize: 18,
    fontFamily: 'poppins-bold',
    color: colors.color_palette_1.lineArt_Purple,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#666',
  },
  saveButton: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
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