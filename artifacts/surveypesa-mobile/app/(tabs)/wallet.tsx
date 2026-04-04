import { useGetUser, useWithdrawPoints } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const MINIMUM_POINTS = 3000;

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updatePoints } = useAuth();
  const [withdrawing, setWithdrawing] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const { data: userData, refetch } = useGetUser(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });

  const { mutateAsync: doWithdraw } = useWithdrawPoints();

  const currentPoints = userData?.points ?? user?.points ?? 0;
  const canWithdraw = currentPoints >= MINIMUM_POINTS;

  const handleWithdraw = async () => {
    if (!user) return;
    setWithdrawing(true);
    setLastMessage("");
    try {
      const result = await doWithdraw({ id: user.userId });
      updatePoints(result.points);
      refetch();
      setLastMessage(result.message ?? "Withdrawal initiated");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Withdrawal failed";
      Alert.alert("Withdrawal Failed", msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setWithdrawing(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 12,
      paddingBottom: 28,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: "#ffffff",
      marginBottom: 20,
    },
    balanceCard: {
      backgroundColor: "rgba(255,255,255,0.14)",
      borderRadius: 18,
      padding: 22,
      alignItems: "center",
    },
    balanceLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
      marginBottom: 8,
    },
    balanceRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 6,
    },
    currency: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 4,
    },
    amount: {
      fontFamily: "Inter_700Bold",
      fontSize: 48,
      color: "#ffffff",
      lineHeight: 52,
    },
    minNote: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.5)",
      marginTop: 10,
    },
    body: {
      padding: 20,
      paddingBottom: bottomPad,
    },
    sectionLabel: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 12,
      marginTop: 4,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoKey: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    infoValue: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
    },
    withdrawBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: 12,
    },
    withdrawBtnDisabled: {
      opacity: 0.4,
    },
    withdrawText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },
    successBox: {
      backgroundColor: "#e8fdf0",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: "#a8dba8",
      marginBottom: 16,
    },
    successText: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: "#00802b",
      textAlign: "center",
    },
    howItWorks: {
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 16,
    },
    howTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.foreground,
      marginBottom: 10,
    },
    howStep: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 20,
      marginBottom: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.currency}>KSh</Text>
            <Text style={styles.amount}>{currentPoints}</Text>
          </View>
          <Text style={styles.minNote}>Minimum KSh 3,000 to withdraw via M-Pesa</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Withdraw to M-Pesa</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Phone number</Text>
              <Text style={styles.infoValue}>{user?.phone ?? "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Amount to withdraw</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                KSh {currentPoints}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoKey}>Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: canWithdraw ? colors.success : colors.destructive },
                ]}
              >
                {canWithdraw ? "Ready" : "Need more points"}
              </Text>
            </View>
          </View>

          {lastMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{lastMessage}</Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.withdrawBtn,
              (!canWithdraw || withdrawing) && styles.withdrawBtnDisabled,
            ]}
            onPress={handleWithdraw}
            disabled={!canWithdraw || withdrawing}
            testID="withdraw-btn"
          >
            {withdrawing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.withdrawText}>
                Withdraw KSh {currentPoints} to M-Pesa
              </Text>
            )}
          </Pressable>

          <View style={styles.howItWorks}>
            <Text style={styles.howTitle}>How it works</Text>
            <Text style={styles.howStep}>1. Complete surveys to earn KSh rewards</Text>
            <Text style={styles.howStep}>2. Accumulate at least KSh 3,000</Text>
            <Text style={styles.howStep}>3. Tap Withdraw — funds sent to your M-Pesa</Text>
            <Text style={styles.howStep}>4. Money arrives within minutes</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
