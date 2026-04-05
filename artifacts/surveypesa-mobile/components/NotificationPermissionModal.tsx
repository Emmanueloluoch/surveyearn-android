import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

const NOTIF_ENABLED_KEY = "surveypesa_notif_enabled";
const NOTIF_OPEN_COUNT_KEY = "surveypesa_app_open_count";

const BENEFITS = [
  { emoji: "💰", text: "Withdrawal confirmations" },
  { emoji: "📊", text: "New high-paying surveys" },
  { emoji: "🎁", text: "Referral rewards" },
  { emoji: "🔒", text: "Important security alerts" },
];

export default function NotificationPermissionModal() {
  const colors = useColors();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const enabled = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      if (enabled === "true") return;

      const raw = await AsyncStorage.getItem(NOTIF_OPEN_COUNT_KEY);
      const count = (parseInt(raw ?? "0", 10) || 0) + 1;
      await AsyncStorage.setItem(NOTIF_OPEN_COUNT_KEY, String(count));

      if (count % 2 === 1) setVisible(true);
    })();
  }, []);

  const dismiss = () => setVisible(false);

  const enable = async () => {
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "true");
    setVisible(false);
    await Notifications.requestPermissionsAsync();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: 20,
      padding: 28,
      width: "100%",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: "#111827",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: "#6B7280",
      textAlign: "left",
      alignSelf: "flex-start",
      marginBottom: 14,
    },
    benefitsList: {
      alignSelf: "stretch",
      marginBottom: 24,
      gap: 10,
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    benefitEmoji: {
      fontSize: 18,
      width: 26,
    },
    benefitText: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: "#374151",
      flex: 1,
    },
    buttonRow: {
      flexDirection: "row",
      alignSelf: "stretch",
      gap: 12,
      alignItems: "center",
    },
    notNowBtn: {
      flex: 1,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    notNowText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.primary,
    },
    enableBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    enableText: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: "#ffffff",
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Feather name="bell" size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>Stay Updated with SurveyPesa KE</Text>
          <Text style={styles.subtitle}>Get instant notifications for:</Text>

          <View style={styles.benefitsList}>
            {BENEFITS.map((b) => (
              <View key={b.text} style={styles.benefitRow}>
                <Text style={styles.benefitEmoji}>{b.emoji}</Text>
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.notNowBtn} onPress={dismiss}>
              <Text style={styles.notNowText}>Not Now</Text>
            </Pressable>
            <Pressable style={styles.enableBtn} onPress={enable}>
              <Feather name="bell" size={16} color="#ffffff" />
              <Text style={styles.enableText}>Enable</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
