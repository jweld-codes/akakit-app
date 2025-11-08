import container from '@/constants/container';
import { Ionicons } from "@expo/vector-icons";
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import global from '@/constants/global';
import { useOverviewData } from '../../context/OverviewDataContext';
import { getClassesData } from "../../services/GetTodayAndUpcomingClasses";
import { getUpcomingEvents } from '../../services/GetUpcomingEvents';
import SliderTasks from '../Home/SliderTasks';
import ClassTodayCard from '../Templates/ClassTodayCard';
import ClassUpcomingCard from '../Templates/ClassUpcomingCard';
import EventCard from '../Templates/EventCards';
import QuickActionsCards_OverviewTabs from "../Templates/QuickActionsButtons/QuickActionsCards_OverviewTabs";

const screenWidth = Dimensions.get("window").width;

export default function Overview() {
  const [todayClasses, setTodayClasses] = useState([]);
  const [ongoingClass, setOngoingClass] = useState(null);
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { todayClasses, upcomingClass, ongoingClass } = await getClassesData();
      setTodayClasses(todayClasses);
      setUpcomingClass(upcomingClass);
      setOngoingClass(ongoingClass);
    };
    fetchData();
  }, []);

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
    tasksCompleted,
    tasksInProgress,
    totalTasks,
    tasksValueMetadata,
    promedioGeneral,
    promediosPorPeriodo,
    promediosPorClase,
    enrolledClase,
    finishedClase,
    totalClasses,
    getTasksPieData,
    getClassesPieData,
    loading,
    lastUpdate,
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
      <View style={styles.mainLoadingContainer}>
        <ActivityIndicator size="large" color="#782170" />
        <Text style={styles.mainLoadingText}>Cargando información académica...</Text>
      </View>
    );
  }

  return (
    <View style={container.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#782170"
            colors={["#FFC000"]}
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickActionsCards_OverviewTabs />
        </View>

        {/* Hero Stats - Promedios */}
        <View style={styles.heroStatsContainer}>
          <View style={[styles.heroStatCard,  global.centerObjects]}>
            <View style={[styles.heroStatIcon]}>
              <Ionicons name="trophy" size={28} color="#FFC000" />
            </View>
            <View style={[styles.heroStatContent, global.textCenterObjects]}>
              <Text style={[styles.heroStatLabel, global.textCenterObjects]}>Promedio de Graduación</Text>
              <Text style={styles.heroStatValue}>{promedioGeneral}%</Text>
              <Text style={styles.heroStatSubtext}>Actualizado</Text>
            </View>
          </View>

          {Object.entries(promediosPorPeriodo).map(([periodo, data]) => (
            <View key={periodo} style={[styles.heroStatCard,  global.centerObjects]}>
              <View style={[styles.heroStatIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="calendar" size={28} color="#2196F3" />
              </View>
              <View style={[styles.heroStatContent, global.textCenterObjects]}>
                <Text style={[styles.heroStatLabel, global.textCenterObjects]}>Promedio del Periodo Actual</Text>
                <Text style={styles.heroStatValue}>{data.porcentaje}%</Text>
                <Text style={styles.heroStatSubtext}>Actualizado</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Clase Próxima o En Curso */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="stopwatch" size={24} color="#782170" />
              <Text style={styles.sectionTitle}>
                {ongoingClass ? 'Clase en Curso' : 'Próxima Clase'}
              </Text>
            </View>
            {ongoingClass && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN VIVO</Text>
              </View>
            )}
          </View>

          <ScrollView
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {ongoingClass ? (
              <ClassUpcomingCard clase={ongoingClass} subtitle="En Curso" />
            ) : upcomingClass ? (
              <ClassUpcomingCard clase={upcomingClass} subtitle="Próxima" />
            ) : todayClasses.length > 0 ? (
              <View style={styles.emptyStateInline}>
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                <Text style={styles.emptyStateTitle}>¡Buen trabajo!</Text>
                <Text style={styles.emptyStateText}>
                  Finalizaste las clases del día
                </Text>
              </View>
            ) : (
              <View style={styles.emptyStateInline}>
                <Ionicons name="moon" size={48} color="#9C27B0" />
                <Text style={styles.emptyStateTitle}>Día libre</Text>
                <Text style={styles.emptyStateText}>
                  No hay clases programadas hoy
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Clases de Hoy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="book" size={24} color="#782170" />
              <Text style={styles.sectionTitle}>Clases de Hoy</Text>
            </View>
            <Link href="/(tabs)/clase" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver Todas</Text>
                <Ionicons name="chevron-forward" size={16} color="#782170" />
              </TouchableOpacity>
            </Link>
          </View>

          {todayClasses.length > 0 ? (
            <>
              <View style={styles.classCountBadge}>
                <Text style={styles.classCountText}>
                  {todayClasses.length} {todayClasses.length === 1 ? 'clase' : 'clases'} programadas
                </Text>
              </View>
              <ScrollView
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {todayClasses.map((cls) => (
                  <ClassTodayCard key={cls.id} clase={cls} />
                ))}
              </ScrollView>
            </>
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyCardText}>No hay clases programadas hoy</Text>
            </View>
          )}
        </View>

        {/* Tareas Pendientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="bookmark" size={24} color="#782170" />
              <Text style={styles.sectionTitle}>Tareas Pendientes</Text>
            </View>
            <Link href="/(tabs)/tareas" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver Todas</Text>
                <Ionicons name="chevron-forward" size={16} color="#782170" />
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <SliderTasks />
          </ScrollView>
        </View>

        {/* Estadísticas - Resumen de Tareas */}
        <View style={[styles.section, {paddingHorizontal: 6}]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="stats-chart" size={24} color="#782170" />
              <Text style={styles.sectionTitle}>Resumen de Tareas</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statBadge}>
                <Ionicons name="checkbox" size={16} color="#4CAF50" />
                <Text style={styles.statBadgeText}>
                  {tasksCompleted} Completadas
                </Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time" size={16} color="#FF9800" />
                <Text style={[styles.statBadgeText, { color: '#E65100' }]}>
                  {tasksInProgress} En Proceso
                </Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="list" size={16} color="#2196F3" />
                <Text style={[styles.statBadgeText, { color: '#0D47A1' }]}>
                  {totalTasks} Total
                </Text>
              </View>
            </View>

            <PieChart
              data={getTasksPieData()}
              width={screenWidth - 80}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>

        {/* Estadísticas - Resumen de Clases */}
        <View style={[styles.section, {paddingHorizontal: 6}]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="school" size={24} color="#782170" />
              <Text style={styles.sectionTitle}>Resumen de Clases</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statBadge, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="hourglass" size={16} color="#FF9800" />
                <Text style={[styles.statBadgeText, { color: '#E65100' }]}>
                  {totalClasses} Pendientes
                </Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="play-circle" size={16} color="#2196F3" />
                <Text style={[styles.statBadgeText, { color: '#0D47A1' }]}>
                  {enrolledClase} En Curso
                </Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.statBadgeText}>
                  {finishedClase} Cursadas
                </Text>
              </View>
            </View>

            <PieChart
              data={getClassesPieData()}
              width={screenWidth - 60}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>

        {/* Próximos Eventos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="calendar" size={24} color="#782170" />
              <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={loadEventsRefresh}
                style={styles.refreshButton}
              >
                <Ionicons name="refresh" size={20} color="#782170" />
              </TouchableOpacity>
              <Link href="/(tabs)/calendario" asChild>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>Ver Todo</Text>
                  <Ionicons name="chevron-forward" size={16} color="#782170" />
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {loadingEvents ? (
            <View style={styles.loadingEventsContainer}>
              <ActivityIndicator size="small" color="#782170" />
              <Text style={styles.loadingEventsText}>Cargando eventos...</Text>
            </View>
          ) : upcomingEvents.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Ionicons name="calendar-clear-outline" size={48} color="#ccc" />
              <Text style={styles.emptyCardText}>No hay eventos próximos</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {upcomingEvents.map(evento => (
                <EventCard key={evento.id} evento={evento} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  mainLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'poppins-regular',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  heroStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroStatContent: {
    gap: 4,
  },
  heroStatLabel: {
    fontFamily: 'poppins-medium',
    fontSize: 12,
    color: '#666',
  },
  heroStatValue: {
    fontFamily: 'poppins-bold',
    fontSize: 28,
    color: '#1a1a1a',
  },
  heroStatSubtext: {
    fontFamily: 'poppins-regular',
    fontSize: 11,
    color: '#999',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: '#1a1a1a',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontFamily: 'poppins-medium',
    fontSize: 14,
    color: '#782170',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  liveText: {
    fontFamily: 'poppins-bold',
    fontSize: 11,
    color: '#C62828',
    letterSpacing: 0.5,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  classCountBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  classCountText: {
    fontFamily: 'poppins-medium',
    fontSize: 12,
    color: '#6A1B9A',
  },
  emptyStateInline: {
    width: screenWidth - 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyCardText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: 350
  },
  statsHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statBadgeText: {
    fontFamily: 'poppins-medium',
    fontSize: 12,
    color: '#2E7D32',
  },
  loadingEventsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    gap: 12,
  },
  loadingEventsText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: '#666',
  },
  bottomSpacer: {
    height: 250,
  },
});