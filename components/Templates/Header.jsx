import colors from "@/constants/colors";
import global from "@/constants/global";
import { USER_METADATA } from "@/constants/metadata/user_data";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {
  const user = USER_METADATA[0];

  return (
    <View style={styles.container}>

      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        paddingRight: 30,
        paddingTop: 30 
      }}>
        <View style={global.aside}>
          <Link href="/(extras)/settings" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="settings-outline" size={24} color={colors.color_palette_2.pink_soft} />
            </TouchableOpacity>
          </Link>

          <Link href="/(extras)/notificaciones" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={24} color={colors.color_palette_2.pink_soft} />
            </TouchableOpacity>
          </Link>

        </View>
        

      </View>
      
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginLeft: 40,
      }}>
        
        <Image source={require('../../assets/images/icons/icon_512_dashboard_white.png')} style={styles.white_icon_dashboard} />
        <Text style={styles.headerTitle}>Welcome, {user.firstName}!</Text>
      </View>
      <Text style={{borderStyle:'', marginLeft:95, marginTop: 2, color: '#ffff', fontFamily: 'poppins-regular', fontSize: 15}}>{user.accountNumber}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.color_palette_1.lineArt_Purple,
    width: 'auto',
    height: 165,
  },

  headerTitle: {
    marginLeft: 9, color: '#ffff', fontFamily: 'poppins-bold', fontSize: 25
  },
  
    white_icon_dashboard: {
        width:45,
        height:45,
        top:15
    },
})

const topbarheader = StyleSheet.create({
  bell_icon_dashboard: {
        width:35,
        height:35,
    },
})