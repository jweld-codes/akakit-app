// components/Clases/AddClass.jsx - VERSIÓN COMPLETA CORREGIDA
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";
import global from "../../../constants/global";
import TeacherSearchModal from "../../../modals/TeacherSearchModal";

export default function AddClass() {
  const router = useRouter();
  
  const [classId, setClassId] = useState(1);
  const [classCodigo, setClassCodigo] = useState("");
  const [classPeriod, setClassPeriod] = useState("");
  const [classYear, setClassYear] = useState("");
  const [classIdDocente, setClassIdDocente] = useState("");
  const [classCredit, setClassCredit] = useState("");
  const [claseModality, setClaseModality] = useState("");
  const [claseName, setClaseName] = useState("");
  const [classNotasPersonales, setClassNotasPersonales] = useState("");
  const [claseFecha, setClassFecha] = useState("");
  const [classHorario, setClassHorario] = useState("");
  const [classEnrollment, setClassEnrollment] = useState("En Curso");
  const [classSection, setClassSection] = useState("");
  const [classType, setClassType] = useState("");
  const [classUrl, setClassUrl] = useState("");
  
  // Estados para docentes y modal
  const [docentes, setDocentes] = useState([]);
  const [showTeacherSearch, setShowTeacherSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "idClaseCollection"), orderBy("clase_id", "desc"), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastClass = snapshot.docs[0].data();
          setClassId(lastClass.clase_id + 1);
        }

        const docentesSnapshot = await getDocs(collection(db, "idDocentesCollection"));
        const docentesList = docentesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            docente_id: data.docente_id,
            docente_fullName: data.docente_fullName || 'Sin nombre',
            email: data.email || '',
            rating: data.rating || '',
            ...data
          };
        });
        
        setDocentes(docentesList);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddClass = async () => {
    if (!claseName || !classCodigo || !classCredit || !claseModality || !claseFecha || !classHorario) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios (*)");
      return;
    }

    try {
      await addDoc(collection(db, "idClaseCollection"), {
        clase_id: classId,
        class_codigo: classCodigo,
        class_period: classPeriod || "N/A",
        class_year: classYear || "N/A",
        class_id_docente: classIdDocente || "N/A",
        class_modality: claseModality,
        class_name: claseName,
        class_notas_personales: classNotasPersonales || "N/A",
        class_credit: classCredit,
        class_days: claseFecha,
        class_hours: classHorario,
        class_promedio: "0.00",
        class_section: classSection || "N/A",
        class_type: classType,
        class_url_access: classUrl || "N/A",
        class_enrollment: classEnrollment,
        class_estado: "Activo",
        createdAt: new Date(),
      });

      Alert.alert("✅ Clase agregada", "La clase fue guardada correctamente");
      resetForm();
      router.back();
    } catch (error) {
      console.error("❌ Error al guardar la clase:", error);
      Alert.alert("Error", "No se pudo guardar la clase");
    }
  };

  const resetForm = () => {
    setClassCodigo("");
    setClassPeriod("");
    setClassYear("");
    setClassIdDocente("");
    setClaseModality("");
    setClaseName("");
    setClassCredit("");
    setClassFecha("");
    setClassHorario("");
    setClassSection("");
    setClassType("");
    setClassUrl("");
    setClassNotasPersonales("");
    setClassEnrollment("En Curso");
  };

  const handleSelectTeacher = (teacher) => {
    setClassIdDocente(teacher.docente_id);
  };

  const handleOpenSearch = () => {
    if (docentes.length === 0) {
      Alert.alert(
        'Sin docentes',
        'No hay docentes registrados. ¿Deseas agregar uno?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Agregar', onPress: () => router.push("/QADir/Professors/AddProfessorScreen") }
        ]
      );
      return;
    }
    setShowTeacherSearch(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: 'poppins-regular' }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Teacher Search Modal */}
      <TeacherSearchModal
        visible={showTeacherSearch}
        onClose={() => {
          setShowTeacherSearch(false);
        }}
        teachers={docentes}
        onSelectTeacher={handleSelectTeacher}
      />

      {/* Header Fixed */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nueva Clase</Text>
          <Text style={styles.headerSubtitle}>ID de la clase: #{classId}</Text>
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
            <Ionicons name="book" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Información Básica</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la clase *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej: Cálculo Diferencial" 
              value={claseName} 
              onChangeText={setClaseName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Código *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: MAT-101" 
                value={classCodigo} 
                onChangeText={setClassCodigo}
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Sección</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: 1400" 
                value={classSection} 
                onChangeText={setClassSection}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Créditos *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: 4" 
                value={classCredit} 
                onChangeText={setClassCredit}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Tipo de clase</Text>
              <View style={styles.pickerWrapper}>
                <Picker 
                  selectedValue={classType} 
                  onValueChange={setClassType}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Selecciona tipo" value="" />
                  <Picker.Item label="General" value="General y Complementaria" />
                  <Picker.Item label="Datos" value="Ciencias de Datos" />
                  <Picker.Item label="Exactas" value="Ciencias Exactas" />
                  <Picker.Item label="Negocios" value="Negocios" />
                  <Picker.Item label="Programación" value="Programación" />
                  <Picker.Item label="Inglés" value="inglés" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Horario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Horario</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Días *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: Lu-Mi-Vi" 
                value={claseFecha} 
                onChangeText={setClassFecha}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Horario *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: 7:00-9:00 AM" 
                value={classHorario} 
                onChangeText={setClassHorario}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modalidad *</Text>
            <View style={styles.modalityButtons}>
              <TouchableOpacity
                style={[
                  styles.modalityButton,
                  claseModality === "Virtual" && styles.modalityButtonActive
                ]}
                onPress={() => setClaseModality("Virtual")}
              >
                <Ionicons 
                  name="desktop-outline" 
                  size={20} 
                  color={claseModality === "Virtual" ? "#fff" : colors.color_palette_1.lineArt_Purple} 
                />
                <Text style={[
                  styles.modalityButtonText,
                  claseModality === "Virtual" && styles.modalityButtonTextActive
                ]}>
                  Virtual
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalityButton,
                  claseModality === "Presencial" && styles.modalityButtonActive
                ]}
                onPress={() => setClaseModality("Presencial")}
              >
                <Ionicons 
                  name="school-outline" 
                  size={20} 
                  color={claseModality === "Presencial" ? "#fff" : colors.color_palette_1.lineArt_Purple} 
                />
                <Text style={[
                  styles.modalityButtonText,
                  claseModality === "Presencial" && styles.modalityButtonTextActive
                ]}>
                  Presencial
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalityButton,
                  claseModality === "Hibrida" && styles.modalityButtonActive
                ]}
                onPress={() => setClaseModality("Hibrida")}
              >
                <Ionicons 
                  name="git-merge-outline" 
                  size={20} 
                  color={claseModality === "Hibrida" ? "#fff" : colors.color_palette_1.lineArt_Purple} 
                />
                <Text style={[
                  styles.modalityButtonText,
                  claseModality === "Hibrida" && styles.modalityButtonTextActive
                ]}>
                  Híbrida
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Periodo académico */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Período Académico</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Período</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: I PAC" 
                value={classPeriod} 
                onChangeText={setClassPeriod}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Año</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: 2025" 
                value={classYear} 
                onChangeText={setClassYear}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado de matrícula</Text>
            <View style={styles.enrollmentButtons}>
              <TouchableOpacity
                style={[
                  styles.enrollmentButton,
                  classEnrollment === "En Curso" && styles.enrollmentButtonActive
                ]}
                onPress={() => setClassEnrollment("En Curso")}
              >
                <Text style={[
                  styles.enrollmentButtonText,
                  classEnrollment === "En Curso" && styles.enrollmentButtonTextActive
                ]}>
                  En Curso
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.enrollmentButton,
                  classEnrollment === "Cursada" && styles.enrollmentButtonActive
                ]}
                onPress={() => setClassEnrollment("Cursada")}
              >
                <Text style={[
                  styles.enrollmentButtonText,
                  classEnrollment === "Cursada" && styles.enrollmentButtonTextActive
                ]}>
                  Cursada
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Docente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Docente</Text>
            <View style={[styles.headerActions, global.aside]}>
              <TouchableOpacity 
                onPress={handleOpenSearch}
                style={styles.searchButton}
              >
                <Ionicons name="search" size={24} color={colors.color_palette_1.lineArt_Purple} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push("/QADir/Professors/AddProfessorScreen")}
                style={styles.addButton}
              >
                <Ionicons name="add-circle" size={28} color={colors.color_palette_1.lineArt_Purple} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Selecciona un profesor</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={classIdDocente} 
                onValueChange={setClassIdDocente}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Sin profesor asignado" value="" />
                {docentes.map((doc, index) => (
                  <Picker.Item 
                    key={doc.docente_id || index} 
                    label={doc.docente_fullName} 
                    value={doc.docente_id} 
                  />
                ))}
              </Picker>
            </View>
            {docentes.length === 0 && (
              <Text style={styles.helperText}>
                No hay docentes registrados. Usa el botón + para agregar uno.
              </Text>
            )}
          </View>
        </View>

        {/* Recursos y notas */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Recursos Adicionales</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de acceso (Zoom, Meet, etc.)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="https://..." 
              value={classUrl} 
              onChangeText={setClassUrl}
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notas personales</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Agrega notas sobre la clase..." 
              value={classNotasPersonales} 
              onChangeText={setClassNotasPersonales}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer con botones */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.push(`/(tabs)/clase`)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleAddClass}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Guardar Clase</Text>
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
    flex: 1,
  },
  addButton: {
    padding: 4,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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

  // Modality Buttons
  modalityButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  modalityButtonActive: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    borderColor: colors.color_palette_1.lineArt_Purple,
  },
  modalityButtonText: {
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#555',
  },
  modalityButtonTextActive: {
    color: '#fff',
  },

  // Enrollment Buttons
  enrollmentButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  enrollmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  enrollmentButtonActive: {
    backgroundColor: '#0c8406',
    borderColor: '#0c8406',
  },
  enrollmentButtonText: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#555',
  },
  enrollmentButtonTextActive: {
    color: '#fff',
  },

  // Picker
  pickerWrapper: {
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