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

  const loading = surveyLoading || questionsLoading;

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

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

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
    textInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.foreground,
      minHeight: 80,
      textAlignVertical: "top",
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      marginBottom: 6,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}18`,
    },
    optionDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    optionDotSelected: {
      borderColor: colors.primary,
    },
    optionDotInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    optionText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
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
      maxWidth: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    ratingBtnSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    ratingText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
    },
    ratingTextSelected: {
      color: "#ffffff",
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
          <View style={[styles.doneBadge, { backgroundColor: colors.headerBg, width: 96, height: 96, borderRadius: 48 }]}>
            <Text style={[styles.doneBadgeText, { fontSize: 44 }]}>★</Text>
          </View>
          <Text style={[styles.doneTitle, { fontSize: 28, marginTop: 8 }]}>
            Welcome Bonus Unlocked!
          </Text>
          <View style={{
            backgroundColor: colors.primary,
            borderRadius: 14,
            paddingHorizontal: 24,
            paddingVertical: 12,
            marginVertical: 12,
          }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 32, color: "#ffffff", textAlign: "center" }}>
              +KSh {earned}
            </Text>
          </View>
          <Text style={styles.doneSub}>
            Your KSh 1,000 welcome bonus has been added to your wallet.{"\n"}
            Start completing more surveys to earn even more!
          </Text>
          <Pressable
            style={[styles.doneBtn, { paddingHorizontal: 48 }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.doneBtnText}>Start Earning</Text>
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

  const renderQuestion = (q: {
    id: number;
    text: string;
    type: string;
    options: string | null;
    orderIndex: number;
  }, idx: number) => {
    const currentAnswer = answers[q.id] ?? "";
    const opts = q.options
      ? (JSON.parse(q.options) as string[])
      : [];

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
            const selected = q.type === "single_choice"
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
                    const current = currentAnswer
                      ? currentAnswer.split(",")
                      : [];
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
        {isWelcome ? (
          <View style={[styles.rewardBanner, { backgroundColor: colors.headerBg, flexDirection: "column", alignItems: "flex-start", gap: 6 }]}>
            <Text style={[styles.rewardAmount, { fontSize: 20 }]}>Welcome Bonus</Text>
            <Text style={[styles.rewardLabel, { lineHeight: 20 }]}>
              Answer {(questions ?? []).length} quick questions about yourself to unlock your{" "}
              <Text style={{ fontFamily: "Inter_700Bold" }}>KSh 1,000</Text> welcome bonus!
            </Text>
          </View>
        ) : survey ? (
          <View style={styles.rewardBanner}>
            <Text style={styles.rewardLabel}>{survey.title}</Text>
            <Text style={styles.rewardAmount}>KSh {survey.reward}</Text>
          </View>
        ) : null}

        {(questions ?? [])
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((q, idx) => renderQuestion(q, idx))}

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
            <Text style={styles.submitText}>Submit & Earn KSh {survey?.reward ?? 0}</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
