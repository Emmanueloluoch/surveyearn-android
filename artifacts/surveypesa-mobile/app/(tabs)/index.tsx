import { useGetUser, useListSurveys } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
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

function SurveyCard({
  survey,
  completed,
  onPress,
}: {
  survey: {
    id: number;
    title: string;
    description: string | null;
    reward: number;
    isPublished: boolean;
  };
  completed: boolean;
  onPress: () => void;
}) {
  const colors = useColors();

  const styles = StyleSheet.create({
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
    cardCompleted: {
      opacity: 0.6,
    },
    info: {
      flex: 1,
    },
    title: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 4,
    },
    desc: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
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
    badgeCompleted: {
      backgroundColor: colors.muted,
    },
    badgeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#ffffff",
    },
    badgeTextCompleted: {
      color: colors.mutedForeground,
    },
    doneLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        completed && styles.cardCompleted,
        { opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={completed ? undefined : onPress}
    >
      <View style={styles.info}>
        <Text style={styles.title}>{survey.title}</Text>
        {survey.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {survey.description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.badge, completed && styles.badgeCompleted]}>
        <Text style={[styles.badgeText, completed && styles.badgeTextCompleted]}>
          {completed ? "Done" : `KSh ${survey.reward}`}
        </Text>
        {!completed && <Text style={styles.doneLabel}>reward</Text>}
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updatePoints } = useAuth();

  const { data: surveys, isLoading, refetch, isRefetching } = useListSurveys();
  const { data: userData, refetch: refetchUser } = useGetUser(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    refetchUser();
    if (userData?.points !== undefined) {
      updatePoints(userData.points);
    }
  }, [refetch, refetchUser, userData, updatePoints]);

  const publishedSurveys = surveys?.filter((s) => s.isPublished) ?? [];
  const completedIds = new Set<number>();

  const currentPoints = userData?.points ?? user?.points ?? 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 12,
      paddingBottom: 28,
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
      marginBottom: 20,
    },
    balanceCard: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    balanceLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 4,
    },
    balanceAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 32,
      color: "#ffffff",
    },
    balanceCurrency: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: "rgba(255,255,255,0.7)",
    },
    withdrawHint: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.55)",
      marginTop: 4,
    },
    body: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    sectionTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.foreground,
      marginBottom: 14,
    },
    emptyBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.mutedForeground,
      marginTop: 8,
    },
    listContent: {
      paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name ?? "Explorer"}</Text>
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
              <Text style={styles.balanceCurrency}>KSh</Text>
              <Text style={styles.balanceAmount}>{currentPoints}</Text>
            </View>
            <Text style={styles.withdrawHint}>Min. 100 KSh to withdraw</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/wallet")}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" }}>
              Withdraw
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Available Surveys</Text>
        {isLoading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={publishedSurveys}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={publishedSurveys.length > 0}
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
            renderItem={({ item }) => (
              <SurveyCard
                survey={item}
                completed={completedIds.has(item.id)}
                onPress={() => router.push(`/survey/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No surveys available right now</Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, marginTop: 4 }}>
                  Check back soon!
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
