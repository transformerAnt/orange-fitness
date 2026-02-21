import { Design } from '@/constants/design';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const PROGRAMS: Record<
  string,
  { title: string; focus: string; weekly: { day: string; label: string; intensity: number }[] }
> = {
  'nba-power': {
    title: 'NBA Power',
    focus: 'Explosive strength + plyo control',
    weekly: [
      { day: 'Mon', label: 'Lower Power', intensity: 85 },
      { day: 'Tue', label: 'Core + Mobility', intensity: 55 },
      { day: 'Wed', label: 'Upper Strength', intensity: 78 },
      { day: 'Thu', label: 'Speed & Agility', intensity: 70 },
      { day: 'Fri', label: 'Full Body', intensity: 82 },
      { day: 'Sat', label: 'Recovery Flow', intensity: 40 },
      { day: 'Sun', label: 'Off', intensity: 25 },
    ],
  },
  'gridiron-strength': {
    title: 'Gridiron Strength',
    focus: 'Power, contact prep, sprint work',
    weekly: [
      { day: 'Mon', label: 'Acceleration', intensity: 78 },
      { day: 'Tue', label: 'Lower Strength', intensity: 88 },
      { day: 'Wed', label: 'Upper Strength', intensity: 80 },
      { day: 'Thu', label: 'Speed + Core', intensity: 68 },
      { day: 'Fri', label: 'Conditioning', intensity: 74 },
      { day: 'Sat', label: 'Mobility', intensity: 45 },
      { day: 'Sun', label: 'Off', intensity: 25 },
    ],
  },
  'court-speed': {
    title: 'Court Speed',
    focus: 'Footwork, reaction, and balance',
    weekly: [
      { day: 'Mon', label: 'Footwork', intensity: 70 },
      { day: 'Tue', label: 'Upper Strength', intensity: 62 },
      { day: 'Wed', label: 'Agility', intensity: 76 },
      { day: 'Thu', label: 'Core + Mobility', intensity: 55 },
      { day: 'Fri', label: 'Speed Drills', intensity: 72 },
      { day: 'Sat', label: 'Light Cardio', intensity: 46 },
      { day: 'Sun', label: 'Off', intensity: 25 },
    ],
  },
  'olympian-engine': {
    title: 'Olympian Engine',
    focus: 'Stamina, form, and total body',
    weekly: [
      { day: 'Mon', label: 'Tempo Run', intensity: 72 },
      { day: 'Tue', label: 'Strength', intensity: 78 },
      { day: 'Wed', label: 'Intervals', intensity: 86 },
      { day: 'Thu', label: 'Mobility', intensity: 52 },
      { day: 'Fri', label: 'Endurance', intensity: 80 },
      { day: 'Sat', label: 'Recovery', intensity: 42 },
      { day: 'Sun', label: 'Off', intensity: 25 },
    ],
  },
  'aesthetic-stoic': {
    title: 'Aesthetic Stoic',
    focus: 'Lean sculpt + posture discipline',
    weekly: [
      { day: 'Mon', label: 'Upper Sculpt', intensity: 68 },
      { day: 'Tue', label: 'Lower Sculpt', intensity: 70 },
      { day: 'Wed', label: 'Mobility', intensity: 45 },
      { day: 'Thu', label: 'Core + Balance', intensity: 58 },
      { day: 'Fri', label: 'Full Body', intensity: 64 },
      { day: 'Sat', label: 'Recovery', intensity: 40 },
      { day: 'Sun', label: 'Off', intensity: 25 },
    ],
  },
};

export default function CelebrityProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = PROGRAMS[id ?? ''] ?? PROGRAMS['nba-power'];

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ color: Design.colors.muted, fontSize: 12 }}>Back</Text>
          </Pressable>
          <Text style={{ color: Design.colors.ink, fontSize: 26, fontFamily: Design.typography.fontBold }}>
            {program.title}
          </Text>
          <Text style={{ color: Design.colors.muted, fontSize: 13, marginTop: 6 }}>{program.focus}</Text>

          <View
            style={{
              marginTop: 18,
              borderRadius: 18,
              borderWidth: 1,
              borderStyle: 'dotted',
              borderColor: 'rgba(16, 18, 20, 0.18)',
              padding: 16,
              backgroundColor: Design.colors.surface,
            }}>
            <Text style={{ color: Design.colors.ink, fontSize: 14, fontFamily: Design.typography.fontSemiBold }}>
              Weekly Plan
            </Text>
            <Text style={{ color: Design.colors.muted, fontSize: 11, marginTop: 6, marginBottom: 12 }}>
              Intensity score per day
            </Text>
            {program.weekly.map((day) => (
              <View
                key={day.day}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12, width: 40 }}>{day.day}</Text>
                <View
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor: Design.colors.line,
                    borderRadius: 8,
                    marginHorizontal: 12,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      height: 8,
                      width: `${day.intensity}%`,
                      backgroundColor: Design.colors.accent,
                    }}
                  />
                </View>
                <Text style={{ color: Design.colors.muted, fontSize: 11 }}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
