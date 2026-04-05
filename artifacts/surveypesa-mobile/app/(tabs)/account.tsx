import { useGetUser, useUpdateUser } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, updateProfile } = useAuth();

  const { data: userData } = useGetUser(user?.userId ?? 0, {
    query: { enabled: !!user?.userId },
  });

  const { mutate: patchUser, isPending: isSaving } = useUpdateUser();

  const [editField, setEditField] = useState<"email" | "phone" | null>(null);
  const [editValue, setEditValue] = useState("");

  const currentPoints = userData?.points ?? user?.points ?? 0;
  const joinDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-KE", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const displayEmail = userData?.email ?? user?.email ?? "—";
  const displayPhone = userData?.phone ?? user?.phone ?? "—";

  const openEdit = (field: "email" | "phone") => {
    Haptics.selectionAsync();
    setEditValue(
      field === "email"
        ? (userData?.email ?? user?.email ?? "")
        : (userData?.phone ?? user?.phone ?? "")
    );
    setEditField(field);
  };

  const closeEdit = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSave = () => {
    if (!user?.userId || !editField) return;

    const trimmed = editValue.trim();
    if (!trimmed) {
      Alert.alert("Invalid", `Please enter a valid ${editField}.`);
      return;
    }

    if (editField === "email" && !trimmed.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    patchUser(
      { id: user.userId, data: { [editField]: trimmed } },
      {
        onSuccess: (result) => {
          updateProfile({
            email: result.email ?? undefined,
            phone: result.phone,
          });
          queryClient.invalidateQueries({ queryKey: [`/api/users/${user.userId}`] });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          closeEdit();
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : "Could not save changes.";
          Alert.alert("Error", msg);
        },
      }
    );
  };

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

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
      marginBottom: 12,
    },

    profileCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(255,255,255,0.22)",
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
      marginBottom: 2,
    },
    emailText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      marginBottom: 12,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
      justifyContent: "center",
      marginBottom: 16,
    },
    badge: {
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    badgeText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: "#ffffff",
    },
    balanceRow: {
      width: "100%",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    balanceLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
    },
    balanceValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: "#ffffff",
    },

    body: {
      padding: 16,
      paddingBottom: bottomPad,
      gap: 4,
    },
    sectionLabel: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 6,
      marginTop: 14,
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
    editHint: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginLeft: 4,
    },
    joinedText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 20,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: insets.bottom + 24,
    },
    modalTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.foreground,
      marginBottom: 16,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.primary,
      paddingHorizontal: 12,
      marginBottom: 20,
    },
    input: {
      flex: 1,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.foreground,
      paddingVertical: 12,
    },
    btnRow: {
      flexDirection: "row",
      gap: 12,
    },
    btnCancel: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    btnCancelText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.mutedForeground,
    },
    btnSave: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    btnSaveText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: "#ffffff",
    },
  });

  const fieldLabel = editField === "email" ? "Email Address" : "Phone Number";

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Profile</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.displayName}>{user?.name ?? "User"}</Text>
            <Text style={styles.emailText}>{displayEmail}</Text>

            <View style={styles.badgeRow}>
              {user?.isVip ? (
                <View style={[styles.badge, { backgroundColor: "#7c3aed" }]}>
                  <Text style={styles.badgeText}>👑 VIP Member</Text>
                </View>
              ) : user?.isActivated ? (
                <>
                  <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                    <Text style={styles.badgeText}>✓ Active Member</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                    <Text style={styles.badgeText}>6 surveys/day</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.badge, { backgroundColor: "#ff6b35" }]}>
                    <Text style={styles.badgeText}>Activation Pending</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                    <Text style={styles.badgeText}>Free Member</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue}>KSh {currentPoints.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Settings</Text>
          <View style={styles.menuCard}>
            <Pressable
              style={styles.menuItem}
              onPress={() => openEdit("email")}
            >
              <View style={styles.menuIcon}>
                <Feather name="mail" size={18} color={colors.mutedForeground} />
              </View>
              <Text style={styles.menuText}>{displayEmail}</Text>
              <Feather name="edit-2" size={14} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => openEdit("phone")}
            >
              <View style={styles.menuIcon}>
                <Feather name="phone" size={18} color={colors.mutedForeground} />
              </View>
              <Text style={styles.menuText}>{displayPhone}</Text>
              <Feather name="edit-2" size={14} color={colors.mutedForeground} />
            </Pressable>
            <View style={[styles.menuItem, styles.menuItemLast]}>
              <View style={styles.menuIcon}>
                <Feather name="calendar" size={18} color={colors.mutedForeground} />
              </View>
              <Text style={styles.menuText}>Member since {joinDate}</Text>
            </View>
          </View>

          {!user?.isActivated && (
            <>
              <Text style={styles.sectionLabel}>Activation</Text>
              <View style={styles.menuCard}>
                <Pressable
                  style={[styles.menuItem, styles.menuItemLast]}
                  onPress={() => router.push("/activate")}
                >
                  <View style={styles.menuIcon}>
                    <Feather name="unlock" size={18} color="#ff6b35" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.menuText, { color: "#ff6b35", marginLeft: 0 }]}>Activate Account</Text>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>
                      Pay KSh 150 via M-Pesa · Unlock 6 daily surveys
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#ff6b35" />
                </Pressable>
              </View>
            </>
          )}

          {user?.isActivated && !user?.isVip && (
            <>
              <Text style={styles.sectionLabel}>VIP Access</Text>
              <View style={styles.menuCard}>
                <Pressable
                  style={[styles.menuItem, styles.menuItemLast]}
                  onPress={() => router.push("/vip")}
                >
                  <View style={styles.menuIcon}>
                    <Text style={{ fontSize: 18 }}>👑</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.menuText, { color: "#7c3aed", marginLeft: 0 }]}>Upgrade to VIP</Text>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>
                      Pay KSh 500 via M-Pesa · Unlimited surveys
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#7c3aed" />
                </Pressable>
              </View>
            </>
          )}

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

          <Text style={styles.joinedText}>SurveyEarn v1.0</Text>
        </View>
      </ScrollView>

      <Modal
        visible={editField !== null}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={{ flex: 1 }} onPress={closeEdit} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Edit {fieldLabel}</Text>

            <View style={styles.inputWrapper}>
              <Feather
                name={editField === "email" ? "mail" : "phone"}
                size={16}
                color={colors.mutedForeground}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={editField === "email" ? "your@email.com" : "07XXXXXXXX"}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={editField === "email" ? "email-address" : "phone-pad"}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <View style={styles.btnRow}>
              <Pressable style={styles.btnCancel} onPress={closeEdit}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btnSave, isSaving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.btnSaveText}>
                  {isSaving ? "Saving…" : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
