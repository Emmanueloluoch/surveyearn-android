import { useUpgradeToVip } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const TILL_NUMBER = "5403204";
const ACCOUNT_NAME = "EMMANUEL OLUOCH ODHIAMBO";
const VIP_AMOUNT = 500;
const VIP = "#7c3aed";
const VIP_DARK = "#5b21b6";
const VIP_LIGHT = "#f3e8ff";
const VIP_BORDER = "#e9d5ff";

export default function VipScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setVip } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [mpesaCode, setMpesaCode] = useState("");
  const [copiedTill, setCopiedTill] = useState(false);

  const { mutateAsync: upgradeToVip, isPending } = useUpgradeToVip();

  const handleCopyTill = async () => {
    await Clipboard.setStringAsync(TILL_NUMBER);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2000);
  };

  const handleVerify = async () => {
    const code = mpesaCode.trim();
    if (!code || code.length < 5) {
      Alert.alert("Incomplete", "Please paste your full M-Pesa confirmation SMS.");
      return;
    }
    if (!user) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await upgradeToVip({ id: user.userId, data: { mpesaCode: code } });
      setVip(result.points);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Try again.";
      Alert.alert("Verification Failed", msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      backgroundColor: colors.background,
      paddingTop: 12,
      paddingBottom: 4,
      paddingHorizontal: 16,
    },
    heroCard: {
      backgroundColor: VIP,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    headerIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: "#ffffff",
      marginBottom: 4,
    },
    headerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
    },

    body: {
      padding: 16,
      paddingBottom: insets.bottom + 32,
      gap: 12,
    },

    perksCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: VIP_BORDER,
      gap: 12,
    },
    perksTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 4,
    },
    perkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    perkDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: VIP_LIGHT,
      alignItems: "center",
      justifyContent: "center",
    },
    perkText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.foreground,
      flex: 1,
    },

    payCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    payHeader: {
      backgroundColor: VIP,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    payHeaderText: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: "#ffffff",
      flex: 1,
    },
    payHeaderBadge: {
      backgroundColor: VIP_DARK,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    payHeaderBadgeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 11,
      color: "#ffffff",
    },
    payBody: {
      padding: 18,
      gap: 14,
    },
    mpesaLogo: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#e30613",
    },
    mpesaSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    tillRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tillLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    tillValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 26,
      color: colors.foreground,
      letterSpacing: 2,
    },
    copyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: copiedTill ? colors.muted : VIP_LIGHT,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    copyBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: copiedTill ? colors.mutedForeground : VIP,
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    amountLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    amountValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: VIP,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    nameLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    nameValue: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.foreground,
    },
    note: {
      backgroundColor: "#faf5ff",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: VIP_BORDER,
    },
    noteText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "#6b21a8",
      lineHeight: 18,
    },
    nextBtn: {
      backgroundColor: VIP,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    nextBtnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },

    instrCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    stepTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
    },
    stepSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 4,
      marginBottom: 12,
    },
    instrRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    instrNum: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: VIP,
      alignItems: "center",
      justifyContent: "center",
    },
    instrNumText: {
      fontFamily: "Inter_700Bold",
      fontSize: 11,
      color: "#ffffff",
    },
    instrText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.foreground,
      flex: 1,
      lineHeight: 19,
    },
    inputCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.foreground,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.foreground,
      minHeight: 80,
      textAlignVertical: "top",
    },
    verifyBtn: {
      backgroundColor: VIP,
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    verifyBtnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.heroCard}>
            <View style={styles.headerIcon}>
              <Text style={{ fontSize: 28 }}>👑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>VIP Access</Text>
              <Text style={styles.headerSub}>Unlock unlimited surveys and earn more every day</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>

          {step === 1 && (
            <>
              <View style={styles.perksCard}>
                <Text style={styles.perksTitle}>👑 VIP Member Benefits</Text>
                <View style={styles.perkRow}>
                  <View style={styles.perkDot}>
                    <Feather name="unlock" size={14} color={VIP} />
                  </View>
                  <Text style={styles.perkText}>Unlimited access to all surveys — no daily cap</Text>
                </View>
                <View style={styles.perkRow}>
                  <View style={styles.perkDot}>
                    <Feather name="trending-up" size={14} color={VIP} />
                  </View>
                  <Text style={styles.perkText}>Earn from every single survey in the app</Text>
                </View>
                <View style={styles.perkRow}>
                  <View style={styles.perkDot}>
                    <Feather name="zap" size={14} color={VIP} />
                  </View>
                  <Text style={styles.perkText}>Priority access to new high-reward surveys</Text>
                </View>
                <View style={styles.perkRow}>
                  <View style={styles.perkDot}>
                    <Feather name="gift" size={14} color={VIP} />
                  </View>
                  <Text style={styles.perkText}>KSh 500 added to your balance after verification</Text>
                </View>
              </View>

              <View style={styles.payCard}>
                <View style={styles.payHeader}>
                  <Text style={styles.payHeaderText}>Payment Details</Text>
                  <View style={styles.payHeaderBadge}>
                    <Text style={styles.payHeaderBadgeText}>VIP</Text>
                  </View>
                </View>
                <View style={styles.payBody}>
                  <Text style={styles.mpesaLogo}>LIPA NA M•PESA</Text>
                  <Text style={[styles.mpesaSub, { marginBottom: 8 }]}>BUY GOODS TILL NUMBER</Text>

                  <View style={styles.tillRow}>
                    <View>
                      <Text style={styles.tillLabel}>Till Number</Text>
                      <Text style={styles.tillValue}>{TILL_NUMBER}</Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.copyBtn, { opacity: pressed ? 0.75 : 1 }]}
                      onPress={handleCopyTill}
                    >
                      <Feather name={copiedTill ? "check" : "copy"} size={13} color={copiedTill ? colors.mutedForeground : VIP} />
                      <Text style={styles.copyBtnText}>{copiedTill ? "Copied!" : "Copy"}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>KSh {VIP_AMOUNT}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.amountRow}>
                    <Text style={styles.nameLabel}>Till Name</Text>
                    <Text style={styles.nameValue}>{ACCOUNT_NAME}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.note}>
                <Text style={styles.noteText}>
                  Note: The KSh {VIP_AMOUNT} VIP fee will be added to your account balance after verification! Pay only to our official Till Number.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setStep(2)}
              >
                <Text style={styles.nextBtnText}>I've Paid — Verify Payment →</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.instrCard}>
                <Text style={styles.stepTitle}>Verify M-Pesa Payment</Text>
                <Text style={styles.stepSub}>Follow these steps to confirm your VIP payment:</Text>

                <View style={styles.instrRow}>
                  <View style={styles.instrNum}><Text style={styles.instrNumText}>1</Text></View>
                  <Text style={styles.instrText}>Pay KSh {VIP_AMOUNT} to Till Number <Text style={{ fontFamily: "Inter_700Bold" }}>{TILL_NUMBER}</Text></Text>
                </View>
                <View style={styles.instrRow}>
                  <View style={styles.instrNum}><Text style={styles.instrNumText}>2</Text></View>
                  <Text style={styles.instrText}>Wait for your M-Pesa confirmation SMS</Text>
                </View>
                <View style={styles.instrRow}>
                  <View style={styles.instrNum}><Text style={styles.instrNumText}>3</Text></View>
                  <Text style={styles.instrText}>Copy and paste the entire SMS message below</Text>
                </View>
                <View style={styles.instrRow}>
                  <View style={styles.instrNum}><Text style={styles.instrNumText}>4</Text></View>
                  <Text style={styles.instrText}>Click "Verify Payment" to unlock VIP access</Text>
                </View>
              </View>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Paste your M-Pesa confirmation SMS here:</Text>
                <TextInput
                  style={styles.textInput}
                  value={mpesaCode}
                  onChangeText={setMpesaCode}
                  placeholder="Paste the complete SMS you received from M-Pesa..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={4}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.note}>
                <Text style={styles.noteText}>
                  Note: The KSh {VIP_AMOUNT} VIP fee will be added to your account balance after verification! Pay only to our official Till Number.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.verifyBtn, { opacity: pressed || isPending ? 0.85 : 1 }]}
                onPress={handleVerify}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Feather name="check-circle" size={18} color="#ffffff" />
                    <Text style={styles.verifyBtnText}>Verify Payment</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                onPress={() => setStep(1)}
              >
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, textAlign: "center" }}>
                  ← Back to payment details
                </Text>
              </Pressable>
            </>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
