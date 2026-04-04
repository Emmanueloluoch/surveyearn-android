import { useGetUserCompletions, useListSurveys } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function SurveysScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterTab>("all");

  const { data: surveys, isLoading, refetch, isRefetching } = useListSurveys();
  const { data: completedIds } = useGetUserCompletions(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });

  const completedSet = new Set(completedIds ?? []);

  const publishedSurveys = surveys?.filter((s) => s.isPublished) ?? [];
  const filtered =
    filter === "available"
      ? publishedSurveys.filter((s) => !completedSet.has(s.id))
      : filter === "done"
      ? publishedSurveys.filter((s) => completedSet.has(s.id))
      : publishedSurveys;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 12,
      paddingBottom: 16,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: "#ffffff",
      marginBottom: 12,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterBtn: {
      paddingHorizontal: 16,
      paddingVertical: 7,
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
        <Text style={styles.headerTitle}>Surveys</Text>
        <View style={styles.filterRow}>
          {(["all", "available", "done"] as FilterTab[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[styles.filterText, filter === f && styles.filterTextActive]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
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
                onRefresh={refetch}
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
                    <Text style={styles.title}>{item.title}</Text>
                    {item.description ? (
                      <Text style={styles.desc} numberOfLines={2}>
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
                <Text style={styles.emptyText}>No surveys here</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
