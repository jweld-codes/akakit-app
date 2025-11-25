// components/Clases/AddClass.jsx - CON FUNCIONALIDAD DE FLUJOGRAMA
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";
import ClassSearchModal from "../../../modals/ClassSearchModal";

export default function AddClassCurso() {
  const router = useRouter();
  
  const [flujoClassId, setFlujoClassId] = useState("");
  const [flujoClaseName, setFlujoClaseName] = useState("");
  const [flujoClassCodigo, setFlujoClassCodigo] = useState("");
  const [flujoClassCredit, setFlujoClassCredit] = useState("");
  const [flujoClassType, setFlujoClassType] = useState("");
  const [flujoClassPeriod, setFlujoClassPeriod] = useState("");
  const [flujoClassYear, setFlujoClassYear] = useState("");
  const [flujoClassEnrollment, setFlujoClassEnrollment] = useState("Pendiente");
  const [flujoClassPromedio, setFlujoClassPromedio] = useState(0);
  const [flujoClassEstado, setFlujoClassEstado] = useState("Activo");
  const [flujoClassIdOpen, setFlujoClassIdOpen] = useState("");
  const [flujoClassNameOpen, setFlujoClassNameOpen] = useState("");
  const [flujoClassIdOpenBy, setFlujoClassIdOpenBy] = useState("");

  // Estados para clases y modal
  const [classes, setCasses] = useState([]);
  const [showTeacherSearch, setShowTeacherSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  // NUEVOS ESTADOS PARA FLUJOGRAMA
  const [flowchartId, setFlowchartId] = useState("");
  const [flowchartClasses, setFlowchartClasses] = useState([]);
  const [selectedPrerequisite, setSelectedPrerequisite] = useState(null); // Clase que se requiere
  const [selectedOpensClass, setSelectedOpensClass] = useState(null); // Clase que abre
  const [showPrerequisiteSearch, setShowPrerequisiteSearch] = useState(false);
  const [showOpensClassSearch, setShowOpensClassSearch] = useState(false);
  const [addToFlowchart, setAddToFlowchart] = useState(true); // Toggle para agregar al flujograma

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "idFlujogramaClases"), orderBy("fc_id", "desc"), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastClass = snapshot.docs[0].data();
          setFlujoClassId(lastClass.fc_id + 1);
        }

        const qFlowchart = query(
            collection(db, "idFlujogramaClases"), 
            orderBy("fc_id", "desc"), 
            limit(1)
        );

        const snapshotFlowchart = await getDocs(qFlowchart);
        if (!snapshotFlowchart.empty) {
          const lastFlowchart = snapshotFlowchart.docs[0].data();
          setFlowchartId(parseInt(lastFlowchart.fc_id) + 1);
        }

        // Obtener clases
        const classesSnapshot = await getDocs(collection(db, "idClaseCollection"));
        const classesList = classesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            clase_id: data.clase_id,
            class_name: data.class_name || 'Sin nombre',
            class_codigo: data.class_codigo || '',
            class_credit: data.class_credit || 0,
            class_type: data.class_type || '',
            ...data
          };
        });
        setCasses(classesList);

        // Obtener clases del flujograma
        const flowchartSnapshot = await getDocs(collection(db, "idFlujogramaClases"));
        const flowchartList = flowchartSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFlowchartClasses(flowchartList);
        
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
    if (!flujoClaseName || !flujoClassCodigo || !flujoClassCredit) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios (*)");
      return;
    }

    try {
      await addDoc(collection(db, "idFlujogramaClases"), {
        fc_id: flowchartId.toString(),
        fc_name: flujoClaseName,
        fc_codigo: flujoClassCodigo,
        fc_creditos: flujoClassCredit,
        fc_type: flujoClassType || "General",
        fc_periodo: flujoClassPeriod || "N/A",
        fc_anio: flujoClassYear || "N/A",
        fc_enrollment: flujoClassEnrollment,
        fc_promedio: flujoClassPromedio === "Cursada" ? 0 : 0,
        fc_status: flujoClassEstado || "Activo",
        fc_open_class_id: selectedPrerequisite?.fc_id || "", // Clase prerequisito
        fc_open_class_name: selectedPrerequisite?.fc_name || "",
        fc_opened_id_by: selectedOpensClass?.fc_id || "", // Clase que abrió esta
        createdAt: new Date(),
      });

      Alert.alert(
        "Clase agregada", 
        addToFlowchart
          ? "La clase fue guardada correctamente en el flujograma" 
          : "La clase fue guardada correctamente"
      );
      
      resetForm();
      router.back();
    } catch (error) {
      console.error("Error al guardar la clase:", error);
      Alert.alert("Error", "No se pudo guardar la clase");
    }
  };

  const resetForm = () => {
    setFlujoClassCodigo("");
    setFlujoClassPeriod("");
    setFlujoClassYear("");
    setFlujoClassIdOpen("");
    setFlujoClassIdOpenBy("");
    setFlujoClassNameOpen("");
    setFlujoClaseName("");
    setFlujoClassCredit("");
    setFlujoClassType("");
    setFlujoClassEnrollment("Pendiente");
    setSelectedPrerequisite(null);
    setSelectedOpensClass(null);
  };

  const handleSelectPrerequisite = (classItem) => {
    setSelectedPrerequisite(classItem);
    setShowPrerequisiteSearch(false);
  };

  const handleSelectOpensClass = (classItem) => {
    setSelectedOpensClass(classItem);
    setShowOpensClassSearch(false);
  };

  const handleOpenPrerequisiteSearch = () => {
    if (flowchartClasses.length === 0) {
      Alert.alert(
        'Sin clases',
        'No hay clases registradas en el flujograma aún.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowPrerequisiteSearch(true);
  };

  const handleOpenOpensClassSearch = () => {
    if (flowchartClasses.length === 0) {
      Alert.alert(
        'Sin clases',
        'No hay clases registradas en el flujograma aún.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowOpensClassSearch(true);
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

      {/* Prerequisite Class Search Modal */}
      <ClassSearchModal
        visible={showPrerequisiteSearch}
        onClose={() => setShowPrerequisiteSearch(false)}
        classes={flowchartClasses}
        onSelectClass={handleSelectPrerequisite}
        title="Seleccionar Prerequisito"
        subtitle="Clase que se requiere para cursar esta"
      />

      {/* Opens Class Search Modal */}
      <ClassSearchModal
        visible={showOpensClassSearch}
        onClose={() => setShowOpensClassSearch(false)}
        classes={flowchartClasses}
        onSelectClass={handleSelectOpensClass}
        title="Seleccionar Clase que Abre"
        subtitle="Clase que habilitó esta clase"
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
          <Text style={styles.headerTitle}>Nueva Clase de la Carrera</Text>
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
              value={flujoClaseName} 
              onChangeText={setFlujoClaseName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Código *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: MAT-101" 
                value={flujoClassCodigo} 
                onChangeText={setFlujoClassCodigo}
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Créditos *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: 4" 
                value={flujoClassCredit} 
                onChangeText={setFlujoClassCredit}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Tipo de clase</Text>
              <View style={styles.pickerWrapper}>
                <Picker 
                  selectedValue={flujoClassType} 
                  onValueChange={setFlujoClassType}
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
                value={flujoClassPeriod} 
                onChangeText={setFlujoClassPeriod}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Año</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: 2025" 
                value={flujoClassYear} 
                onChangeText={setFlujoClassYear}
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
                  flujoClassEnrollment === "Pendiente" && styles.enrollmentButtonActive
                ]}
                onPress={() => setFlujoClassEnrollment("Pendiente")}
              >
                <Text style={[
                  styles.enrollmentButtonText,
                  flujoClassEnrollment === "Pendiente" && styles.enrollmentButtonTextActive
                ]}>
                  Pendiente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.enrollmentButton,
                  flujoClassEnrollment === "Cursada" && styles.enrollmentButtonActive
                ]}
                onPress={() => setFlujoClassEnrollment("Cursada")}
              >
                <Text style={[
                  styles.enrollmentButtonText,
                  flujoClassEnrollment === "Cursada" && styles.enrollmentButtonTextActive
                ]}>
                  Cursada
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* FLUJOGRAMA */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-network" size={24} color={colors.color_palette_1.lineArt_Purple} />
            <Text style={styles.sectionTitle}>Flujograma de Curso</Text>
          </View>

          {/* Toggle para agregar al flujograma */}
          <TouchableOpacity
            style={styles.flowchartToggle}
            onPress={() => setAddToFlowchart(!addToFlowchart)}
          >
            <View style={styles.flowchartToggleLeft}>
              <Ionicons 
                name={addToFlowchart ? "checkbox" : "square-outline"} 
                size={24} 
                color={addToFlowchart ? colors.color_palette_1.lineArt_Purple : "#999"} 
              />
              <View style={styles.flowchartToggleText}>
                <Text style={styles.flowchartToggleTitle}>
                  Agregar al flujograma
                </Text>
                <Text style={styles.flowchartToggleSubtitle}>
                  Registrar dependencias entre clases
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {addToFlowchart && (
            <>
              {/* Prerequisito */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Prerequisito (Clase requerida)</Text>
                  <TouchableOpacity 
                    onPress={handleOpenPrerequisiteSearch}
                    style={styles.searchIconButton}
                  >
                    <Ionicons name="search" size={20} color={colors.color_palette_1.lineArt_Purple} />
                  </TouchableOpacity>
                </View>
                
                {selectedPrerequisite ? (
                  <View style={styles.selectedClassCard}>
                    <View style={styles.selectedClassInfo}>
                      <Text style={styles.selectedClassCode}>
                        {selectedPrerequisite.fc_codigo}
                      </Text>
                      <Text style={styles.selectedClassName}>
                        {selectedPrerequisite.fc_name}
                      </Text>
                      <Text style={styles.selectedClassMeta}>
                        {selectedPrerequisite.fc_creditos} UV • {selectedPrerequisite.fc_type}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setSelectedPrerequisite(null)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#e91e63" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.emptySelection}
                    onPress={handleOpenPrerequisiteSearch}
                  >
                    <Ionicons name="lock-closed-outline" size={24} color="#999" />
                    <Text style={styles.emptySelectionText}>
                      Sin prerequisito
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.helperText}>
                  Clase que el estudiante debe aprobar antes de cursar esta
                </Text>
              </View>

              {/* Clase que abre */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Abierta por (Clase que habilitó esta)</Text>
                  <TouchableOpacity 
                    onPress={handleOpenOpensClassSearch}
                    style={styles.searchIconButton}
                  >
                    <Ionicons name="search" size={20} color={colors.color_palette_1.lineArt_Purple} />
                  </TouchableOpacity>
                </View>
                
                {selectedOpensClass ? (
                  <View style={styles.selectedClassCard}>
                    <View style={styles.selectedClassInfo}>
                      <Text style={styles.selectedClassCode}>
                        {selectedOpensClass.fc_codigo}
                      </Text>
                      <Text style={styles.selectedClassName}>
                        {selectedOpensClass.fc_name}
                      </Text>
                      <Text style={styles.selectedClassMeta}>
                        {selectedOpensClass.fc_creditos} UV • {selectedOpensClass.fc_type}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setSelectedOpensClass(null)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#e91e63" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.emptySelection}
                    onPress={handleOpenOpensClassSearch}
                  >
                    <Ionicons name="key-outline" size={24} color="#999" />
                    <Text style={styles.emptySelectionText}>
                      No fue abierta por otra clase
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.helperText}>
                  Clase que al ser aprobada habilitó esta clase
                </Text>
              </View>

              {/* Info visual de dependencias */}
              {(selectedPrerequisite || selectedOpensClass) && (
                <View style={styles.dependencyVisualization}>
                  <View style={styles.dependencyHeader}>
                    <Ionicons name="information-circle" size={20} color={colors.color_palette_1.lineArt_Purple} />
                    <Text style={styles.dependencyHeaderText}>Resumen de dependencias</Text>
                  </View>
                  
                  {selectedOpensClass && (
                    <View style={styles.dependencyItem}>
                      <Ionicons name="arrow-down" size={16} color="#4caf50" />
                      <Text style={styles.dependencyText}>
                        <Text style={styles.dependencyBold}>{selectedOpensClass.fc_name}</Text>
                        {" → abre → "}
                        <Text style={styles.dependencyBold}>{claseName || "Esta clase"}</Text>
                      </Text>
                    </View>
                  )}
                  
                  {selectedPrerequisite && (
                    <View style={styles.dependencyItem}>
                      <Ionicons name="lock-closed" size={16} color="#e91e63" />
                      <Text style={styles.dependencyText}>
                        <Text style={styles.dependencyBold}>{claseName || "Esta clase"}</Text>
                        {" requiere → "}
                        <Text style={styles.dependencyBold}>{selectedPrerequisite.fc_name}</Text>
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>

      {/* Footer con botones */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.push(`/(tabs)/curso`)}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    padding: 4,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchIconButton: {
    padding: 4,
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
  helperText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginTop: 6,
    lineHeight: 16,
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

  // Flowchart Section
  flowchartToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  flowchartToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flowchartToggleText: {
    flex: 1,
  },
  flowchartToggleTitle: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#333',
  },
  flowchartToggleSubtitle: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 2,
  },

  // Selected Class Card
  selectedClassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.color_palette_1.lineArt_Purple,
  },
  selectedClassInfo: {
    flex: 1,
  },
  selectedClassCode: {
    fontSize: 13,
    fontFamily: 'poppins-semibold',
    color: '#666',
    marginBottom: 4,
  },
  selectedClassName: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#333',
    marginBottom: 4,
  },
  selectedClassMeta: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
  },
  removeButton: {
    padding: 4,
    marginLeft: 12,
  },

  // Empty Selection
  emptySelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptySelectionText: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#999',
  },

  // Dependency Visualization
  dependencyVisualization: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d0d9ff',
    marginTop: 10,
  },
  dependencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dependencyHeaderText: {
    fontSize: 14,
    fontFamily: 'poppins-semibold',
    color: colors.color_palette_1.lineArt_Purple,
  },
  dependencyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    paddingLeft: 10,
  },
  dependencyText: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#555',
    flex: 1,
    lineHeight: 18,
  },
  dependencyBold: {
    fontFamily: 'poppins-semibold',
    color: '#333',
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