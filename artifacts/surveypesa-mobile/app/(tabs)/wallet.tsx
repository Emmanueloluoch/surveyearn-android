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

    balanceCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
    },
    balLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      marginBottom: 4,
    },
    balAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 36,
      color: "#ffffff",
      lineHeight: 44,
      marginBottom: 16,
    },
    balUnit: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 20,
      color: "rgba(255,255,255,0.9)",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 2,
    },
    statValue: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: "#ffffff",
    },

    body: {
      padding: 16,
      paddingBottom: bottomPad,
      gap: 12,
    },
    sectionLabel: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 8,
      marginTop: 4,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 0 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💳 Your Wallet</Text>
        <Text style={styles.headerSub}>Withdraw earnings to M-Pesa anytime.</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balLabel}>Available Balance</Text>
          <Text style={styles.balAmount}>
            {currentPoints.toLocaleString()}{" "}
            <Text style={styles.balUnit}>KSh</Text>
          </Text>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>0 KSh</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>{currentPoints.toLocaleString()} KSh</Text>
            </View>
          </View>
        </View>
      </View>

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
              KSh {currentPoints.toLocaleString()}
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
              {canWithdraw ? "Eligible" : "Below Minimum"}
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
              Withdraw KSh {currentPoints.toLocaleString()} to M-Pesa
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
  );
}
