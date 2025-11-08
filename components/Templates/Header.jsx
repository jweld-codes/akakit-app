import colors from "@/constants/colors";
import { USER_METADATA } from "@/constants/metadata/user_data";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {
  const user = USER_METADATA[0];

  return (
    <View style={styles.container}>
      {/* Gradient overlay for depth */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'transparent']}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Top bar with icons */}
      <View style={styles.topBar}>
        <View style={styles.iconContainer}>
          <Link href="/(extras)/settings" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.iconWrapper}>
                <Ionicons name="settings-outline" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(extras)/notificaciones" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.iconWrapper}>
                <Ionicons name="notifications-outline" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      
      {/* Main content area */}
      <View style={styles.mainContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../../assets/images/icons/icon_512_dashboard_white.png')} 
              style={styles.white_icon_dashboard} 
            />
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{user.firstName}!</Text>
          <View style={styles.accountBadge}>
            <Ionicons name="card-outline" size={14} color="rgba(255,255,255,0.9)" style={styles.cardIcon} />
            <Text style={styles.accountNumber}>{user.accountNumber}</Text>
          </View>
        </View>
      </View>
      
      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    width: 'auto',
    height: 210,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
    paddingTop: 35,
    zIndex: 10,
  },

  iconContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  menuItem: {
    marginLeft: 6,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 30,
    zIndex: 5,
  },

  logoContainer: {
    marginRight: 16,
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  white_icon_dashboard: {
    width: 36,
    height: 36,
  },

  textContainer: {
    flex: 1,
  },

  welcomeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'poppins-regular',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  headerTitle: {
    color: '#ffffff',
    fontFamily: 'poppins-bold',
    fontSize: 26,
    letterSpacing: 0.5,
    marginTop: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },

  cardIcon: {
    marginRight: 6,
  },

  accountNumber: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'poppins-regular',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // Decorative elements
  decorativeCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -40,
    right: -30,
  },

  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -20,
    left: -20,
  },
});