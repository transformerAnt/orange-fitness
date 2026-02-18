import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { EXERCISES } from '@/data/exercises';
import { apiGet } from '@/lib/api';

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

const mapFromLocal = (exercise: (typeof EXERCISES)[number]): ExerciseDbItem => ({
  id: exercise.exerciseId,
  name: exercise.name,
  bodyPart: exercise.bodyParts[0] ?? 'unknown',
  target: exercise.targetMuscles[0] ?? 'unknown',
  equipment: exercise.equipments[0] ?? 'unknown',
  secondaryMuscles: exercise.secondaryMuscles,
  instructions: exercise.instructions,
  description: exercise.overview,
  difficulty: exercise.difficulty,
  gifUrl: exercise.gifUrls?.['360p'],
});

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<ExerciseDbItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackExercise = useMemo(() => {
    if (!id) return null;
    const localExercise = EXERCISES.find((item) => item.exerciseId === id);
    return localExercise ? mapFromLocal(localExercise) : null;
  }, [id]);

  useEffect(() => {
    const loadExercise = async () => {
      if (!id) return;
      setIsLoading(true);
      const response = await apiGet<ExerciseDbItem>(`/exercises/${encodeURIComponent(id)}`);
      if (response.data && !response.error) {
        setExercise(response.data);
      } else {
        setExercise(null);
      }
      setIsLoading(false);
    };
    loadExercise();
  }, [id]);

  const activeExercise = exercise ?? fallbackExercise;

  if (isLoading) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#252727', fontSize: 16 }}>Loading exercise...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!activeExercise) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#252727', fontSize: 16 }}>Exercise not found.</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
          <Text style={{ color: '#252727', fontSize: 26, fontWeight: 'bold', marginBottom: 6 }}>
            {activeExercise.name}
          </Text>
          <Text style={{ color: '#7B7B7B', fontSize: 14, marginBottom: 16 }}>
            {activeExercise.bodyPart} - {activeExercise.difficulty ?? 'unknown'}
          </Text>

          <Image
            source={
              activeExercise.gifUrl
                ? { uri: activeExercise.gifUrl }
                : require('../../assets/images/icon.png')
            }
            resizeMode="cover"
            style={{ width: '100%', height: 220, borderRadius: 16, marginBottom: 16 }}
          />

          <Text style={{ color: '#252727', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            Overview
          </Text>
          <Text style={{ color: '#252727', fontSize: 13, marginBottom: 12 }}>
            {activeExercise.description ?? 'No overview available.'}
          </Text>

          <Text style={{ color: '#252727', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            Target Muscles
          </Text>
          <Text style={{ color: '#252727', fontSize: 13, marginBottom: 12 }}>
            {activeExercise.target}
          </Text>

          <Text style={{ color: '#252727', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            Secondary Muscles
          </Text>
          <Text style={{ color: '#252727', fontSize: 13, marginBottom: 12 }}>
            {(activeExercise.secondaryMuscles ?? []).join(', ') || 'None'}
          </Text>

          <Text style={{ color: '#252727', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            Equipment
          </Text>
          <Text style={{ color: '#252727', fontSize: 13, marginBottom: 12 }}>
            {activeExercise.equipment}
          </Text>

          <Text style={{ color: '#252727', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            Instructions
          </Text>
          <View style={{ marginBottom: 12 }}>
            {(activeExercise.instructions ?? []).length === 0 ? (
              <Text style={{ color: '#252727', fontSize: 13, marginBottom: 6 }}>
                No instructions available.
              </Text>
            ) : (
              activeExercise.instructions?.map((step, index) => (
                <Text key={`${step}-${index}`} style={{ color: '#252727', fontSize: 13, marginBottom: 6 }}>
                  {index + 1}. {step}
                </Text>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
