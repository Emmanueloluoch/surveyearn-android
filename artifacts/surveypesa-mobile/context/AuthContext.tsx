import AsyncStorage from "@react-native-async-storage/async-storage";
import { setBaseUrl } from "@workspace/api-client-react";
import React, { createContext, useContext, useEffect, useState } from "react";

const AUTH_KEY = "surveypesa_auth";

export interface AuthUser {
  userId: number;
  name: string;
  email: string | null;
  phone: string;
  points: number;
  isActivated: boolean;
  isVip: boolean;
  welcomeSurveyId: number | null;
  referralCode: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updatePoints: (points: number) => void;
  setActivated: (points: number) => void;
  setVip: (points: number) => void;
  updateProfile: (patch: Partial<Pick<AuthUser, "email" | "phone">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((raw) => {
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          // ignore corrupt data
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (authUser: AuthUser) => {
    setUser(authUser);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  };

  const updatePoints = (points: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, points };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setActivated = (points: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, isActivated: true, points };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setVip = (points: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, isVip: true, points };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfile = async (patch: Partial<Pick<AuthUser, "email" | "phone">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updatePoints, setActivated, setVip, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
