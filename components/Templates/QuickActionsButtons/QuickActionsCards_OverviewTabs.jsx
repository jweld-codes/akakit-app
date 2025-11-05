import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import colors from '../../../constants/colors';

const { width } = Dimensions.get("window");
  const QUICK_ACTIONS = [
    {
      icon: "add-circle-outline",
      label: "Crea Un \nNuevo Evento",
      route: "/QADir/Eventos/AddEventScreen",
      color: colors.color_palette_1.lineArt_Purple,
      gradient: [colors.color_palette_2.pink_darker, "#7d2e5dff"],
    },

    {
      icon: "calendar-outline",
      label: "Vista del \nCalendario",
      route: "/(tabs)/calendario",
      color: "#1976D2",
      gradient: ["#2196F3", colors.color_palette_2.lineArt_Blue],
    },
    {
      icon: "time-outline",
      label: "Flujograma\nDe la Carrera",
      route: "",
      color: "#C2185B",
      gradient: ["#cb1ee9ff", colors.color_palette_1.lineArt_Purple],
    },
    {
      icon: "add-circle-outline",
      label: "Crea Una\nNueva Tarea",
      route: "/QADir/Tareas/AddTaskScreen",
      color: "#E64A19",
      gradient: ["#E64A19", colors.color_palette_1.orange_darker],
    },
  ];

export default function QuickActionsCards_OverviewTabs() {
const router = useRouter();

  return (
   <View>
      <View style={styles.content}>
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionButton}
                onPress={() => router.push(action.route)}
              >
                <LinearGradient colors={action.gradient} style={styles.actionGradient}>
                  <View style={styles.actionContent}>
                    <View style={styles.actionIcon}>
                      <Ionicons name={action.icon} size={28} color="white" />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  quickActionsContainer: {
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 15,
  },
  actionButton: {
    width: (width - 82) / 2,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionGradient: {
    flex: 1,
    padding: 15,
  },
  actionContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  seeAllButton: {
    color: "#2E7D32",
    fontWeight: "600",
  },
})