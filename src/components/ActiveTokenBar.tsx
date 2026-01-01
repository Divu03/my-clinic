import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQueue } from "../context/QueueContext";

export const ActiveTokenBar = () => {
  const { activeToken, queueStatus, isConnected } = useQueue();
  const router = useRouter();

  if (!activeToken) return null;

  const isYourTurn = activeToken.status === "CALLED";

  return (
    <TouchableOpacity
      style={[styles.container, isYourTurn && styles.containerActive]}
      onPress={() => router.push("/(private)/tokens")}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <View style={styles.tokenBadge}>
          <Ionicons
            name={isYourTurn ? "checkmark" : "ticket"}
            size={16}
            color={isYourTurn ? "#10B981" : "#0165FC"}
          />
        </View>
        <View>
          <Text style={styles.tokenLabel}>
            {isYourTurn ? "Your Turn!" : "Your Token"}
          </Text>
          <Text style={styles.tokenNumber}>#{activeToken.tokenNumber}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.currentText}>
          Now: {queueStatus?.currentTokenNo || "-"}
        </Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? "#10B981" : "#EF4444" },
          ]}
        />
        <Ionicons name="chevron-forward" size={18} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0165FC",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  containerActive: {
    backgroundColor: "#10B981",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  tokenLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
  tokenNumber: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currentText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default ActiveTokenBar;
