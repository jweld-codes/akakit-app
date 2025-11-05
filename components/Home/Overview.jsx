import colors from '@/constants/colors';
import container from '@/constants/container';
import sectionheader from '@/constants/ios/sectionheader';
import statspie from '@/constants/ios/statspie';
import { Ionicons } from "@expo/vector-icons";

import { getClassesData } from "../../services/GetTodayAndUpcomingClasses";
import { getUpcomingEvents } from '../../services/GetUpcomingEvents';
import SliderTasks from '../Home/SliderTasks';
import ClassTodayCard from '../Templates/ClassTodayCard';
import ClassUpcomingCard from '../Templates/ClassUpcomingCard';
import EventCard from '../Templates/EventCards';

import global from '@/constants/global';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useOverviewData } from '../../context/OverviewDataContext';
import QuickActionsCards_OverviewTabs from "../Templates/QuickActionsButtons/QuickActionsCards_OverviewTabs";


const screenWidth = Dimensions.get("window").width;

export default function Overview() {
  

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

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
    
    const loadEventsRefresh = async () => {
      setLoadingEvents(true);
      const refreshDataEvents = await getUpcomingEvents(10);
      setUpcomingEvents(refreshDataEvents);
      setLoadingEvents(false);
    };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      const events = await getUpcomingEvents(10);
      setUpcomingEvents(events);
      setLoadingEvents(false);
    };

    fetchEvents();
  }, []);

  const {
    // Datos de tareas
    tasksCompleted,
    tasksInProgress,
    totalTasks,

    // Datos de valores tareas
    tasksValueMetadata,
    promedioGeneral,
    promediosPorPeriodo,
    promediosPorClase,
    
    // Datos de clases
    enrolledClase,
    finishedClase,
    totalClasses,
    
    // Datos para gráficos
    getTasksPieData,
    getClassesPieData,
    
    // Estado
    loading,
    lastUpdate,
    
    // Acciones
    refreshData,
  } = useOverviewData();

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

  return (
    <View style={container.container}>
      <ScrollView
        refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={"#782170"}
          colors={"#FFC000"}
          />
        }>
          {/*<View style={{ padding: 20 }}>
           Información de última actualización 
          {lastUpdate && (
            <Text style={{ fontSize: 12, color: '#666'}}>
              Última actualización: {new Date(lastUpdate).toLocaleString()}
            </Text>
          )}
          </View>*/}

          {/* Botón de prueba temporal 
          <View style={{ padding: 20, gap: 10 }}>
            <Button title="Notificación Inmediata" onPress={handleTestNotification} />
            <Button title="Programar Notificación (+1 min)" onPress={handleScheduledNotification} />
          </View>*/}

          <View>
            <QuickActionsCards_OverviewTabs />
          </View>


        {/* Todays and Upcoming Classes */}
          <View>
            <View>
              {/* Upcoming Class - Próxima clase (cuando NO hay clases hoy) */}
              <View style={sectionheader.headerRow}>
                <View style={sectionheader.headerrow_twotexts_onelink}>
                  <Ionicons name="stopwatch-outline" size={28} color="black" />
                  <Text style={{
                    fontFamily: 'poppins-semibold',
                    fontSize: 16,
                    color: colors.color_palette_4.lineArt_grey
                  }}>Clase Próxima</Text>
                </View>
              </View>

              <ScrollView
                horizontal 
                showsHorizontalScrollIndicator={false}
              >
                  {ongoingClass ? (
                  <ClassUpcomingCard clase={ongoingClass} subtitle="En Curso" />
                  ) : upcomingClass ? (
                  <ClassUpcomingCard clase={upcomingClass} subtitle="Próxima" />
                  ) : todayClasses.length > 0 ? (
                  <Text style={{ fontSize: 16, color: "#777" }}>
                      ✅ ¡Finalizaste las clases del día de hoy!
                  </Text>
                  ) : (
                  <Text style={{ fontSize: 16, color: "#777" }}>
                    💤 No hay clases programadas hoy
                  </Text>
                  )}
              </ScrollView>
            </View>
            
            <View style={{marginTop: 20}}>
              <View>
                {/* Today's Class - Clases del día de hoy */}
                <View style={sectionheader.headerRow}>
                  <View style={sectionheader.headerrow_twotexts_onelink}>
                    <Ionicons name="book-outline" size={28} color="black" />
                    <Text style={{
                      left: 10,
                      fontFamily: 'poppins-semibold',
                      fontSize: 16,
                      color: colors.color_palette_4.lineArt_grey
                  }}>Clases de Hoy</Text>
                  </View>
                  <Link href="/(tabs)/clase" style={sectionheader.linkButton}>
                    <Text style={sectionheader.linkText}>Ver Todos</Text>
                  </Link>
                </View>
              </View>
              <ScrollView
              horizontal 
              showsHorizontalScrollIndicator={false}
              >
                {todayClasses.length > 0 ? (
                  todayClasses.map((cls) => (
                    <ClassTodayCard key={cls.id} clase={cls} />
                  ))
                ) : (
                  <Text style={{ fontSize: 16, color: "#777" }}>
                    💤 No hay clases hoy
                  </Text>
                )}

              </ScrollView>
            </View>
          </View>

          <View style={{marginTop: 20}}>
            <View style={sectionheader.headerRow}>
              <Ionicons name="bookmark-outline" size={28} color="black" />
              <Text style={sectionheader.title}>Tareas Pendientes</Text>
              <Link href="/(tabs)/tareas" style={sectionheader.linkButton}>
                <Text style={sectionheader.linkText}>Ver Todas</Text>
              </Link>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              >
              <SliderTasks />
            </ScrollView>
          </View>

        {/* Estadisticas */}
        <View>
          
          <View style={{marginTop: 20}}>
            
            <View style={sectionheader.headerRow}>
              <View style={sectionheader.headerrow_twotexts_onelink}>
                <Ionicons name="analytics-outline" size={28} color="black" />
                <Text style={[sectionheader.title, {left: 5}]}>Estadística</Text>
              </View>
              <Link href="/QADir/Tareas/AddTaskScreen" style={sectionheader.linkButton}>
                <Text style={sectionheader.linkText}>Ver Todo</Text>
              </Link>
            </View>


              <View style={global.aside}>
                <View style={[statspie.statCard,global.centerObjects,{bottom:20, width: 160, height:180, padding:10}]}>
                <Text style={[statspie.statTitle, global.centerObjects]}>Course Average</Text>
                <Text style={[statspie.statNumber,global.centerObjects, {margin:5} ]}>{promedioGeneral}</Text>
                <Text style={[statspie.statSubtitle,global.centerObjects ]}>Last Period Updated</Text>
              </View>

              <View style={[statspie.statCard, global.centerObjects, {bottom:20, width: 160, height:178, paddingTop:20}]}>
                <Text style={[statspie.statTitle, global.centerObjects]}>Last Period Average</Text>
                
                {Object.entries(promediosPorPeriodo).map(([periodo, data]) => (
                  <View key={periodo}>
                    <Text style={[statspie.statNumber,global.centerObjects, {margin:6} ]}>{data.porcentaje}</Text>
                    <Text style={[statspie.statSubtitle,global.centerObjects ]}>Last Period Updated{data.periodo}</Text>
                  </View>
                ))}
                
              </View>

            </View>
          </View>

          <View>
            <View style={sectionheader.headerRow}>
              <View style={sectionheader.headerrow_twotexts_onelink}>
                <Text style={{
                  fontFamily: 'poppins-semibold',
                  fontSize: 16,
                  color: colors.color_palette_4.lineArt_grey
                }}>Resumen de </Text>
                <Text style={[sectionheader.title, {left: 5}]}>Tareas</Text>
              </View>
              
            </View>

              <View style={{ marginBottom: 30 , backgroundColor: "#eaeaeaff", margin:5, borderRadius: 10, paddingTop: 20, shadowColor:'#6f6f6fff', shadowRadius: 8, shadowOpacity: 0.5}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View>
                    <Text>Total: {totalTasks}</Text>
                  </View>
                  <View>
                    <Text>Completadas: {tasksCompleted}</Text>
                  </View>
                  <View>
                    <Text>En Proceso: {tasksInProgress}</Text>
                  </View>
                </View>

                {/* Gráfico de tareas */}
                <PieChart
                  data={getTasksPieData()}
                  width={300}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              </View>
          </View>

          <View>
            {/* Sección de Clases */}
            <View style={sectionheader.headerRow}>
              <View style={sectionheader.headerrow_twotexts_onelink}>
                <Text style={{
                  fontFamily: 'poppins-semibold',
                  fontSize: 16,
                  color: colors.color_palette_4.lineArt_grey
                }}>Resumen de </Text>
                <Text style={[sectionheader.title, {left: 5}]}>Clases</Text>
              </View>
            </View>

            <View style={{ marginBottom: 30 , backgroundColor: "#eaeaeaff", margin:5, borderRadius: 10, paddingTop: 20, shadowColor:'#6f6f6fff', shadowRadius: 8, shadowOpacity: 0.5}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View>
                  <Text>Pendientes: {totalClasses}</Text>
                </View>
                <View>
                  <Text>En Curso: {enrolledClase}</Text>
                </View>
                <View>
                  <Text>Cursadas: {finishedClase}</Text>
                </View>
              </View>

              {/* Gráfico de clases */}
              <PieChart
                data={getClassesPieData()}
                width={300}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
              />
            </View>
          </View>

          <View>
            <View>
            <View style={sectionheader.headerRow}>
              <View style={[global.notSpaceBetweenObjects, {marginBottom:8}]}>
              <TouchableOpacity onPress={loadEventsRefresh}>
                <Ionicons name="refresh" size={28} color={colors.color_palette_1.lineArt_Purple} />
              </TouchableOpacity>
            </View>
              <Text style={sectionheader.title}>Próximos Eventos</Text>
              <Link href="/(tabs)/calendario" style={sectionheader.linkButton}>
                <Text style={sectionheader.linkText}>Ver Todo</Text>
              </Link>
            </View>
          </View>

          <ScrollView>
            {/* ... */}
            {loading ? (
              <ActivityIndicator size="small" color={colors.color_palette_1.lineArt_Purple} style={{ marginVertical: 20 }} />
              ) : upcomingEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="videocam-off-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No hay eventos próximos.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {upcomingEvents.map(evento => (
                  <EventCard key={evento.id} evento={evento} />
                ))}
              </ScrollView>
            )}
          </ScrollView>
          </View>
          
        <View style={{marginBottom: 240}}></View>

        </View>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  eventsContainer: {
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginHorizontal: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
});

