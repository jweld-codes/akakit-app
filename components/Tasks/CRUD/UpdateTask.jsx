import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../../../config/firebaseConfig";
import colors from '../../../constants/colors';
import global from '../../../constants/global';
import { getTaskStatusColor } from '../../../services/GetTareaByClassId';

export default function UpdateTask({ visible, task, onClose, onUpdated }) {
    const [tareaTitulo, setTareaTitulo] = useState(task?.tarea_titulo || "");
    const [tareaDescripcion, setTareaDescripcion] = useState(task?.tarea_descripcion || "");
    const [tareaEstado, setTareaEstado] = useState(task?.tarea_estado || "");
    const [tareaFechaApertura, setTareaFechaApertura] = useState(task?.tarea_fecha_apertura || "");
    const [tareaFechaEntrega, setTareaFechaEntrega] = useState(task?.tarea_fecha_entrega || "");
    const [tareaPeriodo, setTareaPeriodo] = useState(task?.tarea_periodo || "");
    const [tareaParcial, setTareaParcial] = useState(task?.tarea_parcial || "");
    const [tareaSemana, setTareaSemana] = useState(task?.tarea_semana || "");
    const [tareaValor, setTareaValor] = useState(task?.tarea_valor || "");
    const [tareaValorFinal, setTareaValorFinal] = useState(task?.tarea_valor_final || "");
    const [tareaComentario, setTareaComentario] = useState(task?.tarea_comentario || "");

    const[tareaDocumentoUrl, setTareaDocumentUrl] = useState(task?.tarea_doc_url || "")
    const[tareaDocumentoTitulo, setTareaDocumentTitulo] = useState(task?.tarea_doc_titulo || "")
    
    
    const [loading, setLoading] = useState(false);

    const [showDatePickerApertura, setShowDatePickerApertura] = useState(false);
    const [showDatePickerEntrega, setShowDatePickerEntrega] = useState(false);
    const [showTimePickerApertura, setShowTimePickerApertura] = useState(false);
    const [showTimePickerEntrega, setShowTimePickerEntrega] = useState(false);


  const statusColor = getTaskStatusColor(tareaEstado);

  useEffect(() => {
  if (task) {
    //console.log(task)
    //console.log("UpdateTask: ID es, ", task.id);
    setTareaTitulo(task.tarea_titulo || "");
    setTareaDescripcion(task.tarea_descripcion || "");
    setTareaEstado(task.tarea_estado || "");
    setTareaPeriodo(task.tarea_periodo || "");
    setTareaParcial(task.tarea_parcial || "");
    setTareaSemana(task.tarea_semana || "");
    setTareaValor(task.tarea_valor || "");
    setTareaValorFinal(task.tarea_valor_final || "");
    setTareaDocumentTitulo(task.tarea_doc_titulo || "");
    setTareaDocumentUrl(task.tarea_doc_url || "");
    setTareaComentario(task.tareaComentario || "")

    // Convertir Timestamp a Date
    if (task.tarea_fecha_apertura) {
      const apertura = task.tarea_fecha_apertura.toDate
        ? task.tarea_fecha_apertura.toDate()
        : new Date(task.tarea_fecha_apertura);
      setTareaFechaApertura(apertura);
    } else {
      setTareaFechaApertura(new Date());
    }

    if (task.tarea_fecha_entrega) {
      const entrega = task.tarea_fecha_entrega.toDate
        ? task.tarea_fecha_entrega.toDate()
        : new Date(task.tarea_fecha_entrega);
      setTareaFechaEntrega(entrega);
    } else {
      setTareaFechaEntrega(new Date());
    }
  }
}, [task]);

  const onChangeDateApertura = (task, selectedDate) => {
      setShowDatePickerApertura(Platform.OS === 'ios');
      if (selectedDate) {
        setTareaFechaApertura(selectedDate);
      }
    };
    const onChangeDateEntrega = (task, selectedDate) => {
      setShowDatePickerEntrega(Platform.OS === 'ios');
      if (selectedDate) {
        setTareaFechaEntrega(selectedDate);
      }
    };
  
    const onChangeTimeApertura = (task, selectedTime) => {
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
  

  const handleUpdate = async () => {
  if (!task?.id) return;
  try {
    const taskRef = doc(db, 'idTareasCollection', task.id);
    //console.log("UpdateTask: ID es, ", task.id);
    await updateDoc(taskRef, {
      tarea_titulo: tareaTitulo,
      tarea_descripcion: tareaDescripcion,
      tarea_estado: tareaEstado,
      tarea_fecha_apertura: Timestamp.fromDate(tareaFechaApertura),
      tarea_fecha_entrega: Timestamp.fromDate(tareaFechaEntrega),
      tarea_periodo: tareaPeriodo,
      tarea_parcial: tareaParcial,
      tarea_semana: tareaSemana,
      tarea_valor: tareaValor,
      tarea_valor_final: tareaValorFinal,
      tarea_doc_url: tareaDocumentoUrl,
      tarea_doc_titulo: tareaDocumentoTitulo,
      tarea_comentario: tareaComentario
    });

    Alert.alert('✅ Tarea actualizada');
    onUpdated?.();
    onClose?.();
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    Alert.alert('Error', 'No se pudo actualizar la tarea');
  }
};

  return (
    <Modal 
     visible={visible} 
     transparent={false} 
     onRequestClose={onClose} 
     animationType="slide"
    >
        <View style={styles.modalContainer}>
            <View style={[styles.header, { backgroundColor: statusColor }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Tarea</Text>
            </View>

            <ScrollView style={styles.content} >
                {/* Estado Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{tareaEstado}</Text>
                </View>

                 <Text style={styles.sectionTitle}>Titulo</Text>
                  <TextInput
                    value={tareaTitulo}
                    onChangeText={setTareaTitulo}
                    placeholder="Título de la tarea"
                    style={[styles.title, styles.input]}
                    placeholderTextColor="#aaa"
                  />

                 <Text style={styles.sectionTitle}>Descripción</Text>
                <TextInput
                  value={tareaDescripcion}
                  onChangeText={setTareaDescripcion}
                  placeholder="Descripción"
                  style={[styles.input, styles.textarea, styles.description]}
                  placeholderTextColor="#aaa"
                  multiline
                />

                {/* SELECTOR DE FECHA Y HORA */}
                <View style={{marginBottom: 20}}>
                  <View style={global.aside}>
                    <Text style={styles.sectionTitle}>Fecha y Hora de Apertura</Text>
                    <TouchableOpacity onPress={() => [setShowDatePickerApertura(false), setShowTimePickerApertura(false)]}>
                        <Ionicons 
                        name="arrow-up-circle" 
                        size={35} 
                        color={colors.color_palette_1.lineArt_Purple}
                        />
                    </TouchableOpacity>
                   </View>

                    <View style={styles.dateTimeContainer}>
                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => [setShowTimePickerApertura(false), setShowDatePickerApertura(true)]}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                        <Text style={styles.dateButtonText}>{formatDate(tareaFechaApertura)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => [setShowDatePickerApertura(false), setShowTimePickerApertura(true)]}
                    >
                        <Ionicons name="time-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                        <Text style={styles.dateButtonText}>{formatTime(tareaFechaApertura)}</Text>
                    </TouchableOpacity>
                    </View>


                    {showDatePickerApertura && (
                    <DateTimePicker
                    style={[styles.input_datepicker, {color: '#000'}]}
                        value={tareaFechaApertura}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeDateApertura}
                    />
                    )}

                    {showTimePickerApertura && (
                    <DateTimePicker
                        style={styles.input_datepicker}
                        value={tareaFechaApertura}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeTimeApertura}
                    />
                    )}
                </View>
                <View style={{marginBottom: 20}}>
                    <View style={global.aside}>
                        <Text style={styles.sectionTitle}>Fecha y Hora de Entrega</Text>
                        <TouchableOpacity onPress={() => [setShowDatePickerEntrega(false), setShowTimePickerEntrega(false)]}>
                            <Ionicons 
                            name="arrow-up-circle" 
                            size={35} 
                            color={colors.color_palette_1.lineArt_Purple}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dateTimeContainer}>
                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => [setShowTimePickerEntrega(false), setShowDatePickerEntrega(true)]}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                        <Text style={styles.dateButtonText}>{formatDate(tareaFechaEntrega)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => [setShowDatePickerEntrega(false), setShowTimePickerEntrega(true)]}
                    >
                        <Ionicons name="time-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                        <Text style={styles.dateButtonText}>{formatTime(tareaFechaEntrega)}</Text>
                    </TouchableOpacity>
                    </View>


                    {showDatePickerEntrega && (
                    <DateTimePicker
                    style={[styles.input_datepicker, {color: "#000000ff",}]}
                        value={tareaFechaEntrega}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeDateEntrega}
                    />
                    )}

                    {showTimePickerEntrega && (
                    <DateTimePicker
                        style={styles.input_datepicker}
                        value={tareaFechaEntrega}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeTimeEntrega}
                    />
                    )}
                </View>

                <View style={[global.aside, global.spaceBetweenObjects]}>
                    <View>
                        <Text style={styles.sectionTitle}>Estado</Text>
                        <Picker style={[styles.input_aside_picker, {height:250}]} selectedValue={tareaEstado} onValueChange={setTareaEstado} itemStyle={{color:'#000'}}>
                            <Picker.Item label="Select" value="" />
                            <Picker.Item label="En Proceso" value="En Proceso" />
                            <Picker.Item label="Completado" value="Completado" />
                        </Picker>
                    </View>

                    <View style={{left: 3}}>
                        <View>
                            <Text style={styles.sectionTitle}>Periodo</Text>
                            <TextInput style={styles.input_aside} placeholder="Periodo" value={tareaPeriodo} onChangeText={setTareaPeriodo} keyboardType="numeric" />
                        </View>

                        <Text style={styles.sectionTitle}>Parcial</Text>
                        <TextInput style={[styles.input_aside, {right:2}]} placeholder="Parcial" value={tareaParcial} onChangeText={setTareaParcial} keyboardType="numeric" />

                        <View>
                            <Text style={styles.sectionTitle}>Semana</Text>
                            <TextInput style={[styles.input_aside, {right:2}]} placeholder="Semana" value={tareaSemana} onChangeText={setTareaSemana} keyboardType="numeric" />    
                        </View>
                    </View>
                </View>

                <View style={{top:20}}>
                    <View style={{top:15, marginBottom:20}}>
                        <Text style={styles.sectionTitle}>Valor de la Tarea</Text>
                        <TextInput 
                        style={styles.input} 
                        placeholder="URL de Imagen" 
                        value={tareaValor} 
                        onChangeText={setTareaValor} 
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                        />
                    </View>

                    <View style={{top:15, marginBottom:20}}>
                        <Text style={styles.sectionTitle}>Valor de la Tarea Completada</Text>
                        <TextInput 
                        style={styles.input} 
                        placeholder="Valor Final" 
                        value={tareaValorFinal} 
                        onChangeText={setTareaValorFinal} 
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                        />
                    </View>

                    <View style={{top:15, marginBottom:20}}>
                        <Text style={styles.sectionTitle}>Titulo del Documento</Text>
                        <TextInput 
                        style={styles.input} 
                        placeholder="Titulo del docuemnto" 
                        placeholderTextColor="#aaa"
                        value={tareaDocumentoTitulo} 
                        onChangeText={setTareaDocumentTitulo} 
                        />
                    </View>

                    <View style={{top:15, marginBottom:20}}>
                        <Text style={styles.sectionTitle}>URL del Documento</Text>
                        <TextInput 
                        style={styles.input} 
                        placeholder="URL del Documento"
                        placeholderTextColor="#aaa"
                        value={tareaDocumentoUrl} 
                        onChangeText={setTareaDocumentUrl} 
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Comentario de retroalimentación</Text>
                    <TextInput
                    value={tareaComentario}
                    onChangeText={setTareaComentario}
                    placeholder="Comentario de retroalimentación"
                    style={[styles.input, styles.textarea, styles.description]}
                    placeholderTextColor="#aaa"
                    multiline
                    />
                </View>

                <View >
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                    onPress={onClose}
                    style={[styles.button, styles.cancelButton]}
                    disabled={loading}
                    >
                    <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    onPress={handleUpdate}
                    style={[styles.button, styles.saveButton]}
                    disabled={loading}
                    >
                    <Text style={styles.saveText}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Text>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 5,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  content:{
    marginTop: 20,
    padding: 20
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
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
    paddingTop: 50,
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
  
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
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
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
