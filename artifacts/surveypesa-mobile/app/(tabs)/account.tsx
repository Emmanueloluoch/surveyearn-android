import { useGetUser } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
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

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const { data: userData } = useGetUser(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });

  const currentPoints = userData?.points ?? user?.points ?? 0;
  const joinDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-KE", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/auth");
        },
      },
    ]);
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
      alignItems: "center",
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarText: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: "#ffffff",
    },
    displayName: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: "#ffffff",
      marginBottom: 4,
    },
    phoneText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: "rgba(255,255,255,0.65)",
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    statBox: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
    },
    statValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: "#ffffff",
    },
    statLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.6)",
      marginTop: 2,
    },
    body: {
      padding: 20,
      paddingBottom: bottomPad,
    },
    sectionLabel: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 8,
      marginTop: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuIcon: {
      width: 32,
      alignItems: "center",
    },
    menuText: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.foreground,
      flex: 1,
      marginLeft: 12,
    },
    menuTextDanger: {
      color: colors.destructive,
    },
    joinedText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 24,
    },
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.displayName}>{user?.name ?? "User"}</Text>
        <Text style={styles.phoneText}>{user?.phone ?? "—"}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{currentPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>KSh {currentPoints}</Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Settings</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Feather name="phone" size={18} color={colors.mutedForeground} />
              </View>
              <Text style={styles.menuText}>{user?.phone ?? "—"}</Text>
            </View>
            <View style={[styles.menuItem, styles.menuItemLast]}>
              <View style={styles.menuIcon}>
                <Feather name="calendar" size={18} color={colors.mutedForeground} />
              </View>
              <Text style={styles.menuText}>Member since {joinDate}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>About</Text>
          <View style={styles.menuCard}>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/(tabs)/refer")}
            >
              <View style={styles.menuIcon}>
                <Feather name="gift" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuText, { color: colors.primary }]}>
                Refer a Friend
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push("/(tabs)/wallet")}
            >
              <View style={styles.menuIcon}>
                <Feather name="credit-card" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuText, { color: colors.primary }]}>
                Withdraw Earnings
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.menuCard}>
            <Pressable
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleLogout}
            >
              <View style={styles.menuIcon}>
                <Feather name="log-out" size={18} color={colors.destructive} />
              </View>
              <Text style={[styles.menuText, styles.menuTextDanger]}>Log Out</Text>
            </Pressable>
          </View>

          <Text style={styles.joinedText}>SurveyPesa KE v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
