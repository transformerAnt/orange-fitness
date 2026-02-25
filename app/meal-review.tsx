import { Design } from "@/constants/design";
import { apiPost } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

type FoodAnalysis = {
  items: {
    name: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  }[];
  totalCalories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  raw?: string;
};

export default function MealReviewScreen() {
  const { user } = useUser();
  const { imageUri, mealType } = useLocalSearchParams<{
    imageUri: string;
    mealType: string;
  }>();
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toBase64 = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to read image."));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    const run = async () => {
      if (!imageUri) return;
      setLoading(true);
      const dataUrl = await toBase64(imageUri);
      const response = await apiPost<FoodAnalysis>("/food/analyze", {
        imageBase64: dataUrl,
      });
      setLoading(false);
      if (response.error) {
        alert(response.error);
        return;
      }
      setAnalysis(response.data);
    };
    run();
  }, [imageUri]);

  const totals = useMemo(() => {
    return {
      calories: analysis?.totalCalories ?? 0,
      protein: analysis?.protein_g ?? 0,
      carbs: analysis?.carbs_g ?? 0,
      fat: analysis?.fat_g ?? 0,
    };
  }, [analysis]);

  const addMeal = async () => {
    if (!analysis) return;
    setSaving(true);
    if (!user?.id) {
      setSaving(false);
      alert("Please sign in to save.");
      return;
    }

    await supabase.from("food_logs").insert({
      user_id: user.id,
      image_url: null,
      source: "mistral",
      items: analysis.items ?? [],
      total_calories: analysis.totalCalories ?? null,
      protein_g: analysis.protein_g ?? null,
      carbs_g: analysis.carbs_g ?? null,
      fat_g: analysis.fat_g ?? null,
      meal_type: mealType ?? "Breakfast",
    });
    setSaving(false);
    router.replace("/(tabs)/calories");
  };

  return (
    <SafeAreaProvider
      style={{ flex: 1, backgroundColor: Design.colors.background }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: Design.colors.background }}
      >
        <View
          style={{
            paddingHorizontal: Design.spacing.lg,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
              Back
            </Text>
          </Pressable>
          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 22,
              fontFamily: Design.typography.fontBold,
            }}
          >
            Meal Review
          </Text>
          <Text
            style={{ color: Design.colors.muted, fontSize: 12, marginTop: 4 }}
          >
            {mealType || "Meal"}
          </Text>

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: 240,
                borderRadius: 18,
                marginTop: 16,
              }}
            />
          ) : null}

          <View
            style={{
              marginTop: 16,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Design.colors.line,
              padding: 16,
              backgroundColor: Design.colors.surface,
            }}
          >
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 14,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              Macro Breakdown
            </Text>
            <Text
              style={{ color: Design.colors.muted, fontSize: 12, marginTop: 8 }}
            >
              {loading ? "Analyzing..." : `${Math.round(totals.calories)} kcal`}
            </Text>
            {!loading ? (
              <View style={{ marginTop: 12 }}>
                {[
                  {
                    label: "Protein",
                    value: totals.protein,
                    unit: "g",
                    color: "#4F46E5",
                  },
                  {
                    label: "Carbs",
                    value: totals.carbs,
                    unit: "g",
                    color: "#22C55E",
                  },
                  {
                    label: "Fat",
                    value: totals.fat,
                    unit: "g",
                    color: "#F59E0B",
                  },
                ].map((macro) => (
                  <View key={macro.label} style={{ marginBottom: 10 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ color: Design.colors.ink, fontSize: 12 }}>
                        {macro.label}
                      </Text>
                      <Text
                        style={{ color: Design.colors.muted, fontSize: 12 }}
                      >
                        {Math.round(macro.value)} {macro.unit}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        borderRadius: 6,
                        backgroundColor: Design.colors.line,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: 6,
                          width: `${Math.min(100, (macro.value / (totals.calories || 1)) * 100)}%`,
                          backgroundColor: macro.color,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {analysis?.items?.length ? (
            <View
              style={{
                marginTop: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Design.colors.line,
                padding: 16,
                backgroundColor: Design.colors.surface,
              }}
            >
              <Text
                style={{
                  color: Design.colors.ink,
                  fontSize: 14,
                  fontFamily: Design.typography.fontSemiBold,
                }}
              >
                Items
              </Text>
              {analysis.items.map((item) => (
                <Text
                  key={item.name}
                  style={{
                    color: Design.colors.muted,
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  • {item.name} ({item.calories ?? "—"} kcal)
                </Text>
              ))}
            </View>
          ) : analysis?.raw ? (
            <View
              style={{
                marginTop: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Design.colors.line,
                padding: 16,
                backgroundColor: Design.colors.surface,
              }}
            >
              <Text
                style={{
                  color: Design.colors.ink,
                  fontSize: 14,
                  fontFamily: Design.typography.fontSemiBold,
                }}
              >
                Raw AI Response
              </Text>
              <Text
                style={{
                  color: Design.colors.muted,
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                {analysis.raw}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={addMeal}
            disabled={loading || saving || !analysis}
            style={{
              marginTop: 18,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor:
                loading || saving || !analysis
                  ? Design.colors.line
                  : Design.colors.accent,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              {saving ? "Saving..." : "Add Meal"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
