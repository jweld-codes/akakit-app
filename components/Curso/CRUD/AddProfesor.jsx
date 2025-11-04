import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from "../../../config/firebaseConfig";
import colors from "../../../constants/colors";
import container from "../../../constants/container";
import global from "../../../constants/global";
import ios_utils_screen from '../../../constants/ios/ios_utils_screen';

export default function AddProfesor() {
    const [professorId, setProfessorId] = useState(1);
    const[profFullName, setProfFullName] = useState("");
    const[profEmail, setProfEmail] = useState("");
    const[profRating, setProfRating] = useState("");

    useEffect(() =>{
        const fetchData = async () => {
            const q = query(collection(db, "idDocentesCollection"), orderBy("docente_id", "desc"), limit(1));
            const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                const lastprofessor = snapshot.docs[0].data();
                setProfessorId(lastprofessor.docente_id + 1);
                }
        };
        fetchData();
    }, []);

    const handleAddProfessor = async () => {
        if (!profFullName || !profEmail || !profRating) {
            Alert.alert("Error", "Por favor llena todos los campos obligatorios");
            return;
        }

        try{
            await addDoc(collection(db, "idDocentesCollection"), {
                docente_id: professorId,
                docente_fullName: profFullName,
                docente_nota_personal: "N/A",
                email: profEmail,
                rating: profRating
            });

            Alert.alert("✅ Docente agregado", "El docente fue guardado correctamente");
            resetForm();

        } catch (error) {
            console.error("❌ Error al guardar el profesor:", error);
            Alert.alert("Error", "No se pudo guardar el docente");
        }

    };

    const resetForm = () => {
        setProfFullName("");
        setProfEmail("");
        setProfRating("");
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
            }}>
                Add New Professor
            </Text>
            <Text style={{color:'#c9c6c6ff'}}>Pofessor Id to be created: {professorId}</Text>
        </View>

             {/* Form */}

            <View style={{
                padding:10,
                bottom:100
            }}>
            <View>
                <Text style={styles.subtitle}>Profesor Name</Text>
                <TextInput style={styles.input} placeholder="Nombre Completo del Docente" value={profFullName} onChangeText={setProfFullName} />
            </View>

            <View>
                <Text style={styles.subtitle}>Profesor Email</Text>
                <View style={global.notSpaceBetweenObjects}>
                    <TextInput
                    style={[styles.input_aside, {marginRight: 5, width:240,height:3, top:4}]}
                    placeholder="Correo del Docente"
                    value={profEmail}
                    onChangeText={setProfEmail}
                    keyboardType="numeric"
                />
                <Text>@usap.edu</Text>

                </View>
            </View>

            <View>
                <Text style={styles.subtitle}>Profesor Rating</Text>
                <TextInput style={styles.input} placeholder="Calificación del Docente" value={profRating} onChangeText={setProfRating} keyboardType="numeric" />
            </View>

            <View>
                <Button title="Guardar Docente" onPress={handleAddProfessor} />
            </View>
                
            </View>
        </View>


    </ScrollView>
  )
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
