// components/Clases/AddClass.jsx
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
import { scheduleMultipleReminders } from '../../../services/NotificationService';

export default function AddClass() {
  const [eventoId, setEventoId] = useState(1);
  const [eventoClaseId, setEventoClaseId] = useState(0);

  const [eventoDescripcion, setEventoDescripcion] = useState("");
  const [eventoFecha, setEventoFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [eventoEstado, setEventoEstado] = useState("");
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

      // Obtener clases
      const claseSnapshot = await getDocs(collection(db, "idClaseCollection"));
      const claseList = claseSnapshot.docs.map(doc => doc.data());
      setClase(claseList);
     // console.log(claseList);
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

  const handleAddEvento = async () => {
    if (!eventoTitulo || !eventoFecha) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios");
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

      // Recordatorios: 1 día antes, 1 hora antes, 30 min antes
      await scheduleMultipleReminders(eventoConId, 'event', [24 * 60, 60, 20]);

      Alert.alert("✅ Evento agregado", "El evento fue guardado con recordatorios");
      resetForm();
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      Alert.alert("Error", "No se pudo guardar el evento");
    }
  };

  const resetForm = () => {
    setEventoAssist("");
    setEventoClaseId("");
    setEventoDescripcion("");
    setEventoEstado("");
    setEventoFecha(new Date());
    setEventoId(eventoId + 1);
    setEventoImg("");
    setEventoLugar("");
    setEventoPuntos(0);
    setEventoTipo("");
    setEventoTitulo("");
    setEventoUrl("");
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
          }}>Create New Event</Text>
          <Text style={{color:'#c9c6c6ff'}}>Event Id to be created: {eventoId}</Text>
        </View>

        {/* Form */}
        <View style={{padding: 10, bottom:100}}>
          
          <View>
            <Text style={styles.subtitle}>Event Title</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nombre del evento" 
              value={eventoTitulo} 
              onChangeText={setEventoTitulo} 
            />
          </View>
          
          <View style={{marginBottom:20}}>
                <View>
                  <Text style={styles.subtitle}>Descripcion</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Descripcion de la Clase" 
                    value={eventoDescripcion} 
                    onChangeText={setEventoDescripcion} 
                  />
                </View>
              </View>

          {/* SELECTOR DE FECHA Y HORA */}
          <View style={{marginBottom: 20}}>
            <View style={global.aside}>
                <Text style={styles.subtitle}>Fecha y Hora</Text>
                <TouchableOpacity onPress={() => [setShowDatePicker(false), setShowTimePicker(false)]}>
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
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                <Text style={styles.dateButtonText}>{formatDate(eventoFecha)}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.color_palette_1.lineArt_Purple} />
                <Text style={styles.dateButtonText}>{formatTime(eventoFecha)}</Text>
              </TouchableOpacity>
            </View>


            {showDatePicker && (
              <DateTimePicker
              style={styles.input_datepicker}
                value={eventoFecha}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeDate}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                style={styles.input_datepicker}
                value={eventoFecha}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeTime}
              />
            )}
          </View>
          


          <View>
            <View>
              <View>
                <Text style={[styles.subtitle, { top:20, fontSize: 18}]}>Modality</Text>
                <Picker 
                  style={[styles.input_picker, {height:200, top:10}]} 
                  selectedValue={eventoLugar} 
                  onValueChange={setEventoLugar} 
                  itemStyle={{color:'#000'}}
                >
                  <Picker.Item label="Select" value="" />
                  <Picker.Item label="Virtual" value="Virtual" />
                  <Picker.Item label="Presencial" value="Presencial" />
                  <Picker.Item label="Hibrida" value="Hibrida" />
                </Picker>
              </View>
            </View>
          </View>
          

          <View style={{top:40}}>
            <View>
              <Text style={styles.subtitle}>Tipo de Evento:</Text>
              <Picker 
                style={{bottom:80}} 
                selectedValue={eventoTipo} 
                onValueChange={setEventoTipo} 
                itemStyle={styles.input_picker}
              >
                <Picker.Item label="Select Type" value="" />
                <Picker.Item label="Webinar" value="Webinar" />
                <Picker.Item label="Taller" value="Taller" />
                <Picker.Item label="Salida a Empresa" value="Salida" />
              </Picker>
            </View>

            <View style={{top:15, marginBottom:20}}>
              <Text style={styles.subtitle}>URL de la Imagen</Text>
              <TextInput 
                style={styles.input} 
                placeholder="URL de Imagen" 
                value={eventoImg} 
                onChangeText={setEventoImg} 
              />
            </View>

            <View style={{top:15, marginBottom:20}}>
              <Text style={styles.subtitle}>URL de la Sala Virtual</Text>
              <TextInput 
                style={styles.input} 
                placeholder="URL de Acceso" 
                value={eventoUrl} 
                onChangeText={setEventoUrl} 
              />
            </View>
          </View>

          <View style={{top:60}}>
            <View style={global.aside}>
              <Text style={styles.subtitle}>Proviene de una Clase?</Text>
              
              <TouchableOpacity onPress={() => router.push("/QADir/Professors/AddProfessorScreen")}>
                <Ionicons name="add-circle-sharp" size={35} color={colors.color_palette_1.lineArt_Purple} />
              </TouchableOpacity>
            </View>
            <Picker 
              selectedValue={eventoClaseId} 
              onValueChange={setEventoClaseId} 
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
              <Button title="Guardar Evento" onPress={handleAddEvento} />
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
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: '#000'
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