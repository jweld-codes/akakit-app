// components/Clases/AddClass.jsx
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { db } from "../../../config/firebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import colors from "../../../constants/colors";
import container from "../../../constants/container";
import global from "../../../constants/global";
import ios_utils_screen from '../../../constants/ios/ios_utils_screen';

export default function AddClass() {
  const [classId, setClassId] = useState(1);
  const [classCodigo, setClassCodigo] = useState("");

  const [classPeriod, setClassPeriod] = useState("");
  const [classYear, setClassYear] = useState("");

  const [classIdDocente, setClassIdDocente] = useState("");
  const [classCredit, setClassCredit] = useState("");
  const [claseModality, setClaseModality] = useState("");

  const [claseName, setClaseName] = useState("");
  const [classNotasPersonales, setClassNotasPersonales] = useState("");
  const [classFecha, setClassFecha] = useState("");
  const [classHorario, setClassHorario] = useState("");
  const [classEnrollment, setClassEnrollment] = useState("");
  const [classSection, setClassSection] = useState("");
  const [classType, setClassType] = useState("");
  const [classUrl, setClassUrl] = useState("");

  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "idClaseCollection"), orderBy("clase_id", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lastClass = snapshot.docs[0].data();
        setClassId(lastClass.clase_id + 1);
      }

      // Obtener 
      
      const docentesSnapshot = await getDocs(collection(db, "idDocentesCollection"));
      const docentesList = docentesSnapshot.docs.map(doc => doc.data());
      setDocentes(docentesList);
      //console.log(docentesList);
    };

    fetchData();
  }, []);

  // Guardar la clase
  const handleAddClass = async () => {
    if (!claseName || !classCodigo || !classCredit || !claseModality || !classFecha || !classHorario) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios");
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
        class_days: classFecha,
        class_hours: classHorario,
        class_promedio: 0,
        class_section: classSection || "N/A",
        class_type: classType,
        class_url_access: classUrl || "N/A",
        class_enrollment: classEnrollment || "En Curso",
        class_estado: "Activo",
        createdAt: new Date(),
      });

      Alert.alert("✅ Clase agregada", "La clase fue guardada correctamente");
      resetForm();
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
  };

  const router = useRouter();
  
  return (
    <ScrollView stickyHeaderIndices={[0]}>
    <View style={ios_utils_screen.utils_tabs_black}><Text>.</Text></View>
    
    <View style={container.container}>
        <View style={[global.notSpaceBetweenObjects, {top:20, marginBottom:40}]}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/clase')}>
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
             }}>Create       New Class</Text>
            <Text style={{color:'#c9c6c6ff'}}>Class Id to be created: {classId}</Text>
        </View>

        {/* Form */}
        <View style={{padding: 10, bottom:100}}>
            
            <View>
                <Text style={styles.subtitle}>Class Name</Text>
                <TextInput style={styles.input} placeholder="Nombre de la clase" value={claseName} onChangeText={setClaseName} />
            </View>

            <View>
                <View style={[global.aside, global.spaceBetweenObjects]}>
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

            <View style={{top:40}}>
                <View style={[global.aside, global.spaceBetweenObjects]}>
                    <View>
                        <Text style={styles.subtitle}>Class Days</Text>
                        <TextInput style={styles.input_aside} placeholder="Días" value={classFecha} onChangeText={setClassFecha} />
                    </View>

                    <View style={{left: 20}}>
                        <Text style={styles.subtitle}>Class Hours</Text>
                        <TextInput style={[styles.input_aside, {right:2}]} placeholder="Horario" value={classHorario} onChangeText={setClassHorario} />
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

            <View style={{top:60}}>
                 {/* 👨‍🏫 Picker de docente */}
                 <View style={global.aside}>
                    <Text style={styles.subtitle}>Choose Professor</Text>
                    
                    <TouchableOpacity onPress={() => router.push("/QADir/Professors/AddProfessorScreen")}>
                      <Ionicons name="add-circle-sharp" size={35} color={colors.color_palette_1.lineArt_Purple} />
                    </TouchableOpacity>
                 </View>
                <Picker selectedValue={classIdDocente} onValueChange={setClassIdDocente} itemStyle={styles.input_picker} style={{bottom:80}}>
                    <Picker.Item label="Selecciona un docente" value="" />
                    {docentes.map((doc) => (
                    <Picker.Item key={doc.docente_id} label={doc.docente_fullName} value={doc.docente_id} />
                    ))}
                </Picker>

                <View
                style={{
                    height:50,
                    backgroundColor:'rgba(153, 213, 255, 1)',
                    top:40,
                    marginBottom:50,
                    borderRadius:15,
                    alignItems:'center',
                    paddingTop:5
                }}>
                    <Button title="Guardar clase" onPress={handleAddClass} />
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
});
