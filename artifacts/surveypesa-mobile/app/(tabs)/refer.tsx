import { useGetUser } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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
  const router = useRouter();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: userData } = useGetUser(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });

  const referralCode =
    userData?.referralCode ?? user?.referralCode ?? "Loading...";
  const REFERRAL_REWARD = 200;

  const shareMessage = `Join SurveyEarn and earn money by completing surveys! Use my referral code ${referralCode} when you sign up. Download now and start earning KSh today.`;

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
      paddingTop: topPad + 8,
      paddingHorizontal: 16,
      paddingBottom: 4,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: colors.foreground,
      marginBottom: 2,
    },
    headerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 12,
    },

    rewardCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    rewardIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    rewardLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      marginBottom: 2,
    },
    rewardAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 34,
      color: "#ffffff",
      lineHeight: 40,
    },
    rewardNote: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
      marginTop: 2,
    },

    body: {
      padding: 16,
      paddingBottom: bottomPad,
      gap: 12,
    },
    sectionTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 8,
    },

    codeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    codeLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    codeBox: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 14,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    code: {
      fontFamily: "Inter_700Bold",
      fontSize: 32,
      color: colors.primary,
      letterSpacing: 4,
    },
    copyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: copied ? colors.muted : colors.secondary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 20,
    },
    copyText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: copied ? colors.mutedForeground : colors.primary,
    },

    howCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    howStep: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    howStepBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    howStepNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      color: "#ffffff",
    },
    howStepText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.foreground,
      flex: 1,
    },

    referralsCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    referralsCount: {
      fontFamily: "Inter_700Bold",
      fontSize: 36,
      color: colors.foreground,
      marginBottom: 4,
    },
    referralsLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    referralsNote: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 4,
    },

    quickActionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionBtn: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    withdrawActionBtn: {
      backgroundColor: colors.primary,
    },
    earnActionBtn: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    withdrawActionText: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: "#ffffff",
    },
    earnActionText: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.primary,
    },

    shareBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    shareText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 0 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎁 Referral Program</Text>
        <Text style={styles.headerSub}>
          Earn KSh {REFERRAL_REWARD} for every friend who signs up and activates.
        </Text>

        <View style={styles.rewardCard}>
          <View style={styles.rewardIconCircle}>
            <Text style={{ fontSize: 26 }}>💸</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rewardLabel}>You earn per referral</Text>
            <Text style={styles.rewardAmount}>KSh {REFERRAL_REWARD}</Text>
            <Text style={styles.rewardNote}>Paid instantly when your friend activates</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{referralCode}</Text>
          </View>
          <Pressable style={styles.copyBtn} onPress={handleCopy}>
            <Feather
              name={copied ? "check" : "copy"}
              size={16}
              color={copied ? colors.mutedForeground : colors.primary}
            />
            <Text style={styles.copyText}>{copied ? "Copied!" : "Copy Code"}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.howCard}>
          {[
            { step: "1", text: "Share your code with friends" },
            { step: "2", text: "Friend signs up using your code" },
            { step: "3", text: "Friend activates their account (KSh 150)" },
            { step: "4", text: `You instantly earn KSh ${REFERRAL_REWARD} to your balance` },
          ].map(({ step, text }) => (
            <View key={step} style={styles.howStep}>
              <View style={styles.howStepBadge}>
                <Text style={styles.howStepNum}>{step}</Text>
              </View>
              <Text style={styles.howStepText}>{text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Your Referrals</Text>
        <View style={styles.referralsCard}>
          <Text style={styles.referralsCount}>0</Text>
          <Text style={styles.referralsLabel}>Friends referred so far</Text>
          <Text style={styles.referralsNote}>
            Earn KSh {REFERRAL_REWARD} for each one
          </Text>
        </View>

        <View style={styles.quickActionsRow}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.withdrawActionBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/(tabs)/wallet")}
          >
            <Feather name="credit-card" size={15} color="#ffffff" />
            <Text style={styles.withdrawActionText}>Withdraw</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.earnActionBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Feather name="trending-up" size={15} color={colors.primary} />
            <Text style={styles.earnActionText}>Earn More</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleShare}
        >
          <Feather name="share-2" size={18} color="#ffffff" />
          <Text style={styles.shareText}>Share &amp; Earn KSh {REFERRAL_REWARD}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
