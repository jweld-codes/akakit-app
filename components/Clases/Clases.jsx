// components/Clases/Clases.jsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Link } from 'expo-router';

import { ProgressBar } from 'react-native-paper';
import colors from '../../constants/colors';
import container from '../../constants/container';
import global from "../../constants/global";
import cards from "../../constants/ios/cards";
import sectionheader from '../../constants/ios/sectionheader';
import { useOverviewData } from '../../context/OverviewDataContext';
import { getClassById } from "../../services/GetClassById";
import { getClassDocumentCollection } from "../../services/GetClassDocumentCollection";
import { getCursoById } from "../../services/GetCursoById";
import { getDocenteById } from "../../services/GetDocenteById";
import { getClassesData } from "../../services/GetTodayAndUpcomingClasses";
import QuickActionsCards_ClassTabs from "../Templates/QuickActionsButtons/QuickActionsCards_ClassTab";



export default function Clases({onModalPress}) {
 const [docentes, setDocentes] = useState({});
 const [curso, setCurso] = useState({});
  const [classe, setClase] = useState([]);
  const [classIdModal, setClassIdModal] = useState('');

  useEffect(() => {
    const fetchClase = async () => {
      const claseList = await getClassDocumentCollection("idClaseCollection");
      
      const docentesTemp = {};
      const cursoTemp = {};
      const classIdTemp = {};


    for (const clase of claseList) {
      const docenteId = clase.class_id_docente?.trim?.();
      if (docenteId) {
        const docenteData = await getDocenteById(docenteId);
        if (docenteData) {
          docentesTemp[docenteId] = docenteData.docente_fullName;
        }
      }
    }
    for (const cursoid of claseList) {
      //console.log("Clases.jsx: clase encontrada ", cursoid)

      const cursoId = cursoid.class_id_curso?.trim?.();
      //console.log("Clases.jsx: clase encontrada ", cursoId)
      
      if (cursoId) {
        const cursoData = await getCursoById(cursoId);
        //console.log("Clases.jsx: cursoData ", cursoData)
        if (cursoData) {
          cursoTemp[cursoId] = cursoData.curso_id;
        }
      }
    }

    for(const claseid of claseList){
      const claseIdd = claseid.clase_id;
      if(claseIdd){
        const claseIdData = await getClassById(claseIdd);
        if (claseIdData) {
          classIdTemp[claseIdd] = claseIdData.clase_id;
        }

      }
    }

    //console.log(docentesTemp);
   // console.log(classIdTemp);

    setClassIdModal(classIdTemp)
    setClase(claseList);
    setCurso(cursoTemp);
    setDocentes(docentesTemp);
    setDocentes(docentesTemp);
    };
    fetchClase();
  }, []);

  
    const handleModalIdValue = (claseData) => {
    const classId = claseData.clase_id;
    //console.log(`Clase ID seleccionado: ${classId}`); // Debug

      if (onModalPress) {
        onModalPress(claseData.clase_id);
      }
    };

  const [todayClasses, setTodayClasses] = useState([]);
  const [ongoingClass, setOngoingClass] = useState(null);
  const [upcomingClass, setUpcomingClass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { todayClasses, upcomingClass, ongoingClass } = await getClassesData();
      setTodayClasses(todayClasses);
      setUpcomingClass(upcomingClass);
      setOngoingClass(ongoingClass);
    };

    fetchData();
  }, []);

  const {
    // Datos de valores tareas
    tasksValueMetadata,
    promedioGeneral,
    promediosPorPeriodo,
    promediosPorClase,
    
    // Datos de clases
    enrolledClase,
    finishedClase,
    totalClasses,

    // Estado
    loading,
    lastUpdate,
    
    // Acciones
    refreshData,
  } = useOverviewData();


  const getImageByClassType = (type) => {
  switch (type?.toLowerCase()) {
    case "general":
    case "general y complementaria":
      return require("../../assets/images/classes_bg/card_background/Generales.png");
    case "datos":
    case "ciencias de datos":
      return require("../../assets/images/classes_bg/card_background/Datos.png");
    case "exactas":
    case "ciencias exactas":
      return require("../../assets/images/classes_bg/card_background/Exactas.png");
    case "negocios":
      return require("../../assets/images/classes_bg/card_background/Negocios.png");
    case "programación":
      return require("../../assets/images/classes_bg/card_background/Programacion.png");
    default:
      return require("../../assets/images/classes_bg/card_background/Default.png");
  }
  };
  const { backgroundImage } = getImageByClassType(classe.class_type);

  const getColorsByClassType = (type) => {
    switch (type?.toLowerCase()) {
      case "general":
      case "general y complementaria":
        return {
          header: colors.color_palette_4.general_orange,
          background: "#faf1e6ff",
          color: colors.color_palette_1.orange_darker
        };
      case "datos":
      case "ciencias de datos":
        return {
          header: colors.color_palette_4.datos_blue,
          background: "#e6f8ffff",
          color: colors.color_palette_2.lineArt_Blue
        };
      case "exactas":
      case "ciencias exactas":
        return {
          header: colors.color_palette_4.exactas_pink,
          background: "#fbeee7ff",
          color: colors.color_palette_2.pink_darker
        };
      case "negocios":
        return {
          header: colors.color_palette_4.negocio_green,
          background: "#e6fadeff",
          color: colors.color_palette_1.orange_darker
        };
      case "programación":
        return {
          header: colors.color_palette_4.code_yellow,
          background: "#fffbe6ff",
          color: colors.color_palette_1.yellow_darker
        };
      default:
        return {
          header: "#a95656ff",
          background: "#f5f5f5",
          colors: '#bbaecdff'
        };
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (loading && !lastUpdate) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }


const { header, background, color } = getColorsByClassType(classe.class_type);
  return (
    <ScrollView
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={"#782170"}
          colors={"#FFC000"}
          />
        }
    >
      <View style={container.classes_container}>
        {/* Quick Actions Buttons */}
        <View style={sectionheader.headerRow}>
          <View style={sectionheader.headerrow_twotexts_onelink}>
            <Text style={{
              fontFamily: 'poppins-semibold',
              fontSize: 16,
              color: colors.color_palette_4.lineArt_grey
            }}>Quick Actions</Text>
          </View>
        </View>
          
        <QuickActionsCards_ClassTabs />

        <View>
          <View style={sectionheader.headerRow}>
            <View style={sectionheader.headerrow_twotexts_onelink}>
              <Text
                style={{
                  fontFamily: "poppins-semibold",
                  fontSize: 16,
                  color: colors.color_palette_4.lineArt_grey,
                }}
              >
                Enroll
              </Text>
              <Text style={[sectionheader.title, { left: 5 }]}>Classes</Text>
            </View>
            <Link href="/QADir/Clases/SeeAllClasesScreen" style={sectionheader.linkButton}>
              <Text style={sectionheader.linkText}>See All</Text>
            </Link>
          </View>
        </View>

        {/* Class Enrolled */}
        <View>
          <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}>
            {classe.map((clase) => {
              const { header, background } = getColorsByClassType(clase.class_type);
              const backgroundImage = getImageByClassType(clase.class_type);
              const claseStats = promediosPorClase[clase.clase_id];

              return (
                <View
                  key={clase.id}
                  style={[cards.card, {fontFamily: 'poppins-regular' , backgroundColor: background, marginBottom: 10, padding: 15, borderRadius: 12, marginRight:30},]}
                >
                  <View style={[cards.cardHeader, {backgroundColor:header}]}></View>
                  <View style={cards.cardHeaderImage}>
                    <Image
                        source={backgroundImage}
                        style={{
                          width: "100%",
                          height: 100,
                          borderRadius: 10,
                        }}
                        resizeMode="cover"
                      />
                  </View>

                  <Text style={{fontFamily: "poppins-semibold", fontSize: 20,marginBottom: 4,}}>
                    {clase.class_name}
                  </Text>
                  <View style={{marginBottom: 12}}>
                    <Text style={{ fontSize: 14, color: colors.color_palette_4.lineArt_grey }}>
                      {clase.class_codigo} SECCION {clase.class_section}
                    </Text>

                  </View>
                  <View style={{marginBottom: 12}}>
                    <Text style={{ fontSize: 14, marginBottom:20, color: colors.color_palette_4.lineArt_grey }}>
                      {docentes[clase.class_id_docente || "Sin asignar"]}
                    </Text>
                  </View>
                  
                  <Text style={[global.aside, { fontSize: 14, color: "#555" }]}>
                    {clase.class_days} {clase.class_hours}
                  </Text>

                  <Text style={{ fontSize: 14, color: "#555" }}>
                    Aula {clase.class_modality} {clase.class_credit} U.V
                  </Text>

                  {/* Barra de progreso específica de esta clase */}
                  {claseStats && (
                    <View style={{ marginTop: 10 }}>
                      <ProgressBar
                        progress={parseFloat(claseStats.promedio) / 100}
                        color="#4CAF50"
                        style={{ height: 10, borderRadius: 5 }}
                      />
                      <Text style={{ fontSize: 12, color: '#450a2aff', marginTop: 5 }}>{claseStats.promedio}%</Text>
                    </View>
                  )}

                  <TouchableOpacity onPress={() => handleModalIdValue(clase)} style={{backgroundColor: header ,height: 40, marginTop: 20}}>
                    <Text style={{
                      color: color, 
                      textAlign: 'center', 
                      justifyContent: 'center', 
                      top: 10,
                      fontWeight: 'bold'
                    }}>
                      Ir a Clase
                    </Text>
                  </TouchableOpacity>

                </View>
              );
            })}
          </ScrollView>
        </View>
        
        {/* End */}
      </View>
    </ScrollView>

    
    
  )
}
