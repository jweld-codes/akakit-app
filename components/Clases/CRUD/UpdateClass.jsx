// UpdateClass.jsx - CON FUNCIONALIDAD DE FLUJOGRAMA
import { Ionicons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../config/firebaseConfig';
import ClassSearchModal from '../../../modals/ClassSearchModal';

export default function UpdateClass({ visible, classData, docenteData, onClose, onUpdated }) {
  const [classCodigo, setClassCodigo] = useState(classData?.class_codigo || "");
  const [className, setClassName] = useState(classData?.class_name || "");
  const [classPeriod, setClassPeriod] = useState(classData?.class_period || "");
  const [classIdDocente, setClassIdDocente] = useState(classData?.class_id_docente || "");
  const [classCredit, setClassCredit] = useState(classData?.class_credit || "");
  const [claseModality, setClaseModality] = useState(classData?.class_modality || "");
  const [classNotasPersonales, setClassNotasPersonales] = useState(classData?.class_notas_personales || "");
  const [classFecha, setClassFecha] = useState(classData?.class_days || "");
  const [classHours, setClassHours] = useState(classData?.class_hours);
  const [classEnrollment, setClassEnrollment] = useState(classData?.class_enrollment || "");
  const [classSection, setClassSection] = useState(classData?.class_section || "");
  const [classType, setClassType] = useState(classData?.class_type || "");
  const [classUrl, setClassUrl] = useState(classData?.class_url_access || "");
  const [classEstado, setClassEstado] = useState(classData?.class_estado || "");
  const [classYear, setClassYear] = useState(classData?.class_year || "");
  const [classPromedio, setClassPromedio] = useState(classData?.class_promedio || 0);

  const [docentesName, setDocenteName] = useState(docenteData?.docente_fullName || "");
  const [docentesId, setDocenteId] = useState(docenteData?.docente_id || "");

  // NUEVOS ESTADOS PARA FLUJOGRAMA
  const [flowchartClasses, setFlowchartClasses] = useState([]);
  const [flowchartData, setFlowchartData] = useState(null);
  const [selectedPrerequisite, setSelectedPrerequisite] = useState(null);
  const [selectedOpensClass, setSelectedOpensClass] = useState(null);
  const [showPrerequisiteSearch, setShowPrerequisiteSearch] = useState(false);
  const [showOpensClassSearch, setShowOpensClassSearch] = useState(false);
  const [isInFlowchart, setIsInFlowchart] = useState(false);
  const [loadingFlowchart, setLoadingFlowchart] = useState(false);

  useEffect(() => {
    if (visible && classData) {
      loadClassData();
      loadFlowchartData();
    }
  }, [visible, classData]);

  const loadClassData = () => {
    setClassName(classData.class_name || '');
    setClassCodigo(classData.class_codigo || '');
    setClassSection(classData.class_section || '');
    setClassPeriod(classData.class_period || '');
    setClassIdDocente(classData.class_id_docente || '');
    setClassCredit(classData.class_credit || '');
    setClaseModality(classData.class_modality || '');
    setClassNotasPersonales(classData.class_notas_personales || '');
    setClassFecha(classData.class_days || '');
    setClassHours(classData.class_hours || '');
    setClassEnrollment(classData.class_enrollment || '');
    setClassType(classData.class_type || '');
    setClassUrl(classData.class_url_access || '');
    setClassEstado(classData.class_estado || '');
    setClassYear(classData.class_year || '');
    setClassPromedio(classData.class_promedio || 0);

    setDocenteName(docenteData?.docente_fullName || '');
    setDocenteId(docenteData?.docente_id || '');
  };

  const loadFlowchartData = async () => {
    setLoadingFlowchart(true);
    try {
      const flowchartSnapshot = await getDocs(collection(db, "idFlujogramaClases"));
      const flowchartList = flowchartSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFlowchartClasses(flowchartList);

      const currentFlowchart = flowchartList.find(
        fc => fc.fc_name === classData?.class_name || 
             fc.fc_codigo === classData?.class_codigo
      );

      if (currentFlowchart) {
        setIsInFlowchart(true);
        setFlowchartData(currentFlowchart);

        if (currentFlowchart.fc_open_class_id) {
          const prerequisite = flowchartList.find(
            fc => fc.fc_id === currentFlowchart.fc_open_class_id
          );
          setSelectedPrerequisite(prerequisite || null);
        }

        if (currentFlowchart.fc_opened_id_by) {
          const opensClass = flowchartList.find(
            fc => fc.fc_id === currentFlowchart.fc_opened_id_by
          );
          setSelectedOpensClass(opensClass || null);
        }
      } else {
        setIsInFlowchart(false);
        setFlowchartData(null);
      }
    } catch (error) {
      console.error('Error cargando datos de flujograma:', error);
    } finally {
      setLoadingFlowchart(false);
    }
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

  const handleAddToFlowchart = async () => {
    Alert.alert(
      'Agregar al Flujograma',
      '¿Deseas agregar esta clase al flujograma de cursos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar',
          onPress: async () => {
            try {
              setLoadingFlowchart(true);

              const flowchartSnapshot = await getDocs(collection(db, "idFlujogramaClases"));
              let maxId = 0;
              flowchartSnapshot.docs.forEach(doc => {
                const id = parseInt(doc.data().fc_id);
                if (!isNaN(id) && id > maxId) maxId = id;
              });

              const newFlowchartData = {
                fc_id: (maxId + 1).toString(),
                fc_name: className,
                fc_codigo: classCodigo,
                fc_creditos: classCredit,
                fc_type: classType || "General",
                fc_periodo: classPeriod || "N/A",
                fc_anio: classYear || "N/A",
                fc_enrollment: classEnrollment,
                fc_promedio: 0,
                fc_status: classEstado || "Activo",
                fc_open_class_id: "",
                fc_open_class_name: "",
                fc_opened_id_by: "",
                fc_promedio: classPromedio,
                createdAt: Timestamp.now(),
              };

              await addDoc(collection(db, "idFlujogramaClases"), newFlowchartData);

              Alert.alert('Éxito', 'Clase agregada al flujograma correctamente');
              
              await loadFlowchartData();
            } catch (error) {
              console.error('Error al agregar al flujograma:', error);
              Alert.alert('Error', 'No se pudo agregar la clase al flujograma');
            } finally {
              setLoadingFlowchart(false);
            }
          }
        }
      ]
    );
  };

  const handleRemoveFromFlowchart = () => {
    Alert.alert(
      'Eliminar del Flujograma',
      '¿Estás seguro de que deseas eliminar esta clase del flujograma? Esto no eliminará la clase principal, solo sus dependencias en el flujograma.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingFlowchart(true);

              if (!flowchartData?.fc_id) {
                Alert.alert('Error', 'No se encontró el registro en el flujograma');
                return;
              }

              // Verificar si otras clases dependen de esta
              const dependentClasses = flowchartClasses.filter(
                fc => fc.fc_open_class_id === flowchartData.fc_id || 
                      fc.fc_opened_id_by === flowchartData.fc_id
              );

              if (dependentClasses.length > 0) {
                const classNames = dependentClasses.map(c => c.fc_name).join(', ');
                Alert.alert(
                  'No se puede eliminar',
                  `Las siguientes clases dependen de esta: ${classNames}. Elimina primero sus dependencias.`,
                  [{ text: 'OK' }]
                );
                setLoadingFlowchart(false);
                return;
              }

              // Buscar y eliminar el documento
              const flowchartQuery = query(
                collection(db, "idFlujogramaClases"),
                where("fc_id", "==", flowchartData.fc_id)
              );
              const flowchartSnap = await getDocs(flowchartQuery);

              if (!flowchartSnap.empty) {
                const flowchartDocRef = doc(db, 'idFlujogramaClases', flowchartSnap.docs[0].id);
                await deleteDoc(flowchartDocRef);

                Alert.alert('Éxito', 'Clase eliminada del flujograma');
                
                // Recargar datos
                setIsInFlowchart(false);
                setFlowchartData(null);
                setSelectedPrerequisite(null);
                setSelectedOpensClass(null);
                await loadFlowchartData();
              }
            } catch (error) {
              console.error('Error al eliminar del flujograma:', error);
              Alert.alert('Error', 'No se pudo eliminar la clase del flujograma');
            } finally {
              setLoadingFlowchart(false);
            }
          }
        }
      ]
    );
  };

  // FUNCIÓN PARA DETECTAR DEPENDENCIAS CIRCULARES
  const checkCircularDependency = () => {
    if (!selectedPrerequisite || !selectedOpensClass) return false;

    // Verificar si la clase prerequisito tiene como prerequisito a la clase que abre esta
    const prerequisiteOfPrerequisite = flowchartClasses.find(
      fc => fc.fc_id === selectedPrerequisite.fc_open_class_id
    );

    if (prerequisiteOfPrerequisite?.fc_id === selectedOpensClass.fc_id) {
      return true;
    }

    // Verificar cadenas más largas (máximo 3 niveles)
    let current = selectedPrerequisite;
    let depth = 0;
    const visited = new Set();

    while (current && depth < 3) {
      if (visited.has(current.fc_id)) return true; // Ciclo detectado
      visited.add(current.fc_id);

      if (current.fc_id === selectedOpensClass?.fc_id) return true;

      current = flowchartClasses.find(fc => fc.fc_id === current.fc_open_class_id);
      depth++;
    }

    return false;
  };

  const handleUpdate = async () => {
    if (!classData?.clase_id) return;
    
    try {
      // 1. Actualizar en idClaseCollection
      const classSnap = await getDocs(collection(db, "idClaseCollection"));
      const claseDoc = classSnap.docs.find(doc => {
        const data = doc.data();
        return (
          data.clase_id === classData?.clase_id || 
          data.clase_id === String(classData?.clase_id) ||
          data.clase_id === Number(classData?.clase_id)
        );
      });

      if (!claseDoc) {
        Alert.alert('Error', `No se encontró clase con ID: ${classData?.clase_id}`);
        return;
      }

      const classRef = doc(db, 'idClaseCollection', claseDoc.id);
      await updateDoc(classRef, {
        class_name: className,
        class_codigo: classCodigo,
        class_section: classSection,
        class_hours: classHours,
        class_credit: classCredit,
        class_days: classFecha,
        class_enrollment: classEnrollment,
        class_id_docente: classIdDocente,
        class_modality: claseModality,
        class_notas_personales: classNotasPersonales,
        class_period: classPeriod,
        class_type: classType,
        class_url_access: classUrl,
        class_estado: classEstado,
        class_year: classYear,
        class_promedio: classPromedio,
        updatedAt: Timestamp.now(),
      });

      // 2. Actualizar en idFlujogramaClases si existe
      if (isInFlowchart && flowchartData) {
        const flowchartQuery = query(
          collection(db, "idFlujogramaClases"),
          where("fc_id", "==", flowchartData.fc_id)
        );
        const flowchartSnap = await getDocs(flowchartQuery);

        if (!flowchartSnap.empty) {
          const flowchartDocRef = doc(db, 'idFlujogramaClases', flowchartSnap.docs[0].id);
          await updateDoc(flowchartDocRef, {
            fc_name: className,
            fc_codigo: classCodigo,
            fc_creditos: classCredit,
            fc_type: classType || "General",
            fc_periodo: classPeriod || "N/A",
            fc_anio: classYear || "N/A",
            fc_enrollment: classEnrollment,
            fc_status: classEstado,
            fc_promedio: classPromedio,
            fc_open_class_id: selectedPrerequisite?.fc_id || "",
            fc_open_class_name: selectedPrerequisite?.fc_name || "",
            fc_opened_id_by: selectedOpensClass?.fc_id || "",
            updatedAt: Timestamp.now(),
          });
        }
      }

      Alert.alert('Éxito', 'Clase actualizada correctamente');
      onUpdated?.();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar la clase');
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose} 
      transparent={false}
    >
      <View style={styles.modalContainer}>
        {/* Modales de búsqueda */}
        <ClassSearchModal
          visible={showPrerequisiteSearch}
          onClose={() => setShowPrerequisiteSearch(false)}
          classes={flowchartClasses.filter(fc => fc.fc_id !== flowchartData?.fc_id)}
          onSelectClass={handleSelectPrerequisite}
          title="Seleccionar Prerequisito"
          subtitle="Clase que se requiere para cursar esta"
        />

        <ClassSearchModal
          visible={showOpensClassSearch}
          onClose={() => setShowOpensClassSearch(false)}
          classes={flowchartClasses.filter(fc => fc.fc_id !== flowchartData?.fc_id)}
          onSelectClass={handleSelectOpensClass}
          title="Seleccionar Clase que Abre"
          subtitle="Clase que habilitó esta clase"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Editar Clase</Text>
            <Text style={styles.headerSubtitle}>{classData?.class_name}</Text>
            {isInFlowchart && (
              <View style={styles.flowchartBadge}>
                <Ionicons name="git-network" size={14} color="#fff" />
                <Text style={styles.flowchartBadgeText}>En Flujograma</Text>
              </View>
            )}
          </View>
        </View>
        
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            
            {/* Información Principal */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={22} color="#51042cff" />
                <Text style={styles.sectionTitle}>Información Principal</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre de la Clase</Text>
                <TextInput
                  value={className}
                  onChangeText={setClassName}
                  placeholder="Ej: Programación I"
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Código</Text>
                  <TextInput
                    value={classCodigo}
                    onChangeText={setClassCodigo}
                    placeholder="IS-410"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Sección</Text>
                  <TextInput
                    value={classSection}
                    onChangeText={setClassSection}
                    placeholder="0900"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Créditos (U.V)</Text>
                  <TextInput
                    value={classCredit}
                    onChangeText={setClassCredit}
                    placeholder="4"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Modalidad</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={claseModality}
                      onValueChange={setClaseModality}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      <Picker.Item label="Seleccionar" value="" />
                      <Picker.Item label="Virtual" value="Virtual" />
                      <Picker.Item label="Presencial" value="Presencial" />
                      <Picker.Item label="Híbrida" value="Hibrida" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Clase</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={classType}
                    onValueChange={setClassType}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Seleccionar tipo" value="" />
                    <Picker.Item label="General y Complementaria" value="General y Complementaria" />
                    <Picker.Item label="Ciencias de Datos" value="Ciencias de Datos" />
                    <Picker.Item label="Ciencias Exactas" value="Ciencias Exactas" />
                    <Picker.Item label="Negocios" value="Negocios" />
                    <Picker.Item label="Programación" value="Programación" />
                    <Picker.Item label="Inglés" value="inglés" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Horario */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={22} color="#51042cff" />
                <Text style={styles.sectionTitle}>Horario</Text>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Días</Text>
                  <TextInput
                    value={classFecha}
                    onChangeText={setClassFecha}
                    placeholder="Lun-Mier-Vier"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Hora</Text>
                  <TextInput
                    value={classHours}
                    onChangeText={setClassHours}
                    placeholder="07:00 - 08:50"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>
            </View>

            {/* Periodo Académico */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={22} color="#51042cff" />
                <Text style={styles.sectionTitle}>Periodo Académico</Text>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Periodo</Text>
                  <TextInput
                    value={classPeriod}
                    onChangeText={setClassPeriod}
                    placeholder="I PAC"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Año</Text>
                  <TextInput
                    value={classYear}
                    onChangeText={setClassYear}
                    placeholder="2025"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado de Matrícula</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={classEnrollment}
                    onValueChange={setClassEnrollment}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Seleccionar" value="" />
                    <Picker.Item label="En Curso" value="En Curso" />
                    <Picker.Item label="Cursada" value="Cursada" />
                  </Picker>
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Promedio FInal</Text>
                  <TextInput
                    value={classPromedio}
                    onChangeText={setClassPromedio}
                    placeholder="100%"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                </View>
            </View>

            {/* SECCIÓN FLUJOGRAMA */}
            {loadingFlowchart ? (
              <View style={styles.section}>
                <ActivityIndicator size="large" color="#51042cff" />
                <Text style={styles.loadingText}>Cargando datos del flujograma...</Text>
              </View>
            ) : isInFlowchart ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="git-network" size={22} color="#51042cff" />
                  <Text style={styles.sectionTitle}>Flujograma de Curso</Text>
                  {/* Botón para eliminar del flujograma */}
                  <TouchableOpacity
                    onPress={handleRemoveFromFlowchart}
                    style={styles.removeFromFlowchartButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#e91e63" />
                  </TouchableOpacity>
                </View>

                <View style={styles.flowchartInfo}>
                  <Ionicons name="information-circle" size={20} color="#51042cff" />
                  <Text style={styles.flowchartInfoText}>
                    Esta clase está registrada en el flujograma
                  </Text>
                </View>

                {/* Prerequisito */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Prerequisito (Clase requerida)</Text>
                    <TouchableOpacity 
                      onPress={handleOpenPrerequisiteSearch}
                      style={styles.searchIconButton}
                    >
                      <Ionicons name="search" size={20} color="#51042cff" />
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
                      <Ionicons name="search" size={20} color="#51042cff" />
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

                {/* Validación de dependencias circulares */}
                {checkCircularDependency() && (
                  <View style={styles.warningContainer}>
                    <Ionicons name="warning" size={20} color="#ff9800" />
                    <Text style={styles.warningText}>
                      ⚠️ Advertencia: Se detectó una posible dependencia circular. Verifica que las dependencias sean correctas.
                    </Text>
                  </View>
                )}

                {/* Resumen visual */}
                {(selectedPrerequisite || selectedOpensClass) && (
                  <View style={styles.dependencyVisualization}>
                    <View style={styles.dependencyHeader}>
                      <Ionicons name="information-circle" size={20} color="#51042cff" />
                      <Text style={styles.dependencyHeaderText}>Resumen de dependencias</Text>
                    </View>
                    
                    {selectedOpensClass && (
                      <View style={styles.dependencyItem}>
                        <Ionicons name="arrow-down" size={16} color="#4caf50" />
                        <Text style={styles.dependencyText}>
                          <Text style={styles.dependencyBold}>{selectedOpensClass.fc_name}</Text>
                          {" → abre → "}
                          <Text style={styles.dependencyBold}>{className || "Esta clase"}</Text>
                        </Text>
                      </View>
                    )}
                    
                    {selectedPrerequisite && (
                      <View style={styles.dependencyItem}>
                        <Ionicons name="lock-closed" size={16} color="#e91e63" />
                        <Text style={styles.dependencyText}>
                          <Text style={styles.dependencyBold}>{className || "Esta clase"}</Text>
                          {" requiere → "}
                          <Text style={styles.dependencyBold}>{selectedPrerequisite.fc_name}</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="git-network-outline" size={22} color="#999" />
                  <Text style={[styles.sectionTitle, { color: '#999' }]}>
                    Flujograma de Curso
                  </Text>
                </View>
                <View style={styles.notInFlowchartContainer}>
                  <Ionicons name="information-circle-outline" size={48} color="#ccc" />
                  <Text style={styles.notInFlowchartText}>
                    Esta clase no está en el flujograma
                  </Text>
                  <Text style={styles.notInFlowchartSubtext}>
                    Puedes agregarla para gestionar sus dependencias con otras clases
                  </Text>
                  
                  {/* BOTÓN PARA AGREGAR AL FLUJOGRAMA */}
                  <TouchableOpacity
                    onPress={handleAddToFlowchart}
                    style={styles.addToFlowchartButton}
                  >
                    <Ionicons name="add-circle" size={20} color="#fff" />
                    <Text style={styles.addToFlowchartButtonText}>
                      Agregar al Flujograma
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Docente */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={22} color="#51042cff" />
                <Text style={styles.sectionTitle}>Docente</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profesor Asignado</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={classIdDocente}
                    onValueChange={setClassIdDocente}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Selecciona un docente" value="" />
                    <Picker.Item key={docentesId} label={docentesName} value={docentesId} />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Recursos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="link-outline" size={22} color="#51042cff" />
                <Text style={styles.sectionTitle}>Recursos</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>URL de Sala Virtual</Text>
                <TextInput
                  value={classUrl}
                  onChangeText={setClassUrl}
                  placeholder="https://meet.google.com/..."
                  style={styles.input}
                  placeholderTextColor="#aaa"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas Personales</Text>
                <TextInput
                  value={classNotasPersonales}
                  onChangeText={setClassNotasPersonales}
                  placeholder="Agrega notas importantes..."
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor="#aaa"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}
              >
                <Ionicons name="close-circle-outline" size={20} color="#666" />
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdate}
                style={[styles.button, styles.saveButton]}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#51042cff',
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  closeButton: {
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
  flowchartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  flowchartBadgeText: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: '#495057',
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
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'poppins-regular',
    color: '#2c3e50',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'poppins-regular',
    color: '#999',
    marginTop: 6,
    lineHeight: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#f6f6f6ff',
    borderRadius: 12,
    backgroundColor: '#f0f0f0ff',
    overflow: 'hidden',
    height: 70,
  },
  picker: {
    bottom: 75,
    backgroundColor: '#f0f0f0ff',
  },
  pickerItem: {
    color: '#530344ff',
    backgroundColor: '#f0f0f0ff',
    fontSize: 16,
  },

  // Flowchart styles
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'poppins-regular',
    color: '#666',
    marginTop: 12,
  },
  flowchartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d0d9ff',
  },
  flowchartInfoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#51042cff',
  },
  selectedClassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#51042cff',
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
    color: '#51042cff',
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
  notInFlowchartContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  notInFlowchartText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  notInFlowchartSubtext: {
    fontSize: 13,
    fontFamily: 'poppins-regular',
    color: '#bbb',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    marginBottom: 20,
  },
  addToFlowchartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addToFlowchartButtonText: {
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
  removeFromFlowchartButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'poppins-medium',
    color: '#856404',
    lineHeight: 18,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#51042cff',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    color: '#fff',
  },
});