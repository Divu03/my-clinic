import { useQueue } from "@/src/context/QueueContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../src/context/AuthContext";

// ============================================
// MAIN COMPONENT
// ============================================
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { callNextTocken } = useQueue();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{user?.firstName || "Guest"}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-circle" size={40} color="#0165FC" />
          </TouchableOpacity>
        </View>
      </View>
      {
        //Activate Queue
        //Request Form
      }
      <Button title="Start Queue" onPress={callNextTocken} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: "#FAFBFC",
  },
  listLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  listLoadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: "#64748B",
  },
  fixedHeader: {
    paddingHorizontal: 16,
    backgroundColor: "#FAFBFC",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  greeting: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  profileBtn: {
    padding: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1E293B",
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  filterStatus: {
    marginBottom: 12,
  },
  filterStatusText: {
    fontSize: 12,
    color: "#64748B",
  },
  filterList: {
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#0165FC",
    borderColor: "#0165FC",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  filterTextActive: {
    color: "white",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  mapLink: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0165FC",
  },
  clinicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  clinicAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  clinicMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 4,
  },
  distanceContainer: {
    alignItems: "flex-end",
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0165FC",
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: "#0165FC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
