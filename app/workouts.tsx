import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";

import { Design } from "@/constants/design";
import { apiGet } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Plan = { id: string; name: string };
type ExerciseDbItem = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  description?: string;
  difficulty?: string;
  category?: string;
  gifUrl?: string;
};

export default function WorkoutsScreen() {
  const { user, isLoaded } = useUser();
  const [selectedBodyPart, setSelectedBodyPart] = useState("all");
  const [planName, setPlanName] = useState("My Plan");
  const [planExerciseIds, setPlanExerciseIds] = useState<string[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [exercises, setExercises] = useState<ExerciseDbItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyParts, setBodyParts] = useState<string[]>(["all"]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const WORKOUT_TEMPLATES = [
    "Bicep + Tricep",
    "Chest + Tricep",
    "Back + Bicep",
    "Leg Day",
    "Shoulders + Core",
    "Full Body",
  ];

  const derivedBodyParts = useMemo(() => {
    const parts = new Set<string>();
    exercises.forEach((exercise) => {
      if (exercise.bodyPart) {
        parts.add(exercise.bodyPart);
      }
    });
    return ["all", ...Array.from(parts)];
  }, [exercises]);
  const visibleBodyParts = bodyParts.length > 1 ? bodyParts : derivedBodyParts;

  const filteredExercises = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesBodyPart =
        selectedBodyPart === "all" || exercise.bodyPart === selectedBodyPart;
      if (!matchesBodyPart) return false;
      if (!normalized) return true;
      const haystack = [
        exercise.name,
        exercise.bodyPart,
        exercise.target,
        exercise.equipment,
        ...(exercise.secondaryMuscles ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [selectedBodyPart, exercises, searchQuery]);

  const planExercises = useMemo(
    () => exercises.filter((exercise) => planExerciseIds.includes(exercise.id)),
    [planExerciseIds, exercises],
  );

  useEffect(() => {
    const loadBodyParts = async () => {
      const response = await apiGet<string[]>("/exercises/body-parts");
      if (
        response.data &&
        !response.error &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setBodyParts(["all", ...response.data]);
      }
    };
    loadBodyParts();
  }, []);

  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      setLoadError(null);
      const params =
        selectedBodyPart === "all"
          ? ""
          : `?bodyPart=${encodeURIComponent(selectedBodyPart)}`;
      const response = await apiGet<ExerciseDbItem[]>(`/exercises${params}`);
      if (response.data && !response.error && Array.isArray(response.data)) {
        setExercises(response.data);
      } else {
        setExercises([]);
        setLoadError(response.error ?? "Unable to load exercises.");
      }
      setIsLoading(false);
    };
    loadExercises();
  }, [selectedBodyPart]);

  const loadPlans = async () => {
    if (!isLoaded || !user?.id) {
      setPlans([]);
      return;
    }
    const { data, error } = await supabase
      .from("plans")
      .select("id,name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setPlans(data);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [isLoaded, user?.id]);

  const savePlan = async () => {
    if (!isLoaded || !user?.id) {
      alert("Please sign in to save your plan.");
      return;
    }
    if (planExerciseIds.length === 0) {
      alert("Add at least one exercise to your plan.");
      return;
    }
    setIsSaving(true);
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .insert({ user_id: user.id, name: planName })
      .select("id")
      .single();
    if (planError || !plan) {
      setIsSaving(false);
      alert("Could not save plan.");
      return;
    }
    const planItems = planExercises.map((exercise) => ({
      plan_id: plan.id,
      exercise_id: exercise.id,
      name: exercise.name,
      body_parts: [exercise.bodyPart],
      target_muscles: [exercise.target],
      equipments: [exercise.equipment],
      difficulty: exercise.difficulty ?? "unknown",
    }));
    const { error: itemsError } = await supabase
      .from("plan_exercises")
      .insert(planItems);
    if (itemsError) {
      setIsSaving(false);
      alert("Could not save plan exercises.");
      return;
    }
    setPlanExerciseIds([]);
    setShowPlanModal(false);
    setIsSaving(false);
    loadPlans();
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
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 18,
                fontFamily: Design.typography.fontSemiBold,
                marginBottom: 12,
              }}
            >
              Search & Filter
            </Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by equipment, muscle..."
              placeholderTextColor={Design.colors.muted}
              style={{
                borderColor: Design.colors.border,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
                backgroundColor: Design.colors.surface,
                color: Design.colors.ink,
                fontFamily: Design.typography.fontRegular,
              }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", paddingRight: 20 }}>
                {visibleBodyParts.map((part) => {
                  const isActive = selectedBodyPart === part;
                  return (
                    <Pressable
                      key={part}
                      onPress={() => setSelectedBodyPart(part)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 18,
                        borderRadius: 12,
                        backgroundColor: isActive
                          ? Design.colors.violet
                          : Design.colors.surface,
                        borderColor: isActive
                          ? Design.colors.violet
                          : Design.colors.border,
                        borderWidth: 1,
                        marginRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: isActive
                            ? Design.colors.white
                            : Design.colors.ink,
                          fontSize: 13,
                          fontFamily: Design.typography.fontSemiBold,
                          textTransform: "capitalize",
                        }}
                      >
                        {part}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: Design.colors.ink,
                  fontSize: 18,
                  fontFamily: Design.typography.fontSemiBold,
                }}
              >
                Results ({filteredExercises.length})
              </Text>
              <Pressable
                onPress={() => setShowPlanModal(true)}
                style={{
                  backgroundColor: Design.colors.lime,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: Design.colors.black,
                    fontFamily: Design.typography.fontBold,
                    fontSize: 13,
                  }}
                >
                  My Plan ({planExerciseIds.length})
                </Text>
              </Pressable>
            </View>

            {isLoading ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: Design.colors.muted, fontSize: 14 }}>
                  Loading from API...
                </Text>
              </View>
            ) : loadError ? (
              <Text style={{ color: "#FF4444", fontSize: 14 }}>
                {loadError}
              </Text>
            ) : filteredExercises.length === 0 ? (
              <Text style={{ color: Design.colors.muted, fontSize: 14 }}>
                No exercises found. Try a different filter.
              </Text>
            ) : null}

            {filteredExercises.map((exercise) => (
              <View
                key={exercise.id}
                style={{
                  borderColor: Design.colors.border,
                  borderRadius: 24,
                  borderWidth: 1,
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: Design.colors.surface,
                  ...Design.shadow.soft,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Image
                    source={
                      exercise.gifUrl
                        ? { uri: exercise.gifUrl }
                        : require("../assets/images/icon.png")
                    }
                    resizeMode="cover"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      marginRight: 16,
                      backgroundColor: "#000",
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: Design.colors.ink,
                        fontSize: 18,
                        fontFamily: Design.typography.fontBold,
                        marginBottom: 4,
                      }}
                    >
                      {exercise.name}
                    </Text>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}
                    >
                      <View
                        style={{
                          backgroundColor: "rgba(125, 57, 235, 0.2)",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: Design.colors.violet,
                            fontSize: 10,
                            fontFamily: Design.typography.fontBold,
                          }}
                        >
                          {exercise.bodyPart}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: "rgba(198, 255, 51, 0.2)",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: Design.colors.lime,
                            fontSize: 10,
                            fontFamily: Design.typography.fontBold,
                          }}
                        >
                          {exercise.target}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => router.push(`/exercise/${exercise.id}`)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: Design.colors.surface,
                      borderWidth: 1,
                      borderColor: Design.colors.border,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: Design.colors.ink,
                        fontSize: 13,
                        fontFamily: Design.typography.fontBold,
                      }}
                    >
                      View Details
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (!planExerciseIds.includes(exercise.id)) {
                        setPlanExerciseIds((prev) => [...prev, exercise.id]);
                      } else {
                        setPlanExerciseIds((prev) =>
                          prev.filter((id) => id !== exercise.id),
                        );
                      }
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: planExerciseIds.includes(exercise.id)
                        ? Design.colors.violet
                        : "transparent",
                      borderColor: Design.colors.violet,
                      borderWidth: 1,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: planExerciseIds.includes(exercise.id)
                          ? Design.colors.white
                          : Design.colors.violet,
                        fontSize: 13,
                        fontFamily: Design.typography.fontBold,
                      }}
                    >
                      {planExerciseIds.includes(exercise.id)
                        ? "Added"
                        : "Add to Plan"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={showPlanModal}
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              backgroundColor: Design.colors.surface,
              padding: 24,
              paddingBottom: 40,
              borderColor: Design.colors.border,
              borderTopWidth: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: Design.colors.ink,
                  fontSize: 22,
                  fontFamily: Design.typography.fontBold,
                }}
              >
                Complete Your Plan
              </Text>
              <Pressable
                onPress={() => setShowPlanModal(false)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={24} color={Design.colors.ink} />
              </Pressable>
            </View>

            <Text
              style={{
                color: Design.colors.muted,
                fontSize: 14,
                marginBottom: 8,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              Plan Name
            </Text>
            <TextInput
              value={planName}
              onChangeText={setPlanName}
              placeholder="e.g. Leg Day"
              placeholderTextColor={Design.colors.muted}
              style={{
                borderColor: Design.colors.border,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 24,
                backgroundColor: Design.colors.background,
                color: Design.colors.ink,
                fontFamily: Design.typography.fontRegular,
              }}
            />

            <Text
              style={{
                color: Design.colors.muted,
                fontSize: 14,
                marginBottom: 12,
                fontFamily: Design.typography.fontSemiBold,
              }}
            >
              Selected Exercises ({planExercises.length})
            </Text>
            {planExercises.length === 0 ? (
              <Text
                style={{
                  color: Design.colors.muted,
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                Add exercises to build your custom workout.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 200, marginBottom: 24 }}>
                {planExercises.map((exercise) => (
                  <View
                    key={exercise.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Design.colors.lime,
                      }}
                    />
                    <Text
                      style={{
                        color: Design.colors.ink,
                        fontSize: 14,
                        fontFamily: Design.typography.fontMedium,
                      }}
                    >
                      {exercise.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => setPlanExerciseIds([])}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: Design.colors.border,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: Design.colors.ink,
                    fontSize: 15,
                    fontFamily: Design.typography.fontBold,
                  }}
                >
                  Clear
                </Text>
              </Pressable>
              <Pressable
                onPress={savePlan}
                disabled={isSaving || planExercises.length === 0}
                style={{
                  flex: 2,
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: Design.colors.violet,
                  alignItems: "center",
                  opacity: isSaving || planExercises.length === 0 ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: Design.colors.white,
                    fontSize: 15,
                    fontFamily: Design.typography.fontBold,
                  }}
                >
                  {isSaving ? "Saving..." : "Save Workout Plan"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}
