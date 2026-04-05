import { login as apiLogin, signup as apiSignup } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { Feather } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (mode === "signup") {
      if (!name.trim()) { setError("Full name is required"); return; }
      if (!email.trim()) { setError("Email address is required"); return; }
      if (!email.includes("@")) { setError("Please enter a valid email address"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      if (!phone.trim()) { setError("Phone number is required for M-Pesa withdrawals"); return; }
    } else {
      if (!email.trim()) { setError("Email address is required"); return; }
      if (!password) { setError("Password is required"); return; }
    }

    setLoading(true);
    try {
      let result;
      if (mode === "signup") {
        const payload: { name: string; email: string; password: string; phone: string; referralCode?: string } = {
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
        };
        if (referralInput.trim()) {
          payload.referralCode = referralInput.trim().toUpperCase();
        }
        result = await apiSignup(payload);
      } else {
        result = await apiLogin({ email: email.trim(), password });
      }
      await login({
        userId: result.userId,
        name: result.name,
        phone: result.phone,
        points: result.points,
        isActivated: result.isActivated ?? false,
        isVip: result.isVip ?? false,
        welcomeSurveyId: result.welcomeSurveyId ?? null,
        referralCode: result.referralCode ?? null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (mode === "signup" && result.welcomeSurveyId) {
        router.replace(`/survey/${result.welcomeSurveyId}?welcome=true`);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setError("");
    setReferralInput("");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.headerBg,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      paddingTop: insets.top + 40,
      paddingBottom: 40,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    logoText: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: colors.primaryForeground,
    },
    appName: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: "#ffffff",
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginTop: 6,
    },
    card: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 28,
      paddingBottom: insets.bottom + 28,
      flex: 1,
    },
    toggleRow: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: 10,
      padding: 3,
      marginBottom: 24,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    toggleBtnActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    toggleText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    toggleTextActive: {
      color: "#ffffff",
    },
    label: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.foreground,
      marginBottom: 8,
      marginTop: 14,
    },
    optionalLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: colors.foreground,
    },
    passwordRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
    },
    passwordInput: {
      flex: 1,
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: colors.foreground,
      paddingVertical: 14,
    },
    eyeBtn: {
      padding: 4,
    },
    hintText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    errorBox: {
      backgroundColor: "#fff0f0",
      borderRadius: 10,
      padding: 12,
      marginTop: 16,
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
      marginTop: 24,
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: "#ffffff",
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
      gap: 4,
    },
    footerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    footerLink: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>SP</Text>
            </View>
            <Text style={styles.appName}>SurveyPesa KE</Text>
            <Text style={styles.tagline}>Earn KSh by completing surveys</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, mode === "login" && styles.toggleBtnActive]}
                onPress={() => switchMode("login")}
              >
                <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>
                  Log In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, mode === "signup" && styles.toggleBtnActive]}
                onPress={() => switchMode("signup")}
              >
                <Text style={[styles.toggleText, mode === "signup" && styles.toggleTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {mode === "signup" && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jane Kamau"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="words"
                  testID="name-input"
                />
              </>
            )}

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="jane@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder={mode === "signup" ? "Minimum 6 characters" : "Enter your password"}
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                testID="password-input"
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {mode === "signup" && (
              <>
                <Text style={styles.label}>Phone Number <Text style={styles.optionalLabel}>(for M-Pesa)</Text></Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="0712345678"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  testID="phone-input"
                />

                <Text style={styles.label}>Referral Code <Text style={styles.optionalLabel}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  value={referralInput}
                  onChangeText={(t) => setReferralInput(t.toUpperCase())}
                  placeholder="e.g. ABCD1234"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  testID="referral-input"
                />
              </>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.submitBtn, (loading || pressed) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              testID="submit-btn"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitText}>
                  {mode === "signup" ? "Create Account" : "Log In"}
                </Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {mode === "login" ? "New to SurveyPesa?" : "Already have an account?"}
              </Text>
              <Pressable onPress={() => switchMode(mode === "login" ? "signup" : "login")}>
                <Text style={styles.footerLink}>
                  {mode === "login" ? "Sign up" : "Log in"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
