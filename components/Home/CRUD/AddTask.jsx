// components/Clases/AddTask.jsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";
import container from "../../../constants/container";
import global from "../../../constants/global";
import ios_utils_screen from '../../../constants/ios/ios_utils_screen';

export default function AddTask() {
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
     // console.log(claseList);
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
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={ios_utils_screen.utils_tabs_black}><Text>.</Text></View>
      
      <View style={container.container}>
        <View style={[global.notSpaceBetweenObjects, {top:20, marginBottom:40}]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
            <Ionicons name="arrow-back-circle-outline" size={35} color={colors.color_palette_1.lineArt_Purple} />
          </TouchableOpacity>

          <Text style={{
            fontSize: 20,
            fontFamily: 'poppings-regular',
            color:colors.color_palette_1.lineArt_Purple
          }}> Go back </Text>
        </View>

        <View style={{
          marginBottom:120,
          borderBottomWidth:1,
          borderColor: '#c9c6c6ff'
        }}>
          <Text style={{
            fontFamily: 'poppins-bold',
            fontSize: 50
          }}>Create New Task</Text>
          <Text style={{color:'#c9c6c6ff'}}>Event Id to be created: {tareaId}</Text>
        </View>

        {/* Form */}
        <View style={{padding: 10, bottom:100}}>
          
          <View>
            <Text style={styles.subtitle}>Titulo de la Tarea</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nombre de la tarea" 
              value={tareaTitulo} 
              onChangeText={setTareaTitulo} 
            />
          </View>
          
          <View style={{marginBottom:20}}>
                <View>
                  <Text style={styles.subtitle}>Descripcion</Text>
                  <TextInput 
                    style={[styles.input, {height: 150}]} 
                    placeholder="Descripcion de la tarea" 
                    value={tareaDescripcion} 
                    onChangeText={setTareaDescripcion} 
                  />
                </View>
              </View>

          {/* SELECTOR DE FECHA Y HORA */}
          <View style={{marginBottom: 20}}>
            <View style={global.aside}>
                <Text style={styles.subtitle}>Fecha y Hora de Apertura</Text>
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
                <Text style={styles.subtitle}>Fecha y Hora de Entrega</Text>
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
                <Text style={styles.subtitle}>Estado</Text>
                <Picker style={[styles.input_aside_picker, {height:250}]} selectedValue={tareaEstado} onValueChange={setTareaEstado} itemStyle={{color:'#000'}}>
                    <Picker.Item label="Select" value="" />
                    <Picker.Item label="En Proceso" value="En Proceso" />
                    <Picker.Item label="Completado" value="Completado" />
                </Picker>
            </View>

            <View style={{left: 20}}>
                <View>
                    <Text style={styles.subtitle}>Periodo</Text>
                    <TextInput style={styles.input_aside} placeholder="Periodo" value={tareaPeriodo} onChangeText={setTareaPeriodo} keyboardType="numeric" />
                </View>

                <Text style={styles.subtitle}>Parcial</Text>
                <TextInput style={[styles.input_aside, {right:2}]} placeholder="Parcial" value={tareaParcial} onChangeText={setTareaParcial} keyboardType="numeric" />

                <View>
                    <Text style={styles.subtitle}>Semana</Text>
                    <TextInput style={[styles.input_aside, {right:2}]} placeholder="Semana" value={tareaSemana} onChangeText={setTareaSemana} keyboardType="numeric" />    
                </View>
            </View>
        </View>          

          <View style={{top:40}}>
            <View style={{top:15, marginBottom:20}}>
              <Text style={styles.subtitle}>Valor de la Tarea</Text>
              <TextInput 
                style={styles.input} 
                placeholder="URL de Imagen" 
                value={tareaValor} 
                onChangeText={setTareaValor} 
                keyboardType="numeric"
              />
            </View>

            <View style={{top:15, marginBottom:20}}>
              <Text style={styles.subtitle}>Valor de la Tarea Completada</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Valor Final" 
                value={tareaValorFinal} 
                onChangeText={setTareaValorFinal} 
                keyboardType="numeric"
              />
            </View>

          </View>

          <View style={{top:60}}>
            <View style={global.aside}>
              <Text style={styles.subtitle}>Selecciona Clase</Text>
              
              <TouchableOpacity onPress={() => router.push("/QADir/Clases/AddClassScreen")}>
                <Ionicons name="add-circle-sharp" size={35} color={colors.color_palette_1.lineArt_Purple} />
              </TouchableOpacity>
            </View>
            <Picker 
              selectedValue={tareaClaseId} 
              onValueChange={setTareaClaseId} 
              itemStyle={styles.input_picker} 
              style={{bottom:80}}
            >
              <Picker.Item label="Selecciona una Clase" value="N/A" />
              {clase.map((doc, index) => (
                <Picker.Item key={index} label={doc.class_name} value={doc.id || doc.clase_id} />
              ))}
            </Picker>

            <View style={{
              height:50,
              backgroundColor:'rgba(153, 213, 255, 1)',
              top:40,
              marginBottom:50,
              borderRadius:15,
              alignItems:'center',
              paddingTop:5
            }}>
              <Button title="Guardar Tarea" onPress={handleAddTarea} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 10, color: "#555" },
  
  input: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  input_aside: {
    width:150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  input_aside_picker: {
    width:150,
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
});