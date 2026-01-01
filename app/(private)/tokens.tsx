import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQueue } from "../../src/context/QueueContext";

export default function TokensScreen() {
  const router = useRouter();
  const { activeToken, queueStatus, leaveQueue, isConnected } = useQueue();

  const handleLeaveQueue = () => {
    Alert.alert(
      "Leave Queue",
      "Are you sure you want to leave? You'll lose your position.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: leaveQueue },
      ]
    );
  };

  // Empty State
  if (!activeToken) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="ticket-outline" size={40} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>No Active Token</Text>
        <Text style={styles.emptySubtitle}>
          You're not in any queue right now
        </Text>
        <TouchableOpacity
          style={styles.findBtn}
          onPress={() => router.push("/(private)/map")}
        >
          <Text style={styles.findBtnText}>Find Clinics</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const peopleAhead = queueStatus
    ? Math.max(0, activeToken.tokenNumber - queueStatus.currentTokenNo - 1)
    : 0;

  const isYourTurn = activeToken.status === "CALLED";

  return (
    <View style={styles.container}>
      {/* Connection Status */}
      <View style={styles.connectionRow}>
        <View
          style={[
            styles.connectionDot,
            { backgroundColor: isConnected ? "#10B981" : "#EF4444" },
          ]}
        />
        <Text style={styles.connectionText}>
          {isConnected ? "Live" : "Connecting..."}
        </Text>
      </View>

      {/* Token Card */}
      <View style={styles.tokenCard}>
        {/* Status */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isYourTurn ? "#10B981" : "#0165FC" },
          ]}
        >
          <Ionicons
            name={isYourTurn ? "checkmark-circle" : "time"}
            size={14}
            color="white"
          />
          <Text style={styles.statusText}>
            {isYourTurn ? "Your Turn!" : "Waiting"}
          </Text>
        </View>

        {/* Token Number */}
        <Text style={styles.tokenLabel}>Your Token</Text>
        <View
          style={[
            styles.tokenCircle,
            { backgroundColor: isYourTurn ? "#10B981" : "#0165FC" },
          ]}
        >
          <Text style={styles.tokenNumber}>{activeToken.tokenNumber}</Text>
        </View>

        {/* Queue Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Now Serving</Text>
            <Text style={styles.infoValue}>
              {queueStatus?.currentTokenNo || "-"}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ahead</Text>
            <Text style={styles.infoValue}>{peopleAhead}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Est. Wait</Text>
            <Text style={styles.infoValue}>~{peopleAhead * 5} min</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  ((queueStatus?.currentTokenNo || 0) /
                    activeToken.tokenNumber) *
                    100
                )}%`,
                backgroundColor: isYourTurn ? "#10B981" : "#0165FC",
              },
            ]}
          />
        </View>
      </View>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Ionicons name="information-circle" size={18} color="#0165FC" />
        <Text style={styles.tipText}>
          Stay nearby. We'll notify you when it's your turn.
        </Text>
      </View>

      {/* Leave Button */}
      <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveQueue}>
        <Text style={styles.leaveBtnText}>Leave Queue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#FAFBFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  findBtn: {
    backgroundColor: "#0165FC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  findBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: "#64748B",
  },
  tokenCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginBottom: 20,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  tokenLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
  },
  tokenCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  tokenNumber: {
    fontSize: 40,
    fontWeight: "700",
    color: "white",
  },
  infoRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  infoDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#F0F7FF",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
  },
  leaveBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  leaveBtnText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
});
