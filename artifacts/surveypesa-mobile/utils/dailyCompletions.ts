import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "surveypesa_daily";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DailyData {
  date: string;
  completedIds: number[];
}

export async function getDailyCompletions(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const data: DailyData = JSON.parse(raw);
    if (data.date !== todayUTC()) {
      await AsyncStorage.setItem(KEY, JSON.stringify({ date: todayUTC(), completedIds: [] }));
      return [];
    }
    return data.completedIds;
  } catch {
    return [];
  }
}

export async function addDailyCompletion(surveyId: number): Promise<void> {
  try {
    const current = await getDailyCompletions();
    if (!current.includes(surveyId)) {
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify({ date: todayUTC(), completedIds: [...current, surveyId] })
      );
    }
  } catch {
    // ignore
  }
}
