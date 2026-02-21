import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Design } from '@/constants/design';
import { apiGet } from '@/lib/api';
import { supabase } from '@/lib/supabase';

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
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [planName, setPlanName] = useState('My Plan');
  const [planExerciseIds, setPlanExerciseIds] = useState<string[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [exercises, setExercises] = useState<ExerciseDbItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bodyParts, setBodyParts] = useState<string[]>(['all']);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const derivedBodyParts = useMemo(() => {
    const parts = new Set<string>();
    exercises.forEach((exercise) => {
      if (exercise.bodyPart) {
        parts.add(exercise.bodyPart);
      }
    });
    return ['all', ...Array.from(parts)];
  }, [exercises]);
  const visibleBodyParts = bodyParts.length > 1 ? bodyParts : derivedBodyParts;

  const filteredExercises = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesBodyPart = selectedBodyPart === 'all' || exercise.bodyPart === selectedBodyPart;
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
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [selectedBodyPart, exercises, searchQuery]);

  const planExercises = useMemo(
    () => exercises.filter((exercise) => planExerciseIds.includes(exercise.id)),
    [planExerciseIds, exercises]
  );

  useEffect(() => {
    const loadBodyParts = async () => {
      const response = await apiGet<string[]>('/exercises/body-parts');
      if (response.data && !response.error && Array.isArray(response.data) && response.data.length > 0) {
        setBodyParts(['all', ...response.data]);
      }
    };
    loadBodyParts();
  }, []);

  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      setLoadError(null);
      const params = selectedBodyPart === 'all' ? '' : `?bodyPart=${encodeURIComponent(selectedBodyPart)}`;
      const response = await apiGet<ExerciseDbItem[]>(`/exercises${params}`);
      if (response.data && !response.error && Array.isArray(response.data)) {
        setExercises(response.data);
      } else {
        setExercises([]);
        setLoadError(response.error ?? 'Unable to load exercises.');
      }
      setIsLoading(false);
    };
    loadExercises();
  }, [selectedBodyPart]);

  const loadPlans = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      setPlans([]);
      return;
    }
    const { data, error } = await supabase
      .from('plans')
      .select('id,name')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setPlans(data);
    }
  };

  useEffect(() => {
    loadPlans();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadPlans();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const savePlan = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      alert('Please sign in to save your plan.');
      return;
    }
    if (planExerciseIds.length === 0) {
      alert('Add at least one exercise to your plan.');
      return;
    }
    setIsSaving(true);
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({ user_id: user.id, name: planName })
      .select('id')
      .single();
    if (planError || !plan) {
      setIsSaving(false);
      alert('Could not save plan.');
      return;
    }
    const planItems = planExercises.map((exercise) => ({
      plan_id: plan.id,
      exercise_id: exercise.id,
      name: exercise.name,
      body_parts: [exercise.bodyPart],
      target_muscles: [exercise.target],
      equipments: [exercise.equipment],
      difficulty: exercise.difficulty ?? 'unknown',
    }));
    const { error: itemsError } = await supabase.from('plan_exercises').insert(planItems);
    if (itemsError) {
      setIsSaving(false);
      alert('Could not save plan exercises.');
      return;
    }
    setPlanExerciseIds([]);
    setShowPlanModal(false);
    setIsSaving(false);
    loadPlans();
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
          

          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 18,
              fontFamily: Design.typography.fontSemiBold,
              marginBottom: 10,
            }}>
            Body Parts
          </Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            style={{
              borderColor: Design.colors.line,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
              backgroundColor: Design.colors.surface,
              fontFamily: Design.typography.fontMedium,
            }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 }}>
            {visibleBodyParts.map((part) => {
              const isActive = selectedBodyPart === part;
              return (
                <Pressable
                  key={part}
                  onPress={() => setSelectedBodyPart(part)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: isActive ? Design.colors.ink : Design.colors.surface,
                    borderColor: Design.colors.line,
                    borderWidth: 1,
                    marginRight: 10,
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: isActive ? '#FFFFFF' : Design.colors.ink,
                      fontSize: 12,
                      fontFamily: Design.typography.fontSemiBold,
                      textTransform: 'capitalize',
                    }}>
                    {part}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 18,
              fontFamily: Design.typography.fontSemiBold,
              marginBottom: 10,
            }}>
            Workout Options
          </Text>
          <View style={{ marginBottom: 24 }}>
            {isLoading ? (
              <Text style={{ color: Design.colors.muted, fontSize: 12 }}>Loading exercises...</Text>
            ) : loadError ? (
              <Text style={{ color: Design.colors.muted, fontSize: 12 }}>{loadError}</Text>
            ) : filteredExercises.length === 0 ? (
              <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
                No exercises found. Try another body part or search.
              </Text>
            ) : null}
            {filteredExercises.map((exercise) => (
              <View
                key={exercise.id}
                style={{
                  borderColor: Design.colors.line,
                  borderRadius: Design.radius.lg,
                  borderWidth: 1,
                  padding: 14,
                  marginBottom: 12,
                  backgroundColor: Design.colors.surface,
                  ...Design.shadow.soft,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Image
                    source={
                      exercise.gifUrl
                        ? { uri: exercise.gifUrl }
                        : require('../assets/images/icon.png')
                    }
                    resizeMode="cover"
                    style={{ width: 64, height: 64, borderRadius: 10, marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: Design.colors.ink,
                        fontSize: 16,
                        fontFamily: Design.typography.fontSemiBold,
                        marginBottom: 2,
                      }}>
                      {exercise.name}
                    </Text>
                    <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
                      {exercise.bodyPart} - {exercise.target}
                    </Text>
                    <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
                      {exercise.equipment} - {exercise.difficulty ?? 'unknown'}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Pressable
                    onPress={() => router.push(`/exercise/${exercise.id}`)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: Design.colors.ink,
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                      Play
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (!planExerciseIds.includes(exercise.id)) {
                        setPlanExerciseIds((prev) => [...prev, exercise.id]);
                      }
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: Design.colors.accentSoft,
                      alignItems: 'center',
                    }}>
                    <Text style={{ color: Design.colors.ink, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                      Add to Plan
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 18,
              fontFamily: Design.typography.fontSemiBold,
              marginBottom: 10,
            }}>
            Create Your Plan
          </Text>
          <Pressable
            onPress={() => setShowPlanModal(true)}
            style={{
              borderColor: Design.colors.line,
              borderRadius: Design.radius.lg,
              borderWidth: 1,
              padding: 16,
              backgroundColor: Design.colors.surface,
              ...Design.shadow.soft,
            }}>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 14,
                fontFamily: Design.typography.fontSemiBold,
                marginBottom: 4,
              }}>
              Create Plan
            </Text>
            <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
              Tap to name your plan and add selected exercises.
            </Text>
          </Pressable>

          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 18,
              fontFamily: Design.typography.fontSemiBold,
              marginTop: 20,
              marginBottom: 10,
            }}>
            Your Plans
          </Text>
          {plans.length === 0 ? (
            <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
              No plans saved yet. Create one above.
            </Text>
          ) : (
            <View>
              {plans.map((plan) => (
                <View
                  key={plan.id}
                  style={{
                    borderColor: Design.colors.line,
                    borderRadius: 12,
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 10,
                    backgroundColor: Design.colors.surface,
                  }}>
                  <Text
                    style={{
                      color: Design.colors.ink,
                      fontSize: 14,
                      fontFamily: Design.typography.fontSemiBold,
                    }}>
                    {plan.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={showPlanModal}
        onRequestClose={() => setShowPlanModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              borderRadius: Design.radius.lg,
              backgroundColor: Design.colors.surface,
              padding: 18,
              borderColor: Design.colors.line,
              borderWidth: 1,
              ...Design.shadow.lift,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Text
                style={{
                  color: Design.colors.ink,
                  fontSize: 18,
                  fontFamily: Design.typography.fontSemiBold,
                }}>
                Create Your Plan
              </Text>
              <Pressable onPress={() => setShowPlanModal(false)}>
                <Text style={{ color: Design.colors.muted, fontSize: 14 }}>Close</Text>
              </Pressable>
            </View>
            <Text style={{ color: Design.colors.ink, fontSize: 12, marginBottom: 8 }}>Plan name</Text>
            <TextInput
              value={planName}
              onChangeText={setPlanName}
              placeholder="Plan name"
              style={{
                borderColor: Design.colors.line,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                backgroundColor: Design.colors.surface,
                fontFamily: Design.typography.fontMedium,
              }}
            />
            {planExercises.length === 0 ? (
              <Text style={{ color: Design.colors.muted, fontSize: 12, marginBottom: 12 }}>
                Add exercises from the list above to build your plan.
              </Text>
            ) : (
              <View style={{ marginBottom: 12 }}>
                {planExercises.map((exercise) => (
                  <Text key={exercise.id} style={{ color: Design.colors.ink, fontSize: 12 }}>
                    - {exercise.name}
                  </Text>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                onPress={() => setPlanExerciseIds([])}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: Design.colors.surface,
                  borderWidth: 1,
                  borderColor: Design.colors.line,
                  alignItems: 'center',
                  marginRight: 10,
                }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                  Clear
                </Text>
              </Pressable>
              <Pressable
                onPress={savePlan}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: Design.colors.ink,
                  alignItems: 'center',
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                  {isSaving ? 'Saving...' : 'Save Plan'}
                </Text>
              </Pressable>
            </View>
            <Text style={{ color: Design.colors.muted, fontSize: 11, marginTop: 8 }}>
              Saved to your account.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}
