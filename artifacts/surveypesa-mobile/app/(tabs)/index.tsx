import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetUser, useGetUserCompletions, useListSurveys } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getDailyCompletions } from "@/utils/dailyCompletions";
import { estimateMinutes, getCategoryColors, getSurveyMeta } from "@/utils/surveyMeta";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";

const DAILY_FREE_LIMIT = 6;

const LIVE_WITHDRAWALS = [
  { phone: "+254722···441", amount: "3,200", ago: "just now" },
  { phone: "+254711···893", amount: "5,500", ago: "1 min ago" },
  { phone: "+254733···221", amount: "4,750", ago: "1 min ago" },
  { phone: "+254798···110", amount: "3,000", ago: "2 min ago" },
  { phone: "+254706···557", amount: "8,000", ago: "2 min ago" },
  { phone: "+254720···882", amount: "6,300", ago: "3 min ago" },
  { phone: "+254715···329", amount: "3,500", ago: "3 min ago" },
  { phone: "+254701···774", amount: "10,000", ago: "4 min ago" },
  { phone: "+254743···662", amount: "4,200", ago: "4 min ago" },
  { phone: "+254712···018", amount: "7,800", ago: "5 min ago" },
  { phone: "+254756···335", amount: "3,100", ago: "5 min ago" },
  { phone: "+254729···507", amount: "12,000", ago: "6 min ago" },
  { phone: "+254700···943", amount: "5,000", ago: "6 min ago" },
  { phone: "+254718···271", amount: "3,750", ago: "7 min ago" },
  { phone: "+254790···814", amount: "6,500", ago: "7 min ago" },
  { phone: "+254705···388", amount: "9,000", ago: "8 min ago" },
  { phone: "+254737···129", amount: "3,300", ago: "8 min ago" },
  { phone: "+254724···650", amount: "4,500", ago: "9 min ago" },
  { phone: "+254763···492", amount: "15,000", ago: "9 min ago" },
  { phone: "+254709···736", amount: "3,800", ago: "10 min ago" },
  { phone: "+254748···261", amount: "5,200", ago: "11 min ago" },
  { phone: "+254731···845", amount: "7,000", ago: "11 min ago" },
  { phone: "+254719···573", amount: "3,600", ago: "12 min ago" },
  { phone: "+254702···917", amount: "11,500", ago: "12 min ago" },
  { phone: "+254754···308", amount: "4,000", ago: "13 min ago" },
  { phone: "+254726···189", amount: "6,800", ago: "14 min ago" },
  { phone: "+254741···624", amount: "3,200", ago: "14 min ago" },
  { phone: "+254713···057", amount: "8,500", ago: "15 min ago" },
  { phone: "+254787···432", amount: "5,700", ago: "15 min ago" },
  { phone: "+254703···876", amount: "3,900", ago: "16 min ago" },
  { phone: "+254769···211", amount: "20,000", ago: "17 min ago" },
  { phone: "+254728···543", amount: "4,300", ago: "17 min ago" },
  { phone: "+254716···798", amount: "6,100", ago: "18 min ago" },
  { phone: "+254745···362", amount: "3,500", ago: "19 min ago" },
  { phone: "+254708···924", amount: "9,500", ago: "19 min ago" },
  { phone: "+254732···615", amount: "5,800", ago: "20 min ago" },
  { phone: "+254721···487", amount: "3,400", ago: "21 min ago" },
  { phone: "+254759···130", amount: "7,200", ago: "22 min ago" },
  { phone: "+254714···869", amount: "4,600", ago: "22 min ago" },
  { phone: "+254704···253", amount: "13,000", ago: "23 min ago" },
  { phone: "+254746···701", amount: "3,700", ago: "24 min ago" },
  { phone: "+254723···348", amount: "5,300", ago: "24 min ago" },
  { phone: "+254761···592", amount: "8,200", ago: "25 min ago" },
  { phone: "+254717···034", amount: "3,100", ago: "26 min ago" },
  { phone: "+254739···417", amount: "6,700", ago: "27 min ago" },
  { phone: "+254707···865", amount: "4,800", ago: "27 min ago" },
  { phone: "+254752···229", amount: "18,000", ago: "28 min ago" },
  { phone: "+254725···673", amount: "3,300", ago: "29 min ago" },
  { phone: "+254710···941", amount: "7,500", ago: "30 min ago" },
  { phone: "+254783···156", amount: "5,100", ago: "31 min ago" },
];

function getGreetingEmoji(): string {
  const h = new Date().getHours();
  if (h < 6) return "🌙";
  if (h < 12) return "🌤";
  if (h < 17) return "☀️";
  if (h < 20) return "🌇";
  return "🌙";
}

function getGreetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function getCountdown(): string {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getDayProgressPct(): number {
  const now = new Date();
  const secs = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  return secs / 86400;
}

function getTodaysSurveyIds(allIds: number[], userId: number): number[] {
  const dayNum = Math.floor(Date.now() / 86400000);
  const seed = dayNum * 100003 + userId * 7919;
  const arr = [...allIds];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.abs((seed * (i + 1) * 2654435761) >>> 0) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, DAILY_FREE_LIMIT);
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updatePoints } = useAuth();

  const [countdown, setCountdown] = useState(getCountdown);
  const [dayPct, setDayPct] = useState(getDayProgressPct);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [dailyDoneIds, setDailyDoneIds] = useState<number[]>([]);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const tickerOpacity = useRef(new Animated.Value(1)).current;

  const { data: surveys, isLoading, refetch, isRefetching } = useListSurveys();
  const { data: userData, refetch: refetchUser } = useGetUser(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });
  const { data: completedIds, refetch: refetchCompletions } = useGetUserCompletions(
    user?.userId ?? 0,
    { query: { enabled: !!user?.userId } }
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(getCountdown());
      setDayPct(getDayProgressPct());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const cycle = () => {
      Animated.sequence([
        Animated.timing(tickerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(100),
        Animated.timing(tickerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => setTickerIdx((i) => (i + 1) % LIVE_WITHDRAWALS.length));
    };
    const id = setInterval(cycle, 3500);
    return () => clearInterval(id);
  }, [tickerOpacity]);

  useFocusEffect(
    useCallback(() => {
      getDailyCompletions().then(setDailyDoneIds);
      refetch();
      refetchUser();
      refetchCompletions();
    }, [refetch, refetchUser, refetchCompletions])
  );

  useEffect(() => {
    if (userData?.points !== undefined) updatePoints(userData.points);
  }, [userData?.points, updatePoints]);

  const completedSet = new Set(completedIds ?? []);
  const allPublished = surveys?.filter((s) => s.isPublished) ?? [];
  const welcomeSurvey = allPublished.find((s) => s.title === "Welcome Bonus Survey");
  const welcomeSurveyId = user?.welcomeSurveyId ?? welcomeSurvey?.id ?? null;
  const welcomeDone = welcomeSurveyId ? completedSet.has(welcomeSurveyId) : false;
  const topicSurveys = allPublished.filter((s) => s.title !== "Welcome Bonus Survey");

  const todaysSurveyIds = new Set(getTodaysSurveyIds(topicSurveys.map((s) => s.id), user?.userId ?? 0));
  const todaysSurveys = topicSurveys.filter((s) => todaysSurveyIds.has(s.id));
  const browseAll = topicSurveys;

  const dailyDoneCount = dailyDoneIds.filter((id) => completedSet.has(id)).length;
  const dailyLimitReached = dailyDoneCount >= DAILY_FREE_LIMIT;

  const currentPoints = userData?.points ?? user?.points ?? 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;
  const ticker = LIVE_WITHDRAWALS[tickerIdx];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 8,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    greeting: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: "rgba(255,255,255,0.7)",
      marginBottom: 2,
    },
    greetingName: {
      fontFamily: "Inter_700Bold",
      color: "#ffffff",
    },
    subtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.55)",
      marginBottom: 16,
    },
    balLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "rgba(255,255,255,0.65)",
      marginBottom: 4,
    },
    balAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 38,
      color: "#ffffff",
      lineHeight: 46,
      marginBottom: 16,
    },
    balUnit: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 20,
      color: "rgba(255,255,255,0.85)",
    },
    actionRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    withdrawBtn: {
      backgroundColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
    },
    earnBtn: {
      backgroundColor: colors.primary,
    },
    actionBtnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: "#ffffff",
    },

    body: { paddingBottom: bottomPad },

    tickerCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    tickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#ef4444",
    },
    liveText: {
      fontFamily: "Inter_700Bold",
      fontSize: 11,
      color: "#ef4444",
      letterSpacing: 1,
    },
    tickerTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.foreground,
    },
    tickerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    tickerAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.primary,
    },
    tickerPhone: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    tickerBadge: {
      backgroundColor: "#dcfce7",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    tickerBadgeText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 10,
      color: "#166534",
    },
    tickerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    sectionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    sectionTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
    },
    sectionBadge: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    sectionBadgeText: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      color: colors.mutedForeground,
    },
    sectionRight: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
      color: colors.primary,
    },

    welcomeCard: {
      marginHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    welcomeCardInner: {
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    welcomeIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    welcomeInfo: { flex: 1 },
    welcomeCardTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
      marginBottom: 2,
    },
    welcomeCardSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    welcomeReward: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.primary,
    },
    welcomeFooter: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    welcomeFooterText: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },

    surveyCard: {
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    surveyCardInner: {
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    surveyInfo: { flex: 1 },
    surveyTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
      marginBottom: 2,
      lineHeight: 19,
    },
    surveyCompany: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      marginBottom: 5,
    },
    tagRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    categoryTag: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    categoryTagText: {
      fontFamily: "Inter_500Medium",
      fontSize: 10,
    },
    timeText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
    },
    surveyRight: {
      alignItems: "flex-end",
      gap: 6,
    },
    rewardText: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: colors.primary,
    },
    rewardDone: {
      color: colors.mutedForeground,
    },
    surveyLockFooter: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#fafafa",
    },
    surveyLockText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
    },
    surveyDoneFooter: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderTopWidth: 1,
      borderTopColor: "#dcfce7",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#f0fdf4",
    },
    surveyDoneText: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      color: "#16a34a",
    },

    countdownCard: {
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    countdownRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    countdownLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      flexDirection: "row",
      alignItems: "center",
    },
    countdownValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.foreground,
      letterSpacing: 1,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.muted,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressFill: {
      height: 6,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    countdownSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  function SurveyCard({
    survey,
    locked,
    done,
    onPress,
    onLocked,
  }: {
    survey: (typeof topicSurveys)[0];
    locked: boolean;
    done: boolean;
    onPress?: () => void;
    onLocked?: () => void;
  }) {
    const meta = getSurveyMeta(survey.title);
    const catColors = getCategoryColors(meta.category);
    const mins = estimateMinutes(survey.questionCount, meta.minutesPerQ);

    return (
      <Pressable
        style={({ pressed }) => [styles.surveyCard, { opacity: pressed ? 0.85 : 1 }]}
        onPress={done ? undefined : locked ? onLocked : onPress}
      >
        <View style={styles.surveyCardInner}>
          <View style={[styles.iconCircle, { backgroundColor: `${meta.iconColor}18` }]}>
            <Feather name={meta.icon as never} size={20} color={meta.iconColor} />
          </View>
          <View style={styles.surveyInfo}>
            <Text style={styles.surveyTitle} numberOfLines={1}>{survey.title}</Text>
            <Text style={styles.surveyCompany} numberOfLines={1}>{meta.company}</Text>
            <View style={styles.tagRow}>
              <View style={[styles.categoryTag, { backgroundColor: catColors.bg }]}>
                <Text style={[styles.categoryTagText, { color: catColors.text }]}>{meta.category}</Text>
              </View>
              <Feather name="clock" size={10} color={colors.mutedForeground} />
              <Text style={styles.timeText}>{mins}</Text>
            </View>
          </View>
          <View style={styles.surveyRight}>
            <Text style={[styles.rewardText, done && styles.rewardDone]}>
              {done ? "Done" : `+${survey.reward} KSh`}
            </Text>
            {locked && !done && <Feather name="lock" size={14} color={colors.mutedForeground} />}
            {done && <Feather name="check-circle" size={14} color="#16a34a" />}
          </View>
        </View>
        {locked && !done && (
          <View style={styles.surveyLockFooter}>
            <Feather name="lock" size={11} color={colors.mutedForeground} />
            <Text style={styles.surveyLockText}>Activate account to unlock</Text>
          </View>
        )}
        {done && (
          <View style={styles.surveyDoneFooter}>
            <Feather name="check" size={11} color="#16a34a" />
            <Text style={styles.surveyDoneText}>Completed</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <NotificationPermissionModal />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); refetchUser(); refetchCompletions(); getDailyCompletions().then(setDailyDoneIds); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Good {getGreetingWord()},{" "}
            <Text style={styles.greetingName}>{user?.name?.split(" ")[0] ?? "Explorer"}</Text>
            {"  "}{getGreetingEmoji()}
          </Text>
          <Text style={styles.subtitle}>Earn surely, withdraw instantly.</Text>
          <Text style={styles.balLabel}>Available Balance</Text>
          <Text style={styles.balAmount}>
            {currentPoints.toLocaleString()}{" "}
            <Text style={styles.balUnit}>KSh</Text>
          </Text>
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.withdrawBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push("/(tabs)/wallet")}
            >
              <Text style={styles.actionBtnText}>Withdraw</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.earnBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => {}}
            >
              <Text style={styles.actionBtnText}>Earn More</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.body}>

          {/* LIVE TICKER */}
          <View style={styles.tickerCard}>
            <View style={styles.tickerHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
              <Text style={styles.tickerTitle}>Recent Withdrawals</Text>
            </View>
            <Animated.View style={{ opacity: tickerOpacity }}>
              <View style={styles.tickerRow}>
                <Text style={styles.tickerAmount}>KSh {ticker.amount}</Text>
                <Feather name="arrow-right" size={12} color={colors.mutedForeground} />
                <Text style={styles.tickerPhone}>{ticker.phone}</Text>
                <Text style={styles.tickerPhone}>· {ticker.ago}</Text>
                <View style={styles.tickerBadge}>
                  <Text style={styles.tickerBadgeText}>Instant</Text>
                </View>
              </View>
              <Text style={styles.tickerSub}>Survey bonus received!</Text>
            </Animated.View>
          </View>

          {/* DAILY PROGRESS */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Text style={{ fontSize: 16 }}>📈</Text>
              <Text style={styles.sectionTitle}>Daily Progress</Text>
            </View>
            <Text style={styles.sectionRight}>
              {dailyDoneCount >= DAILY_FREE_LIMIT ? "Limit reached" : `${DAILY_FREE_LIMIT - dailyDoneCount} remaining`}
            </Text>
          </View>

          <View style={[styles.tickerCard, { padding: 16 }]}>
            <Text style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: colors.mutedForeground,
              marginBottom: 12,
            }}>
              Today:{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                {dailyDoneCount}/{DAILY_FREE_LIMIT} surveys
              </Text>
              {dailyDoneCount < DAILY_FREE_LIMIT
                ? ` · ${DAILY_FREE_LIMIT - dailyDoneCount} remaining`
                : " · Daily limit reached!"}
            </Text>
            <View style={[styles.progressTrack, { height: 8, marginBottom: 0 }]}>
              <View style={[styles.progressFill, {
                height: 8,
                width: `${Math.min((dailyDoneCount / DAILY_FREE_LIMIT) * 100, 100)}%`,
              }]} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>0%</Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>
                {Math.round((dailyDoneCount / DAILY_FREE_LIMIT) * 100)}% complete
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>100%</Text>
            </View>
          </View>

          {/* WELCOME BONUS */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Text style={{ fontSize: 16 }}>🎁</Text>
              <Text style={styles.sectionTitle}>Welcome Bonus</Text>
            </View>
            <Text style={styles.sectionRight}>One-time only</Text>
          </View>

          <View style={styles.welcomeCard}>
            <View style={styles.welcomeCardInner}>
              <View style={[styles.welcomeIconCircle, { backgroundColor: `${colors.primary}18` }]}>
                <Feather name="gift" size={22} color={colors.primary} />
              </View>
              <View style={styles.welcomeInfo}>
                <Text style={styles.welcomeCardTitle}>Welcome Survey</Text>
                <Text style={styles.welcomeCardSub}>
                  {welcomeDone ? "Completed — 1,000 KSh earned!" : "Answer 7 quick questions"}
                </Text>
              </View>
              <Text style={[styles.welcomeReward, welcomeDone && { color: colors.mutedForeground }]}>
                +1,000{"\n"}KSh
              </Text>
            </View>
            {welcomeDone ? (
              <View style={styles.surveyDoneFooter}>
                <Feather name="check-circle" size={12} color="#16a34a" />
                <Text style={styles.surveyDoneText}>Completed</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.welcomeFooter, { opacity: pressed ? 0.75 : 1 }]}
                onPress={() => welcomeSurveyId && router.push(`/survey/${welcomeSurveyId}?welcome=true`)}
              >
                <Feather name="play-circle" size={12} color={colors.primary} />
                <Text style={[styles.welcomeFooterText, { color: colors.primary }]}>Start to unlock bonus</Text>
              </Pressable>
            )}
          </View>

          {/* TODAY'S SURVEYS */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Text style={{ fontSize: 16 }}>📊</Text>
              <Text style={styles.sectionTitle}>Today's Surveys</Text>
            </View>
            <Text style={styles.sectionRight}>Tap to earn →</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            todaysSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                locked={!user?.isActivated}
                done={completedSet.has(survey.id)}
                onPress={() => router.push(`/survey/${survey.id}`)}
                onLocked={() => setShowActivationModal(true)}
              />
            ))
          )}

          {/* COUNTDOWN TIMER */}
          <View style={styles.countdownCard}>
            <View style={styles.countdownRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Feather name="refresh-cw" size={13} color={colors.mutedForeground} />
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground }}>
                  Next survey refresh in
                </Text>
              </View>
              <Text style={styles.countdownValue}>{countdown}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${dayPct * 100}%` }]} />
            </View>
            <Text style={styles.countdownSub}>
              Resets daily at midnight UTC · Uses server time
            </Text>
          </View>

          {/* BROWSE ALL TOPICS */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Text style={{ fontSize: 16 }}>📋</Text>
              <Text style={styles.sectionTitle}>Browse All Topics</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{browseAll.length} topics</Text>
            </View>
          </View>

          {browseAll.map((survey) => {
            const done = completedSet.has(survey.id);
            const notActivated = !user?.isActivated;
            const notVip = !user?.isVip;
            const locked = !done && (notActivated || notVip);
            const onLocked = notActivated
              ? () => setShowActivationModal(true)
              : () => setShowVipModal(true);
            return (
              <SurveyCard
                key={survey.id}
                survey={survey}
                locked={locked}
                done={done}
                onPress={() => router.push(`/survey/${survey.id}`)}
                onLocked={onLocked}
              />
            );
          })}
        </View>
        </View>
      </ScrollView>

      {/* ACTIVATION MODAL */}
      <Modal
        visible={showActivationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActivationModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }}
          onPress={() => setShowActivationModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              alignItems: "center",
              gap: 8,
            }}
            onPress={() => {}}
          >
            <View style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: `${colors.primary}18`,
              alignItems: "center", justifyContent: "center",
              marginBottom: 4,
            }}>
              <Text style={{ fontSize: 28 }}>🔒</Text>
            </View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground, textAlign: "center" }}>
              Account Activation Required
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 20 }}>
              Activate your account with <Text style={{ fontFamily: "Inter_700Bold", color: colors.foreground }}>KSh 150</Text> to unlock all surveys and start earning real money. The activation fee will be added to your balance!
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8, width: "100%" }}>
              <Pressable
                style={({ pressed }) => [{
                  flex: 1, paddingVertical: 13, borderRadius: 12,
                  backgroundColor: colors.muted,
                  alignItems: "center", opacity: pressed ? 0.7 : 1,
                }]}
                onPress={() => setShowActivationModal(false)}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.mutedForeground }}>Later</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [{
                  flex: 1.5, paddingVertical: 13, borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center", opacity: pressed ? 0.85 : 1,
                }]}
                onPress={() => { setShowActivationModal(false); router.push("/activate"); }}
              >
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: "#ffffff" }}>Activate Now</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* VIP UPGRADE MODAL */}
      <Modal
        visible={showVipModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVipModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }}
          onPress={() => setShowVipModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              alignItems: "center",
              gap: 8,
            }}
            onPress={() => {}}
          >
            <View style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: "#f3e8ff",
              alignItems: "center", justifyContent: "center",
              marginBottom: 4,
            }}>
              <Text style={{ fontSize: 30 }}>👑</Text>
            </View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground, textAlign: "center" }}>
              VIP Access Required
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 20 }}>
              Your daily 6 surveys are done. Upgrade to <Text style={{ fontFamily: "Inter_700Bold", color: "#7c3aed" }}>VIP</Text> for <Text style={{ fontFamily: "Inter_700Bold", color: colors.foreground }}>KSh 500</Text> to unlock unlimited access to all surveys every day. The fee is added to your balance!
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8, width: "100%" }}>
              <Pressable
                style={({ pressed }) => [{
                  flex: 1, paddingVertical: 13, borderRadius: 12,
                  backgroundColor: colors.muted,
                  alignItems: "center", opacity: pressed ? 0.7 : 1,
                }]}
                onPress={() => setShowVipModal(false)}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.mutedForeground }}>Later</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [{
                  flex: 1.5, paddingVertical: 13, borderRadius: 12,
                  backgroundColor: "#7c3aed",
                  alignItems: "center", opacity: pressed ? 0.85 : 1,
                }]}
                onPress={() => { setShowVipModal(false); router.push("/vip"); }}
              >
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: "#ffffff" }}>Upgrade to VIP</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
