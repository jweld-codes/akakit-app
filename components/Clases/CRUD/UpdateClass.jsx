import { Ionicons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../config/firebaseConfig';
import colors from '../../../constants/colors';
import global from '../../../constants/global';


export default function UpdateClass({ visible, classData, docenteData, onClose, onUpdated }) {
  const [classCodigo, setClassCodigo] = useState(classData?.class_codigo || "");
  const [className, setClassName] = useState(classData?.class_name || "");

  const [classPeriod, setClassPeriod] = useState(classData?.class_period || "");
  const [classYear, setClassYear] = useState(classData?.class_year || "");

  const [classIdDocente, setClassIdDocente] = useState(classData?.class_id_docente || "");
  const [classCredit, setClassCredit] = useState(classData?.class_credit || "");
  const [claseModality, setClaseModality] = useState(classData?.class_modality || "");

  const [classNotasPersonales, setClassNotasPersonales] = useState(classData?.class_notas_personales || "");
  const [classFecha, setClassFecha] = useState(classData?.class_days || "");
  const [classHours, setClassHours] = useState(classData?.class_hours);

  const [classEnrollment, setClassEnrollment] = useState(classData?.class_enrollment || "");
  const [classSection, setClassSection] = useState(classData?.class_section || "");

  const [classType, setClassType] = useState(classData?.class_type || "");
  const [classUrl, setClassUrl] = useState(classData?.class_url_acces || "");
  const [classEstado, setClassEstado] = useState(classData?.class_estado || "");

  const [docentesName, setDocenteName] = useState(docenteData?.docente_fullName || "");
  const [docentesId, setDocenteId] = useState(docenteData?.docente_id || "");

  const [updatedAt, setUpdatedAt] = useState("");

  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);

  useEffect(() => {
    if (classData) {
      setClassName(classData.class_name || '');
      setClassCodigo(classData.class_codigo || '');
      setClassSection(classData.class_section || '');

      setClassPeriod(classData.class_period || '');
      setClassYear(classData.class_year || '');

      setClassIdDocente(classData.class_id_docente || '');
      setClassCredit(classData.class_credit || '');
      setClaseModality(classData.class_modality || '');

      setClassNotasPersonales(classData.class_notas_personales || '');
      setClassFecha(classData.class_days || '');
      setClassHours(classData.class_hours || '');

      setClassEnrollment(classData.class_enrollment || '');
      setClassType(classData.class_type || '');
      setClassUrl(classData.class_url_acces || '');

      setClassEstado(classData.class_estado || '');

      setDocenteName(docenteData.docente_fullName || '');
      setDocenteId(docenteData.docente_id || '');
    }
  }, [classData]);

  const handleUpdate = async () => {
    if (!classData?.id) return;
    try {
      const classRef = doc(db, 'idClasesCollection', classData.id);
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
        class_nota_personales: classNotasPersonales,
        class_period: classPeriod,
        class_section: classSection,
        class_type: classType,
        class_url_acces: classUrl,
        class_year: classYear,
        class_estado: classEstado,
        updatedAt: Timestamp.now(),
      });
      Alert.alert('✅', 'Clase actualizada con éxito');
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
    transparent={false}>
      <View style={styles.modalContainer}>

        <View>
          <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Editar Clase</Text>
          </View>
        </View>
        
        <View style={styles.container}>
          <ScrollView>

            <View>
              <Text style={styles.sectionTitle}>Nombre de la clase</Text>
              <TextInput
                value={className}
                onChangeText={setClassName}
                placeholder="Ej: Programación I"
                style={[styles.title, styles.input]}
                placeholderTextColor="#aaa"
                numberOfLines={3}
              />
            </View>

            <View>
               <Text style={{ fontWeight: '600' }}>Codigo</Text>
                <TextInput
                  value={classCodigo}
                  onChangeText={setClassCodigo}
                  placeholder="Código de la clase"
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
            </View>

            <View>
              <Text style={{ fontWeight: '600' }}>Seccion</Text>
              <TextInput
                value={classSection}
                onChangeText={setClassSection}
                placeholder="Seccion"
                style={[styles.input]}
              />
            </View>

            <View>
              <Text style={{ fontWeight: '600' }}>Horario</Text>
              <TextInput
                value={classHours}
                onChangeText={setClassHours}
                placeholder="Horario"
                style={[styles.input]}
              />
            </View>       

            <View>
              <View>
                <View style={[global.aside, global.notSpaceBetweenObjects]}>
                    <View>
                        <Text style={styles.subtitle}>Modality</Text>
                        <Picker style={[styles.input_aside_picker, {height:250}]} selectedValue={claseModality} onValueChange={setClaseModality} itemStyle={{color:'#000'}}>
                            <Picker.Item label="Select" value="" />
                            <Picker.Item label="Virtual" value="Virtual" />
                            <Picker.Item label="Presencial" value="Presencial" />
                            <Picker.Item label="Hibrida" value="Hibrida" />
                        </Picker>
                    </View>

                    <View style={{left: 20}}>
                        <View>
                            <Text style={styles.subtitle}>Class Code</Text>
                            <TextInput style={styles.input_aside} placeholder="Código de la Clase" value={classCodigo} onChangeText={setClassCodigo} />
                        </View>

                        <Text style={styles.subtitle}>Class Credits</Text>
                        <TextInput style={[styles.input_aside, {right:2}]} placeholder="Creditos" value={classCredit} onChangeText={setClassCredit} keyboardType="numeric" />

                        <View>
                            <Text style={styles.subtitle}>Class Section</Text>
                            <TextInput style={[styles.input_aside, {right:2}]} placeholder="Sección" value={classSection} onChangeText={setClassSection} />    
                        </View>
                    </View>
                </View>
              </View>
            
            </View>       

           

            

            {/* Horarios */}
            
            

            <View style={{top:40}}>
                <View style={[global.aside, global.spaceBetweenObjects]}>
                    <View>
                        <Text style={styles.subtitle}>Class Days</Text>
                        <TextInput style={styles.input_aside} placeholder="Días" value={classFecha} onChangeText={setClassFecha} />
                    </View>

                    <View style={{left: 20}}>
                        <Text style={styles.subtitle}>Class Hours</Text>
                        <TextInput style={[styles.input_aside, {right:2}]} placeholder="Horario" value={classHours} onChangeText={setClassHours} />
                    </View>
                </View>

                <View>
                    <Text style={styles.subtitle}>Class Type:</Text>
                    <Picker style={{bottom:80}} selectedValue={classType} onValueChange={setClassType} itemStyle={styles.input_picker}>
                        <Picker.Item label="Select Type" value="" />
                        <Picker.Item label="General y Complementaria" value="General y Complementaria" />
                        <Picker.Item label="Ciencias de Datos" value="Ciencias de Datos" />
                        <Picker.Item label="Ciencias Exactas" value="Ciencias Exactas" />
                        <Picker.Item label="Negocios" value="Negocios" />
                        <Picker.Item label="Programación" value="Programación" />
                        <Picker.Item label="inglés" value="inglés" />
                    </Picker>
                </View>

                <View style={{top:15, marginBottom:20}}>
                    <Text style={styles.subtitle}>URL de la Sala Virtual</Text>
                    <TextInput style={styles.input} placeholder="URL de Acceso" value={classUrl} onChangeText={setClassUrl} />
                </View>

                <View style={[global.aside, global.spaceBetweenObjects]}>
                    <View>
                        <Text style={styles.subtitle}>Class Period</Text>
                        <TextInput style={styles.input_aside} placeholder="Periodo" value={classPeriod} onChangeText={setClassPeriod} />
                    </View>

                    <View style={{left: 20}}>
                        <Text style={styles.subtitle}>Class Year</Text>
                        <TextInput style={[styles.input_aside, {right:2}]} placeholder="Año" value={classYear} onChangeText={setClassYear} />
                    </View>
                </View>

            </View>

            <View style={global.aside}>
                <Text style={styles.subtitle}>Choose Professor</Text>
                
                <TouchableOpacity onPress={() => router.push("/QADir/Professors/AddProfessorScreen")}>
                    <Ionicons name="add-circle-sharp" size={35} color={colors.color_palette_1.lineArt_Purple} />
                </TouchableOpacity>
                </View>
            <Picker selectedValue={classIdDocente} onValueChange={setClassIdDocente} itemStyle={styles.input_picker} style={{bottom:80}}>
                <Picker.Item label="Selecciona un docente" value="" />
                <Picker.Item key={docentesId} label={docentesName} value={docentesId} />
            </Picker>

            

            {/* Botones */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: '#ddd',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                }}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdate}
                style={{
                  backgroundColor: '#4F46E5',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        </View>
        
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 5,
  },

  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 12,
  },

  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  
  input: {
    borderWidth: 2,
    borderColor: "#eae8e8ff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 5,
  },
  
  input_aside: {
    width:150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 5,
  },

  input_aside_picker: {
    width:180,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  
  label: { fontSize: 16, marginBottom: 5 },

  input_picker: {
    color: '#000',
    top: 80,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },

  input_datepicker: {
    top: 20,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#6e6e6eff'
  },

  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },

  dateButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 55,
    marginBottom: 160
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },

  saveButton: {
    backgroundColor: "#3498db",
  },

  cancelText: {
    color: "#555",
    fontWeight: "bold",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  header: {
    backgroundColor: '#51042cff',
    paddingTop: 90,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  closeButton: {
    marginRight: 15,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },

});
