import { addDays, demoToday, toDateKey } from "@/lib/data/date";

const IOS_DAILY = [8, 8, 8, 8, 7, 6, 1, 2, 1, 1, 1, 1, 1, 1] as const;
const ANDROID_DAILY = [5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 3, 3, 3, 3] as const;

export function createDailyDemoTimeline(asOf: Date = new Date()) {
  const today = demoToday(asOf);
  return IOS_DAILY.map((ios, index) => ({
    date: toDateKey(addDays(today, index - 13)),
    ios,
    android: ANDROID_DAILY[index]!,
  }));
}
