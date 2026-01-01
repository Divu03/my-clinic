import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQueue } from "../../../src/context/QueueContext";
import { Clinic } from "../../../src/models/types";
import { ClinicService } from "../../../src/services/clinicService";

export default function ClinicDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    generateTokenForClinic,
    activeToken,
    isLoading: queueLoading,
  } = useQueue();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      if (!id) return;
      try {
        const data = await ClinicService.getClinicById(id);
        setClinic(data);
      } catch (error) {
        console.error("Failed to fetch clinic:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [id]);

  const handleJoinQueue = async () => {
    if (activeToken) {
      Alert.alert(
        "Already in Queue",
        "Leave your current queue before joining a new one.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View Queue",
            onPress: () => router.push("/(private)/tokens"),
          },
        ]
      );
      return;
    }

    if (!clinic) return;

    try {
      setJoining(true);
      await generateTokenForClinic(clinic.id);
      Alert.alert("Success!", "You've joined the queue.", [
        { text: "View Token", onPress: () => router.push("/(private)/tokens") },
      ]);
    } catch (error: any) {
      Alert.alert("Failed", error.message || "Unable to join queue");
    } finally {
      setJoining(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "DENTIST":
        return "#10B981";
      case "PEDIATRICS":
        return "#F59E0B";
      case "DERMATOLOGY":
        return "#EC4899";
      default:
        return "#0165FC";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0165FC" />
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#CBD5E1" />
        <Text style={styles.errorTitle}>Clinic Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const color = getTypeColor(clinic.type);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: color }]}>
          {clinic.logo ? (
            <Image source={{ uri: clinic.logo }} style={styles.heroImage} />
          ) : (
            <Ionicons name="medical" size={48} color="white" />
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <View style={[styles.typeBadge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.typeBadgeText, { color }]}>
              {clinic.type.replace("_", " ")}
            </Text>
          </View>
          <Text style={styles.clinicName}>{clinic.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= 4 ? "star" : "star-outline"}
                size={14}
                color="#F59E0B"
              />
            ))}
            <Text style={styles.ratingText}>4.8 (124)</Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={18} color="#64748B" />
              <Text style={styles.infoLabel}>Hours</Text>
              <Text style={styles.infoValue}>
                {clinic.openingHours.start} - {clinic.openingHours.end}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={18} color="#64748B" />
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>
                {clinic.distance_km
                  ? `${clinic.distance_km.toFixed(1)} km`
                  : "Nearby"}
              </Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.addressText}>
              {clinic.address || "Address not available"}
            </Text>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>
              {clinic.description ||
                "Quality healthcare services with experienced professionals."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Est. Wait</Text>
          <Text style={styles.footerValue}>~15 min</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.joinBtn,
            (joining || queueLoading) && styles.joinBtnDisabled,
          ]}
          onPress={handleJoinQueue}
          disabled={joining || queueLoading}
        >
          {joining || queueLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="ticket" size={18} color="white" />
              <Text style={styles.joinBtnText}>Join Queue</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 12,
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#0165FC",
    borderRadius: 8,
  },
  backBtnText: {
    color: "white",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerBackBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  clinicName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#64748B",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#64748B",
  },
  descriptionText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerInfo: {
    marginRight: 16,
  },
  footerLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },
  footerValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  joinBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0165FC",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  joinBtnDisabled: {
    opacity: 0.7,
  },
  joinBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
