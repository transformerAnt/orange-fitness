import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapView, { Polyline } from 'react-native-maps';

import { supabase } from '@/lib/supabase';
import { Design } from '@/constants/design';

export default function RunningScreen() {
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [pace, setPace] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const sampleRoute = useMemo(
    () => [
      { latitude: 37.785834, longitude: -122.406417 },
      { latitude: 37.78652, longitude: -122.403 },
      { latitude: 37.78822, longitude: -122.401 },
      { latitude: 37.7899, longitude: -122.3993 },
    ],
    []
  );

  const saveRun = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      alert('Please sign in to save runs.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('run_sessions').insert({
      user_id: user.id,
      distance_km: distanceKm ? Number(distanceKm) : null,
      duration_minutes: durationMinutes ? Number(durationMinutes) : null,
      pace: pace || null,
      notes: notes || null,
      completed_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      alert('Could not save run.');
      return;
    }
    setDistanceKm('');
    setDurationMinutes('');
    setPace('');
    setNotes('');
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 26,
              fontFamily: Design.typography.fontBold,
              marginBottom: 6,
            }}>
            Running
          </Text>
          <Text style={{ color: Design.colors.muted, fontSize: 14, marginBottom: 16 }}>
            Strava‑level tracking with clean, premium insights.
          </Text>

          <View
            style={{
              borderRadius: Design.radius.lg,
              overflow: 'hidden',
              marginBottom: Design.spacing.lg,
              borderColor: Design.colors.line,
              borderWidth: 1,
              backgroundColor: Design.colors.surface,
              ...Design.shadow.soft,
            }}>
            <MapView
              style={{ width: '100%', height: 220 }}
              initialRegion={{
                latitude: 37.7875,
                longitude: -122.4025,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}>
              <Polyline coordinates={sampleRoute} strokeWidth={4} strokeColor={Design.colors.accent} />
            </MapView>
            <View style={{ padding: Design.spacing.md }}>
              <Text
                style={{
                  color: Design.colors.ink,
                  fontSize: 14,
                  fontFamily: Design.typography.fontSemiBold,
                  marginBottom: 6,
                }}>
                Morning Loop
              </Text>
              <Text style={{ color: Design.colors.muted, fontSize: 12 }}>
                4.2 km · 24:38 · 5:52 / km
              </Text>
            </View>
          </View>

          <View
            style={{
              borderColor: Design.colors.line,
              borderRadius: Design.radius.lg,
              borderWidth: 1,
              padding: Design.spacing.lg,
              backgroundColor: Design.colors.surface,
              ...Design.shadow.soft,
            }}>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 16,
                fontFamily: Design.typography.fontSemiBold,
                marginBottom: 12,
              }}>
              Log a Run
            </Text>
            <TextInput
              value={distanceKm}
              onChangeText={setDistanceKm}
              placeholder="Distance (km)"
              keyboardType="decimal-pad"
              style={{
                borderColor: Design.colors.line,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 10,
                backgroundColor: Design.colors.surface,
                fontFamily: Design.typography.fontMedium,
              }}
            />
            <TextInput
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="Duration (minutes)"
              keyboardType="number-pad"
              style={{
                borderColor: Design.colors.line,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 10,
                backgroundColor: Design.colors.surface,
                fontFamily: Design.typography.fontMedium,
              }}
            />
            <TextInput
              value={pace}
              onChangeText={setPace}
              placeholder="Pace (e.g. 5:10 / km)"
              style={{
                borderColor: Design.colors.line,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 10,
                backgroundColor: Design.colors.surface,
                fontFamily: Design.typography.fontMedium,
              }}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              multiline
              style={{
                borderColor: Design.colors.line,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                height: 90,
                backgroundColor: Design.colors.surface,
                marginBottom: 12,
                fontFamily: Design.typography.fontMedium,
              }}
            />
            <Pressable
              onPress={saveRun}
              style={{
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: Design.colors.ink,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                {saving ? 'Saving...' : 'Save Run'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
