import { useGetUser, useGetUserCompletions, useListSurveys } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type FilterTab = "all" | "available" | "done";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updatePoints } = useAuth();

  const [filter, setFilter] = useState<FilterTab>("all");

  const { data: surveys, isLoading, refetch, isRefetching } = useListSurveys();
  const { data: userData, refetch: refetchUser } = useGetUser(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });
  const { data: completedIds } = useGetUserCompletions(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    refetchUser();
    if (userData?.points !== undefined) {
      updatePoints(userData.points);
    }
  }, [refetch, refetchUser, userData, updatePoints]);

  const completedSet = new Set(completedIds ?? []);
  const publishedSurveys = surveys?.filter((s) => s.isPublished) ?? [];
  const filtered =
    filter === "available"
      ? publishedSurveys.filter((s) => !completedSet.has(s.id))
      : filter === "done"
      ? publishedSurveys.filter((s) => completedSet.has(s.id))
      : publishedSurveys;

  const currentPoints = userData?.points ?? user?.points ?? 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 12,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    greeting: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 4,
    },
    name: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: "#ffffff",
      marginBottom: 16,
    },
    balanceCard: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    balanceLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 4,
    },
    balanceRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
    },
    balanceCurrency: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 4,
    },
    balanceAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 32,
      color: "#ffffff",
    },
    withdrawHint: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.55)",
      marginTop: 4,
    },
    withdrawBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    withdrawBtnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#fff",
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    filterBtnActive: {
      backgroundColor: "#ffffff",
    },
    filterText: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
    },
    filterTextActive: {
      color: colors.headerBg,
    },
    body: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    cardDone: { opacity: 0.6 },
    info: { flex: 1 },
    cardTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 4,
    },
    cardDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
    },
    metaText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    badge: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginLeft: 12,
      minWidth: 64,
      alignItems: "center",
    },
    badgeDone: { backgroundColor: colors.muted },
    badgeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#ffffff",
    },
    badgeTextDone: { color: colors.mutedForeground },
    emptyBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.mutedForeground,
    },
    listContent: {
      paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
          {user?.name?.split(" ")[0] ?? "Explorer"}!
        </Text>
        <Text style={styles.name}>Your Wallet</Text>

        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>{currentPoints}</Text>
              <Text style={styles.balanceCurrency}> KSh</Text>
            </View>
            <Text style={styles.withdrawHint}>Min. KSh 100 to withdraw</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/wallet")}
            style={styles.withdrawBtn}
          >
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {(["all", "available", "done"] as FilterTab[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === "all" ? "All" : f === "available" ? "Available" : "Done"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {isLoading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={filtered.length > 0}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            renderItem={({ item }) => {
              const done = completedSet.has(item.id);
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.card,
                    done && styles.cardDone,
                    { opacity: pressed && !done ? 0.75 : 1 },
                  ]}
                  onPress={done ? undefined : () => router.push(`/survey/${item.id}`)}
                >
                  <View style={styles.info}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.description ? (
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>
                        {item.questionCount} question{item.questionCount !== 1 ? "s" : ""}
                      </Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.metaText}>
                        {item.responseCount} response{item.responseCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.badge, done && styles.badgeDone]}>
                    <Text style={[styles.badgeText, done && styles.badgeTextDone]}>
                      {done ? "Done" : `KSh ${item.reward}`}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  {filter === "done" ? "No completed surveys yet" : "No surveys available"}
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, marginTop: 4 }}>
                  {filter === "done" ? "Complete a survey to earn KSh" : "Check back soon!"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
