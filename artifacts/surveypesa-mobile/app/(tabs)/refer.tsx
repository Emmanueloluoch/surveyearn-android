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

  const referralCode = user?.referralCode ?? "XXXXXXXX";

  const REFERRAL_REWARD = 200;

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
      paddingBottom: 24,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: "#ffffff",
    },
    headerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
      marginTop: 6,
    },
    body: {
      padding: 20,
      paddingBottom: bottomPad,
      gap: 16,
    },
    codeCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 24,
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
    sectionTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 12,
    },
    quickActionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    actionBtnIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${colors.primary}18`,
      alignItems: "center",
      justifyContent: "center",
    },
    actionBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.primary,
    },
    progressCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressMeta: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    progressMetaBold: {
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    progressTrack: {
      height: 8,
      backgroundColor: colors.muted,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    progressFooterText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    referralsCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 20 }}>🎁</Text>
          </View>
          <Text style={styles.headerTitle}>Referral Program</Text>
        </View>
        <Text style={styles.headerSub}>
          Earn <Text style={{ fontFamily: "Inter_700Bold", color: "#ffffff" }}>KSh {REFERRAL_REWARD}</Text> for every friend who signs up and activates
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>

          {/* REWARD BANNER */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 18,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: `${colors.primary}15`,
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ fontSize: 30 }}>💸</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, marginBottom: 2 }}>
                You earn per referral
              </Text>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 36, color: colors.primary, lineHeight: 40 }}>
                KSh {REFERRAL_REWARD}
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                Paid instantly when your friend activates
              </Text>
            </View>
          </View>

          {/* REFERRAL CODE */}
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

          {/* HOW IT WORKS */}
          <View style={{
            backgroundColor: colors.muted,
            borderRadius: 14,
            padding: 16,
            gap: 12,
          }}>
            <Text style={styles.sectionTitle}>How it works</Text>
            {[
              { step: "1", text: `Share your code with friends` },
              { step: "2", text: `Friend signs up using your code` },
              { step: "3", text: `Friend activates their account (KSh 150)` },
              { step: "4", text: `You instantly earn KSh ${REFERRAL_REWARD} to your balance` },
            ].map(({ step, text }) => (
              <View key={step} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color: "#ffffff" }}>{step}</Text>
                </View>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground, flex: 1 }}>{text}</Text>
              </View>
            ))}
          </View>

          {/* YOUR REFERRALS */}
          <View>
            <Text style={styles.sectionTitle}>Your Referrals</Text>
            <View style={styles.referralsCard}>
              <Text style={styles.referralsCount}>0</Text>
              <Text style={styles.referralsLabel}>Friends referred so far</Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, marginTop: 4 }}>
                Earn KSh {REFERRAL_REWARD} for each one
              </Text>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.quickActionsRow}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push("/(tabs)/wallet")}
            >
              <View style={styles.actionBtnIcon}>
                <Feather name="arrow-down-circle" size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionBtnText}>Withdraw</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push("/(tabs)")}
            >
              <View style={styles.actionBtnIcon}>
                <Feather name="trending-up" size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionBtnText}>Earn More</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.shareBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleShare}
          >
            <Feather name="share-2" size={18} color="#ffffff" />
            <Text style={styles.shareText}>Share & Earn KSh {REFERRAL_REWARD}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
