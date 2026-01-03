import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../src/context/AuthContext";

export default function StaffHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);

  // ============================================
  // LOGIC
  // ============================================
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  // Placeholder Data
  const placeholderClinic = {
    name: "Grand River Hospital",
    address: "835 King St W, Kitchener, ON",
    type: "GENERAL_PRACTICE",
  };

  const handleStartQueue = () => {
    Alert.alert(
      "Start Daily Queue",
      "This action will open the queue for patients to join.",
      [{ text: "Cancel", style: "cancel" }, { text: "Start Now" }]
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. GREETING HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <TouchableOpacity style={styles.profileBtn}>
            {user?.profilePicture && !imageError ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. MY WORKPLACE SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Workplace</Text>

          <View style={styles.clinicCard}>
            {/* Clinic Info Header */}
            <View style={styles.clinicHeader}>
              <View style={styles.clinicIconBox}>
                <Ionicons name="medkit" size={24} color="#0165FC" />
              </View>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{placeholderClinic.name}</Text>
                <Text style={styles.clinicAddress}>
                  {placeholderClinic.address}
                </Text>
                <View style={styles.clinicBadge}>
                  <Text style={styles.clinicBadgeText}>
                    {placeholderClinic.type.replace("_", " ")}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Action Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartQueue}
              activeOpacity={0.8}
            >
              <Ionicons name="play-circle" size={22} color="white" />
              <Text style={styles.actionButtonText}>Start Daily Queue</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  
  // HEADER STYLES
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "white",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0165FC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },

  // SECTION STYLES
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },

  // CLINIC CARD STYLES
  clinicCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  clinicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  clinicIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clinicName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  clinicAddress: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 8,
  },
  clinicBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clinicBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 20,
  },
  
  // BUTTON STYLES
  actionButton: {
    backgroundColor: "#0165FC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#0165FC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});