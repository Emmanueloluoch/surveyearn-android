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

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (mode === "signup") {
        result = await apiSignup({ name: name.trim(), phone: phone.trim() });
      } else {
        result = await apiLogin({ phone: phone.trim() });
      }
      await login({
        userId: result.userId,
        name: result.name,
        phone: result.phone,
        points: result.points,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
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
      marginBottom: 28,
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
      marginTop: 16,
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
      marginTop: 28,
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
                onPress={() => { setMode("login"); setError(""); }}
              >
                <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>
                  Log In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, mode === "signup" && styles.toggleBtnActive]}
                onPress={() => { setMode("signup"); setError(""); }}
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

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="0712345678"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              testID="phone-input"
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
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
              <Pressable onPress={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
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
