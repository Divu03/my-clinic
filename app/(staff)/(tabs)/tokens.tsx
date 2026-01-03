import { useQueue } from "@/src/context/QueueContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router"; // 1. Import useFocusEffect
import React, { useCallback } from "react"; // 2. Import useCallback
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../src/context/AuthContext";

export default function ManageQueueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // 3. Extract 'refreshActiveToken' (or your refresh function) from context
  const { callNextTocken, queueStatus, refreshActiveToken } = useQueue();

  // 4. Add this block to fetch data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshActiveToken(); 
      // If you have a specific function like 'fetchQueueStatus()' for staff, use that instead.
    }, [])
  );

  // 5. Read directly from queueStatus (No need for useState/useEffect)
  const currentServingNumber = queueStatus?.currentTokenNo || "--";
  const totalPatientsInQueue = 15; // Still a placeholder as requested

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.fixedHeader}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{user?.firstName || "Dr. Staff"}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-circle" size={40} color="#0165FC" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.controlCard}>
          
          <View style={styles.cardHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Counter</Text>
            </View>
          </View>

          <View style={styles.tokenDisplayContainer}>
            <Text style={styles.tokenLabel}>Now Serving</Text>
            <View style={styles.tokenCircle}>
              {/* 6. Display the variable directly */}
              <Text style={styles.tokenNumber}>{currentServingNumber}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callNextBtn}
            onPress={callNextTocken}
            activeOpacity={0.8}
          >
            <Ionicons name="megaphone-outline" size={24} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.callNextText}>Call Next Token</Text>
          </TouchableOpacity>

          <View style={styles.cardFooter}>
            <View style={styles.queueStatItem}>
              <Ionicons name="people" size={18} color="#64748B" />
              <Text style={styles.queueStatText}>
                Total Waiting: <Text style={styles.statHighlight}>{totalPatientsInQueue}</Text>
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  fixedHeader: {
    paddingHorizontal: 20,
    backgroundColor: "#FAFBFC",
    paddingBottom: 12,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  profileBtn: {
    padding: 4,
  },
  contentContainer: {
    padding: 20,
  },
  controlCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DEF7EC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  liveText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "600",
  },
  tokenDisplayContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  tokenLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  tokenCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#0165FC10",
  },
  tokenNumber: {
    fontSize: 64,
    fontWeight: "800",
    color: "#0165FC",
    letterSpacing: -2,
  },
  callNextBtn: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#0165FC",
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0165FC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  callNextText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cardFooter: {
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
  },
  queueStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  queueStatText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  statHighlight: {
    color: "#1E293B",
    fontWeight: "700",
  },
});