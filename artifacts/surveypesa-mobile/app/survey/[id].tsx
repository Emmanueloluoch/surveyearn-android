import {
  useCompleteSurvey,
  useGetSurvey,
  useListSurveyQuestions,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { addDailyCompletion } from "@/utils/dailyCompletions";

export default function SurveyDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id, welcome } = useLocalSearchParams<{ id: string; welcome?: string }>();
  const router = useRouter();
  const { user, updatePoints } = useAuth();

  const surveyId = Number(id);
  const isWelcome = welcome === "true";

  const { data: survey, isLoading: surveyLoading } = useGetSurvey(surveyId);
  const { data: questions, isLoading: questionsLoading } =
    useListSurveyQuestions(surveyId);

  const { mutateAsync: completeSurvey } = useCompleteSurvey();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const [error, setError] = useState("");
  const [welcomeStep, setWelcomeStep] = useState<"intro" | "questions">("intro");
  const [currentQ, setCurrentQ] = useState(0);

  const loading = surveyLoading || questionsLoading;
  const sortedQuestions = [...(questions ?? [])].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const totalQuestions = sortedQuestions.length;

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setError("");
    setSubmitting(true);
    try {
      const result = await completeSurvey({
        id: surveyId,
        data: { userId: user.userId },
      });
      setEarned(result.pointsEarned ?? 0);
      updatePoints(result.points);
      await addDailyCompletion(surveyId);
      setDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQ < totalQuestions - 1) {
      setCurrentQ((q) => q + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      handleSubmit();
    }
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    doneBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    doneBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    doneBadgeText: {
      fontSize: 36,
      color: "#ffffff",
    },
    doneTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 26,
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 8,
    },
    doneEarned: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
      color: colors.primary,
      marginBottom: 6,
    },
    doneSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 32,
    },
    doneBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingHorizontal: 36,
      paddingVertical: 16,
    },
    doneBtnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },

    introContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    introHeader: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 20,
      paddingBottom: 32,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    introIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    introIconText: { fontSize: 36 },
    introTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
      color: "#ffffff",
      textAlign: "center",
      marginBottom: 8,
    },
    introSubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: "rgba(255,255,255,0.75)",
      textAlign: "center",
      lineHeight: 20,
    },
    introBody: {
      padding: 24,
      alignItems: "center",
    },
    introBonusCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      width: "100%",
      marginBottom: 24,
    },
    introBonusLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    introBonusAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 48,
      color: colors.primary,
      marginBottom: 4,
    },
    introBonusUnit: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
      color: colors.primary,
      marginBottom: 16,
    },
    introBonusDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
    },
    introQCount: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 24,
      textAlign: "center",
    },
    introStartBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 48,
      alignItems: "center",
    },
    introStartText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },

    welcomeWrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    progressHeader: {
      backgroundColor: colors.headerBg,
      paddingTop: topPad + 8,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    progressTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    progressLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
    },
    progressPct: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: "#ffffff",
    },
    progressTrack: {
      height: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: 6,
      backgroundColor: "#ffffff",
      borderRadius: 3,
    },

    welcomeBody: {
      flex: 1,
      padding: 24,
      paddingBottom: bottomPad,
    },
    welcomeQText: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: colors.foreground,
      marginBottom: 24,
      lineHeight: 28,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 10,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}12`,
    },
    optionDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    optionDotSelected: {
      borderColor: colors.primary,
    },
    optionDotInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    optionText: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.foreground,
    },
    ratingRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
    },
    ratingBtn: {
      flex: 1,
      aspectRatio: 1,
      maxWidth: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    ratingBtnSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    ratingText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
    },
    ratingTextSelected: {
      color: "#ffffff",
    },
    textInput: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.foreground,
      minHeight: 90,
      textAlignVertical: "top",
    },
    nextBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 24,
    },
    nextBtnDisabled: { opacity: 0.45 },
    nextBtnText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },

    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: bottomPad },
    rewardBanner: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    rewardLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: "#ffffff",
    },
    rewardAmount: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: "#ffffff",
    },
    questionCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qNum: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    qText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 12,
      lineHeight: 22,
    },
    errorBox: {
      backgroundColor: "#fff0f0",
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.destructive,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    submitDisabled: { opacity: 0.5 },
    submitText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingBox]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (done) {
    if (isWelcome) {
      return (
        <View style={[styles.container, styles.doneBox]}>
          <View style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.headerBg,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 46 }}>★</Text>
          </View>
          <Text style={[styles.doneTitle, { fontSize: 26 }]}>
            Bonus Unlocked!
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground, marginBottom: 16 }}>
            Congratulations! Your reward has been added.
          </Text>
          <View style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingHorizontal: 32,
            paddingVertical: 16,
            marginVertical: 8,
            alignItems: "center",
          }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 36, color: "#ffffff" }}>
              +{earned} KSh
            </Text>
          </View>
          <Text style={[styles.doneSub, { marginTop: 12 }]}>
            New Balance: KSh {earned}
          </Text>
          <Pressable
            style={[styles.doneBtn, { marginTop: 8, paddingHorizontal: 56 }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.doneBtnText}>Continue</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={[styles.container, styles.doneBox]}>
        <View style={styles.doneBadge}>
          <Text style={styles.doneBadgeText}>✓</Text>
        </View>
        <Text style={styles.doneTitle}>Survey Complete!</Text>
        <Text style={styles.doneEarned}>+KSh {earned} earned</Text>
        <Text style={styles.doneSub}>
          Your reward has been added to your wallet
        </Text>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Back to Surveys</Text>
        </Pressable>
      </View>
    );
  }

  if (isWelcome && welcomeStep === "intro") {
    return (
      <View style={styles.introContainer}>
        <View style={styles.introHeader}>
          <View style={styles.introIcon}>
            <Text style={styles.introIconText}>🎁</Text>
          </View>
          <Text style={styles.introTitle}>Welcome to Paid Surveys</Text>
          <Text style={styles.introSubtitle}>
            Answer a few quick questions to unlock your welcome bonus
          </Text>
        </View>

        <View style={styles.introBody}>
          <View style={styles.introBonusCard}>
            <Text style={styles.introBonusLabel}>Welcome Bonus</Text>
            <Text style={styles.introBonusAmount}>1000</Text>
            <Text style={styles.introBonusUnit}>KSh</Text>
            <Text style={styles.introBonusDesc}>
              Complete this short survey to receive your{"\n"}welcome bonus instantly
            </Text>
          </View>

          <Text style={styles.introQCount}>
            {totalQuestions} questions · Takes about 2 minutes
          </Text>

          <Pressable
            style={({ pressed }) => [styles.introStartBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => {
              setWelcomeStep("questions");
              setCurrentQ(0);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Text style={styles.introStartText}>Start Survey</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isWelcome && welcomeStep === "questions") {
    const q = sortedQuestions[currentQ];
    if (!q) return null;

    const pct = Math.round(((currentQ) / totalQuestions) * 100);
    const currentAnswer = answers[q.id] ?? "";
    const opts = q.options ? (JSON.parse(q.options) as string[]) : [];
    const isLast = currentQ === totalQuestions - 1;
    const hasAnswer = currentAnswer.length > 0;

    return (
      <View style={styles.welcomeWrapper}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressLabel}>
              Question {currentQ + 1} of {totalQuestions}
            </Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.welcomeBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcomeQText}>{q.text}</Text>

          {q.type === "text" && (
            <TextInput
              style={styles.textInput}
              value={currentAnswer}
              onChangeText={(v) => handleAnswer(q.id, v)}
              placeholder="Your answer..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
          )}

          {(q.type === "single_choice" || q.type === "multiple_choice") &&
            opts.map((opt) => {
              const selected =
                q.type === "single_choice"
                  ? currentAnswer === opt
                  : currentAnswer.split(",").includes(opt);
              return (
                <Pressable
                  key={opt}
                  style={[styles.optionRow, selected && styles.optionSelected]}
                  onPress={() => {
                    if (q.type === "single_choice") {
                      handleAnswer(q.id, opt);
                    } else {
                      const current = currentAnswer ? currentAnswer.split(",") : [];
                      const next = current.includes(opt)
                        ? current.filter((x) => x !== opt)
                        : [...current, opt];
                      handleAnswer(q.id, next.join(","));
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={[styles.optionDot, selected && styles.optionDotSelected]}>
                    {selected && <View style={styles.optionDotInner} />}
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              );
            })}

          {q.type === "rating" && (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => {
                const selected = currentAnswer === String(n);
                return (
                  <Pressable
                    key={n}
                    style={[styles.ratingBtn, selected && styles.ratingBtnSelected]}
                    onPress={() => {
                      handleAnswer(q.id, String(n));
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[styles.ratingText, selected && styles.ratingTextSelected]}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.nextBtn, (!hasAnswer || submitting) && styles.nextBtnDisabled]}
            onPress={handleNextQuestion}
            disabled={!hasAnswer || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.nextBtnText}>
                {isLast ? "Submit & Claim KSh 1,000" : "Next"}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const renderQuestion = (
    q: {
      id: number;
      text: string;
      type: string;
      options: string | null;
      orderIndex: number;
    },
    idx: number
  ) => {
    const currentAnswer = answers[q.id] ?? "";
    const opts = q.options ? (JSON.parse(q.options) as string[]) : [];

    return (
      <View key={q.id} style={styles.questionCard}>
        <Text style={styles.qNum}>Question {idx + 1}</Text>
        <Text style={styles.qText}>{q.text}</Text>

        {q.type === "text" && (
          <TextInput
            style={styles.textInput}
            value={currentAnswer}
            onChangeText={(v) => handleAnswer(q.id, v)}
            placeholder="Your answer..."
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        )}

        {(q.type === "single_choice" || q.type === "multiple_choice") &&
          opts.map((opt) => {
            const selected =
              q.type === "single_choice"
                ? currentAnswer === opt
                : currentAnswer.split(",").includes(opt);
            return (
              <Pressable
                key={opt}
                style={[styles.optionRow, selected && styles.optionSelected]}
                onPress={() => {
                  if (q.type === "single_choice") {
                    handleAnswer(q.id, opt);
                  } else {
                    const current = currentAnswer ? currentAnswer.split(",") : [];
                    const next = current.includes(opt)
                      ? current.filter((x) => x !== opt)
                      : [...current, opt];
                    handleAnswer(q.id, next.join(","));
                  }
                }}
              >
                <View style={[styles.optionDot, selected && styles.optionDotSelected]}>
                  {selected && <View style={styles.optionDotInner} />}
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}

        {q.type === "rating" && (
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => {
              const selected = currentAnswer === String(n);
              return (
                <Pressable
                  key={n}
                  style={[styles.ratingBtn, selected && styles.ratingBtnSelected]}
                  onPress={() => handleAnswer(q.id, String(n))}
                >
                  <Text style={[styles.ratingText, selected && styles.ratingTextSelected]}>
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {survey && (
          <View style={styles.rewardBanner}>
            <Text style={styles.rewardLabel}>{survey.title}</Text>
            <Text style={styles.rewardAmount}>KSh {survey.reward}</Text>
          </View>
        )}

        {sortedQuestions.map((q, idx) => renderQuestion(q, idx))}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.submitBtn, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          testID="complete-survey-btn"
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>
              Submit & Earn KSh {survey?.reward ?? 0}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
