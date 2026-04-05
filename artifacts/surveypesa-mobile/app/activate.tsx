import { useActivateUser } from "@workspace/api-client-react";
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
const ACTIVATION_AMOUNT = 150;

export default function ActivateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setActivated } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [mpesaCode, setMpesaCode] = useState("");
  const [copiedTill, setCopiedTill] = useState(false);

  const { mutateAsync: activateUser, isPending } = useActivateUser();

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
      const result = await activateUser({ id: user.userId, data: { mpesaCode: code } });
      setActivated(result.points);
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
      backgroundColor: colors.primary,
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
      flex: 1,
    },
    headerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
    },
    body: {
      padding: 20,
      paddingBottom: insets.bottom + 32,
      gap: 16,
    },
    whyCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    whyTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 4,
    },
    whyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    whyDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: `${colors.primary}18`,
      alignItems: "center",
      justifyContent: "center",
    },
    whyText: {
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
      backgroundColor: colors.primary,
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
      backgroundColor: colors.primary,
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
    mpesaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
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
    tillValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
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
      backgroundColor: copiedTill ? colors.muted : `${colors.primary}18`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    copyBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: copiedTill ? colors.mutedForeground : colors.primary,
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
      color: colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    instrCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
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
      backgroundColor: colors.primary,
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
      backgroundColor: colors.primary,
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
    note: {
      backgroundColor: "#fffbeb",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "#fde68a",
    },
    noteText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "#92400e",
      lineHeight: 18,
    },
    nextBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    nextBtnText: {
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
              <Feather name="unlock" size={26} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Activate Your Account</Text>
              <Text style={styles.headerSub}>Unlock surveys and start earning real money!</Text>
            </View>
          </View>
        </View>
        <View style={styles.body}>

          {step === 1 && (
            <>
              <View style={styles.whyCard}>
                <Text style={styles.whyTitle}>Why Activate Your Account?</Text>
                <View style={styles.whyRow}>
                  <View style={styles.whyDot}>
                    <Feather name="check" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.whyText}>Unlock access to all surveys</Text>
                </View>
                <View style={styles.whyRow}>
                  <View style={styles.whyDot}>
                    <Feather name="smartphone" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.whyText}>Enable money withdrawals to M-Pesa</Text>
                </View>
                <View style={styles.whyRow}>
                  <View style={styles.whyDot}>
                    <Feather name="users" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.whyText}>Join our trusted earning network</Text>
                </View>
                <View style={styles.whyRow}>
                  <View style={styles.whyDot}>
                    <Feather name="gift" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.whyText}>Get KSh 150 added to your balance</Text>
                </View>
              </View>

              <View style={styles.payCard}>
                <View style={styles.payHeader}>
                  <Text style={styles.payHeaderText}>Payment Details</Text>
                  <View style={styles.payHeaderBadge}>
                    <Text style={styles.payHeaderBadgeText}>VP</Text>
                  </View>
                </View>
                <View style={styles.payBody}>
                  <View style={styles.mpesaRow}>
                    <Text style={styles.mpesaLogo}>LIPA NA M•PESA</Text>
                  </View>
                  <Text style={[styles.mpesaSub, { marginBottom: 8 }]}>BUY GOODS TILL NUMBER</Text>

                  <View style={styles.tillRow}>
                    <View>
                      <Text style={styles.tillLabel}>Till Number</Text>
                      <View style={styles.tillValueRow}>
                        <Text style={styles.tillValue}>{TILL_NUMBER}</Text>
                      </View>
                    </View>
                    <Pressable style={styles.copyBtn} onPress={handleCopyTill}>
                      <Feather name={copiedTill ? "check" : "copy"} size={13} color={copiedTill ? colors.mutedForeground : colors.primary} />
                      <Text style={styles.copyBtnText}>{copiedTill ? "Copied!" : "Copy"}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>KSh {ACTIVATION_AMOUNT}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.nameRow}>
                    <Text style={styles.nameLabel}>Till Name</Text>
                    <Text style={styles.nameValue}>{ACCOUNT_NAME}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.note}>
                <Text style={styles.noteText}>
                  Note: The KSh {ACTIVATION_AMOUNT} activation fee will be added to your account balance as a welcome bonus after verification! Pay only to our official Till Number.
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
                <Text style={styles.stepSub}>Follow these steps to confirm your payment:</Text>

                <View style={styles.instrRow}>
                  <View style={styles.instrNum}><Text style={styles.instrNumText}>1</Text></View>
                  <Text style={styles.instrText}>Pay KSh {ACTIVATION_AMOUNT} to Till Number <Text style={{ fontFamily: "Inter_700Bold" }}>{TILL_NUMBER}</Text></Text>
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
                  <Text style={styles.instrText}>Click "Verify Payment" to activate your account</Text>
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
                  Note: The KSh {ACTIVATION_AMOUNT} activation fee will be added to your account balance as a welcome bonus after verification! Pay only to our official Till Number.
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

              <Pressable onPress={() => setStep(1)}>
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
