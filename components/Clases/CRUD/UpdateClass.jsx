import { Ionicons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import { collection, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../config/firebaseConfig';

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

  const [docentesName, setDocenteName] = useState(docenteData?.docente_fullName || "");
  const [docentesId, setDocenteId] = useState(docenteData?.docente_id || "");

  useEffect(() => {
    if (classData) {
      //console.log(classData)
     // console.log("UpdateClase: ID es, ", classData.id);
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

      setDocenteName(docenteData?.docente_fullName || '');
      setDocenteId(docenteData?.docente_id || '');
    }
  }, [classData]);

  const handleUpdate = async () => {
    if (!classData?.clase_id) return;
    try {
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
        console.error(`No se encontró clase con clase_id: ${classData?.clase_id}`);
        return false;
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
        updatedAt: Timestamp.now(),
      });
      Alert.alert('Éxito', 'Clase actualizada correctamente');
      onUpdated?.();
    } catch (error) {
      console.error(error);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Editar Clase</Text>
            <Text style={styles.headerSubtitle}>{classData?.class_name}</Text>
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
                    <Picker.Item label="Matriculada" value="Matriculada" />
                  </Picker>
                </View>
              </View>
            </View>

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