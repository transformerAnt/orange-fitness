import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Design } from "@/constants/design";
import { supabase } from "@/lib/supabase";

import { apiPost } from "@/lib/api";

type FoodLogRow = {
  id: string;
  logged_at: string;
  meal_type: string | null;
  total_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  items: any; // jsonb
};

const MEAL_LABELS = [
  "Breakfast",
  "Lunch",
  "Brunch",
  "Dinner",
  "Snacks",
] as const;

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const formatDayChip = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short" });
const formatDayNum = (d: Date) =>
  d.toLocaleDateString("en-US", { day: "2-digit" });
const formatMonth = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short" });

function clampNum(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Nutrition autofill calling the backend.
 * Expected output: { calories, protein_g, carbs_g, fat_g }
 */
async function fetchNutritionAutofill(foodName: string) {
  const q = foodName.trim();
  if (q.length < 3) return null;

  const response = await apiPost<{
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>("/food/autofill", { foodName: q });

  if (response.error || !response.data) {
    return null;
  }
  console.log(response);

  return response.data;
}

export default function TextLogCaloriesScreen() {
  const daysScrollRef = useRef<ScrollView>(null);
  const didAutoScroll = useRef(false);
  const { user, isLoaded } = useUser();
  const [days, setDays] = useState<Date[]>(() => {
    const today = startOfDay(new Date());
    // date-wise scroll: last 14 days including today
    return Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  });
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    startOfDay(new Date()),
  );

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<FoodLogRow[]>([]);
  const [profileGoal, setProfileGoal] = useState<number>(2000);

  // Add dialog state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);

  const [mealType, setMealType] =
    useState<(typeof MEAL_LABELS)[number]>("Breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fat, setFat] = useState<string>("");

  const loadProfile = useCallback(async () => {
    if (!isLoaded || !user?.id) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("calorie_goal")
      .eq("id", user.id)
      .single();

    if (profile?.calorie_goal) setProfileGoal(profile.calorie_goal);
  }, [isLoaded, user?.id]);

  const loadLogsForDay = useCallback(
    async (day: Date) => {
      setLoading(true);
      try {
        if (!isLoaded || !user?.id) {
          setLogs([]);
          return;
        }

        const start = startOfDay(day);
        const end = endOfDay(day);

        const { data, error } = await supabase
          .from("food_logs")
          .select(
            "id,logged_at,meal_type,total_calories,protein_g,carbs_g,fat_g,items",
          )
          .eq("user_id", user.id)
          .gte("logged_at", start.toISOString())
          .lte("logged_at", end.toISOString())
          .order("logged_at", { ascending: false });

        if (error) throw error;

        setLogs((data ?? []) as FoodLogRow[]);
      } catch (e: any) {
        setLogs([]);
        Alert.alert("Could not load logs", e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, user?.id],
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadLogsForDay(selectedDate);
  }, [selectedDate, loadLogsForDay]);

  const dayTotals = useMemo(() => {
    let kcal = 0,
      p = 0,
      c = 0,
      f = 0;
    for (const row of logs) {
      kcal += Number(row.total_calories ?? 0);
      p += Number(row.protein_g ?? 0);
      c += Number(row.carbs_g ?? 0);
      f += Number(row.fat_g ?? 0);
    }
    return { kcal, p, c, f };
  }, [logs]);

  const remaining = Math.max(0, profileGoal - dayTotals.kcal);

  const resetDialog = () => {
    setMealType("Breakfast");
    setFoodName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  };

  const openDialog = () => {
    resetDialog();
    setOpen(true);
  };

  const tryAutofill = async () => {
    const q = foodName.trim();
    if (!q) return;
    setAutofillLoading(true);
    console.log("Hii", q);
    try {
      const out = await fetchNutritionAutofill(q);
      console.log(out);
      console.log("Autofill nutrition response:", out);

      if (!out) return;

      // expected: { calories, protein_g, carbs_g, fat_g }
      if (out.calories != null) setCalories(String(out.calories));
      if (out.protein_g != null) setProtein(String(out.protein_g));
      if (out.carbs_g != null) setCarbs(String(out.carbs_g));
      if (out.fat_g != null) setFat(String(out.fat_g));
    } catch (error) {
      console.log("Autofill error:", error);
    } finally {
      setAutofillLoading(false);
    }
  };

  const saveLog = async () => {
    const name = foodName.trim();
    if (!name) {
      Alert.alert("Missing food name", "Enter a food name.");
      return;
    }

    const kcal = clampNum(calories, 0);
    const p = clampNum(protein, 0);
    const c = clampNum(carbs, 0);
    const f = clampNum(fat, 0);

    if (kcal <= 0 && p + c + f <= 0) {
      Alert.alert("Missing nutrition", "Enter calories or at least one macro.");
      return;
    }

    setSaving(true);
    try {
      if (!isLoaded || !user?.id) {
        Alert.alert("Not signed in", "Please sign in again.");
        return;
      }

      const payload = {
        user_id: user.id,
        logged_at: new Date(selectedDate).toISOString(),
        meal_type: mealType,
        source: "manual",
        items: [
          {
            name,
            calories: kcal,
            protein_g: p,
            carbs_g: c,
            fat_g: f,
          },
        ],
        total_calories: kcal || Math.round(p * 4 + c * 4 + f * 9),
        protein_g: Math.round(p),
        carbs_g: Math.round(c),
        fat_g: Math.round(f),
        corrected: true,
      };

      const { error } = await supabase.from("food_logs").insert(payload);
      if (error) throw error;

      setOpen(false);
      await loadLogsForDay(selectedDate);
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Design.colors.background }}
    >
      <View
        style={{
          paddingHorizontal: Design.spacing.lg,
          paddingTop: 14,
          paddingBottom: 10,
        }}
      >
        <Text
          style={{
            color: Design.colors.ink,
            fontSize: 26,
            fontFamily: Design.typography.fontBold,
          }}
        >
          Calories
        </Text>
        <Text
          style={{ color: Design.colors.muted, marginTop: 6, fontSize: 12 }}
        >
          {formatMonth(selectedDate)} {formatDayNum(selectedDate)} · Goal{" "}
          {Math.round(profileGoal)} kcal · Remaining {Math.round(remaining)}{" "}
          kcal
        </Text>

        <ScrollView
          ref={daysScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14 }}
          onContentSizeChange={() => {
            if (!didAutoScroll.current) {
              daysScrollRef.current?.scrollToEnd({ animated: true });
              didAutoScroll.current = true;
            }
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, paddingRight: 12 }}>
            {days.map((d) => {
              const active =
                d.getFullYear() === selectedDate.getFullYear() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getDate() === selectedDate.getDate();
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => setSelectedDate(startOfDay(d))}
                  style={{
                    width: 68,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: active
                      ? Design.colors.accent
                      : Design.colors.line,
                    backgroundColor: active
                      ? Design.colors.accentSoft
                      : Design.colors.surface,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: Design.colors.muted,
                      fontSize: 11,
                      fontFamily: Design.typography.fontSemiBold,
                    }}
                  >
                    {formatDayChip(d)}
                  </Text>
                  <Text
                    style={{
                      color: Design.colors.ink,
                      fontSize: 16,
                      fontFamily: Design.typography.fontBold,
                      marginTop: 4,
                    }}
                  >
                    {formatDayNum(d)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Design.colors.line,
              backgroundColor: Design.colors.surface,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 12,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              Today totals
            </Text>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 20,
                fontFamily: Design.typography.fontBold,
                marginTop: 6,
              }}
            >
              {Math.round(dayTotals.kcal)} kcal
            </Text>
            <Text
              style={{ color: Design.colors.muted, fontSize: 12, marginTop: 6 }}
            >
              P {Math.round(dayTotals.p)}g · C {Math.round(dayTotals.c)}g · F{" "}
              {Math.round(dayTotals.f)}g
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Design.colors.line,
              backgroundColor: Design.colors.surface,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 12,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              Quick add
            </Text>
            <Text
              style={{ color: Design.colors.muted, fontSize: 12, marginTop: 6 }}
            >
              Text-based logging .
            </Text>
            <Pressable
              onPress={openDialog}
              style={{
                marginTop: 10,
                borderRadius: 12,
                backgroundColor: Design.colors.ink,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: Design.typography.fontSemiBold,
                  fontSize: 12,
                }}
              >
                Add food
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: Design.spacing.lg }}>
        <Text
          style={{
            color: Design.colors.ink,
            fontSize: 14,
            fontFamily: Design.typography.fontSemiBold,
            marginBottom: 10,
          }}
        >
          Entries
        </Text>

        {loading ? (
          <View style={{ paddingTop: 20, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : logs.length === 0 ? (
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Design.colors.line,
              backgroundColor: Design.colors.surface,
              padding: 14,
            }}
          >
            <Text style={{ color: Design.colors.ink, fontSize: 13 }}>
              No logs for this day.
            </Text>
            <Text
              style={{ color: Design.colors.muted, fontSize: 12, marginTop: 6 }}
            >
              Tap the + button to add your first entry.
            </Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 110 }}
            renderItem={({ item }) => {
              const name =
                Array.isArray(item.items) && item.items[0]?.name
                  ? String(item.items[0].name)
                  : "Food";
              const meal = item.meal_type ? String(item.meal_type) : "Meal";
              return (
                <View
                  style={{
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: Design.colors.line,
                    backgroundColor: Design.colors.surface,
                    padding: 14,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: Design.colors.ink,
                        fontFamily: Design.typography.fontSemiBold,
                        fontSize: 13,
                      }}
                    >
                      {name}
                    </Text>
                    <Text
                      style={{
                        color: Design.colors.ink,
                        fontFamily: Design.typography.fontBold,
                        fontSize: 13,
                      }}
                    >
                      {Math.round(Number(item.total_calories ?? 0))} kcal
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: Design.colors.muted,
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    {meal} · P {Math.round(Number(item.protein_g ?? 0))}g · C{" "}
                    {Math.round(Number(item.carbs_g ?? 0))}g · F{" "}
                    {Math.round(Number(item.fat_g ?? 0))}g
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Floating Add Button */}
      <Pressable
        onPress={openDialog}
        style={{
          position: "absolute",
          right: 18,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: Design.colors.ink,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={22} color="#fff" />
      </Pressable>

      {/* Add Dialog */}
      <Modal visible={open} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              backgroundColor: Design.colors.surface,
              paddingHorizontal: Design.spacing.lg,
              paddingTop: 14,
              paddingBottom: 20,
              borderWidth: 1,
              borderColor: Design.colors.line,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Design.colors.ink,
                  fontFamily: Design.typography.fontBold,
                  fontSize: 16,
                }}
              >
                Add food
              </Text>
              <Pressable onPress={() => setOpen(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={20} color={Design.colors.ink} />
              </Pressable>
            </View>

            <Text
              style={{ color: Design.colors.muted, fontSize: 12, marginTop: 6 }}
            >
              {formatMonth(selectedDate)} {formatDayNum(selectedDate)}
            </Text>

            {/* Meal type pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12 }}
            >
              <View style={{ flexDirection: "row", gap: 8, paddingRight: 12 }}>
                {MEAL_LABELS.map((m) => {
                  const active = mealType === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMealType(m)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: active
                          ? Design.colors.ink
                          : Design.colors.line,
                        backgroundColor: active
                          ? Design.colors.ink
                          : Design.colors.surface,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? "#fff" : Design.colors.ink,
                          fontFamily: Design.typography.fontSemiBold,
                          fontSize: 12,
                        }}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Inputs */}
            <View style={{ marginTop: 14, gap: 10 }}>
              <View>
                <Text
                  style={{
                    color: Design.colors.ink,
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  Food name
                </Text>
                <View
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: Design.colors.line,
                    backgroundColor: "rgba(255,255,255,0.7)",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <TextInput
                    value={foodName}
                    onChangeText={setFoodName}
                    placeholder="e.g., paneer bhurji"
                    placeholderTextColor={Design.colors.muted}
                    style={{
                      flex: 1,
                      color: Design.colors.ink,
                      fontSize: 13,
                    }}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onBlur={tryAutofill}
                  />
                  <Pressable
                    onPress={tryAutofill}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: Design.colors.line,
                      backgroundColor: Design.colors.surface,
                    }}
                    disabled={autofillLoading}
                  >
                    {autofillLoading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={{ color: Design.colors.ink, fontSize: 12 }}>
                        Autofill
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: Design.colors.ink,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    Calories (kcal)
                  </Text>
                  <TextInput
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Design.colors.muted}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: Design.colors.line,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: Design.colors.ink,
                      fontSize: 13,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: Design.colors.ink,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    Protein (g)
                  </Text>
                  <TextInput
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Design.colors.muted}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: Design.colors.line,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: Design.colors.ink,
                      fontSize: 13,
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: Design.colors.ink,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    Carbs (g)
                  </Text>
                  <TextInput
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Design.colors.muted}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: Design.colors.line,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: Design.colors.ink,
                      fontSize: 13,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: Design.colors.ink,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    Fat (g)
                  </Text>
                  <TextInput
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Design.colors.muted}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: Design.colors.line,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: Design.colors.ink,
                      fontSize: 13,
                    }}
                  />
                </View>
              </View>

              <Pressable
                onPress={saveLog}
                disabled={saving}
                style={{
                  marginTop: 6,
                  borderRadius: 14,
                  backgroundColor: Design.colors.ink,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: Design.typography.fontSemiBold,
                      fontSize: 13,
                    }}
                  >
                    Save
                  </Text>
                )}
              </Pressable>

              <Text
                style={{
                  color: Design.colors.muted,
                  fontSize: 11,
                  marginTop: 8,
                }}
              ></Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
