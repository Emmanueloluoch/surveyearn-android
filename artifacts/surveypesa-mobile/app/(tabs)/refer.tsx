import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ReferScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user
    ? `SP${String(user.userId).padStart(4, "0")}`
    : "SP0000";

  const shareMessage = `Join SurveyPesa KE and earn money by completing surveys! Use my referral code ${referralCode} when you sign up. Download now and start earning KSh today.`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: shareMessage });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // share cancelled
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 12,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: "#ffffff",
      marginBottom: 8,
    },
    headerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: "rgba(255,255,255,0.65)",
    },
    body: {
      padding: 20,
      paddingBottom: bottomPad,
    },
    codeCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    codeLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    code: {
      fontFamily: "Inter_700Bold",
      fontSize: 36,
      color: colors.primary,
      letterSpacing: 6,
      marginBottom: 16,
    },
    copyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: copied ? colors.muted : colors.secondary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    copyText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: copied ? colors.mutedForeground : colors.primary,
    },
    shareBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 24,
    },
    shareText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },
    howCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
    },
    howTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 14,
    },
    step: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 14,
    },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#ffffff",
    },
    stepText: {
      flex: 1,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 20,
    },
    rewardNote: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 16,
      lineHeight: 18,
    },
  });

  const steps = [
    "Share your referral code with friends and family",
    "They sign up on SurveyPesa KE using your code",
    "When they complete their first survey, you both earn bonus KSh",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <Text style={styles.headerSub}>
          Invite friends and earn bonus rewards together
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <Text style={styles.code}>{referralCode}</Text>
            <Pressable style={styles.copyBtn} onPress={handleCopy}>
              <Feather
                name={copied ? "check" : "copy"}
                size={16}
                color={copied ? colors.mutedForeground : colors.primary}
              />
              <Text style={styles.copyText}>{copied ? "Copied!" : "Copy Code"}</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleShare}
          >
            <Feather name="share-2" size={18} color="#ffffff" />
            <Text style={styles.shareText}>Share with Friends</Text>
          </Pressable>

          <View style={styles.howCard}>
            <Text style={styles.howTitle}>How Referrals Work</Text>
            {steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.rewardNote}>
            Referral bonuses are credited once your friend completes their first survey.
            Terms apply.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
