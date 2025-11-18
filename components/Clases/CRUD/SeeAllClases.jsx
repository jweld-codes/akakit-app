import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function SeeAllClases() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content"></StatusBar>
        <View>
          {/* Header */}
          <View style={styles.header}>
            <View>
              
            </View>
            <Text style={styles.headerTitle}>Todas las Clases</Text>
            
          </View>

        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'poppins-bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  eventsListContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
});