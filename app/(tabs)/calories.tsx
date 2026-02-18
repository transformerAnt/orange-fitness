import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { apiPost } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Design } from '@/constants/design';

type FoodAnalysis = {
  items: { name: string; calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number }[];
  totalCalories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
};

export default function CaloriesScreen() {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setImageUrl('');
      setAnalysis(null);
    }
  };

  const uploadImage = async () => {
    if (!localImageUri) return null;
    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        alert('Please sign in to upload photos.');
        setUploading(false);
        return null;
      }
      const fileExt = localImageUri.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const response = await fetch(localImageUri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('food-photos').upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });
      if (error) {
        alert('Upload failed. Check storage permissions.');
        setUploading(false);
        return null;
      }
      const { data } = supabase.storage.from('food-photos').getPublicUrl(filePath);
      setUploading(false);
      return data.publicUrl;
    } catch {
      setUploading(false);
      alert('Upload failed.');
      return null;
    }
  };

  const analyzeFood = async () => {
    let finalImageUrl = imageUrl;
    if (!finalImageUrl && localImageUri) {
      finalImageUrl = (await uploadImage()) ?? '';
    }
    if (!finalImageUrl) {
      alert('Add a photo or paste a URL first.');
      return;
    }
    setLoading(true);
    const response = await apiPost<FoodAnalysis>('/food/analyze', { imageUrl: finalImageUrl });
    setLoading(false);
    if (response.error) {
      alert(response.error);
      return;
    }
    setAnalysis(response.data);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (user) {
      await supabase.from('food_logs').insert({
        user_id: user.id,
        image_url: finalImageUrl,
        source: 'mistral',
        items: response.data?.items ?? [],
        total_calories: response.data?.totalCalories ?? null,
        protein_g: response.data?.protein_g ?? null,
        carbs_g: response.data?.carbs_g ?? null,
        fat_g: response.data?.fat_g ?? null,
      });
    }
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
          <LinearGradient
            colors={['#FF6B3D', '#FF9A6C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: Design.radius.xl,
              padding: Design.spacing.lg,
              marginBottom: Design.spacing.lg,
            }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 26,
                fontFamily: Design.typography.fontBold,
                marginBottom: 6,
              }}>
              Calorie AI
            </Text>
            <Text
              style={{
                color: '#FFF4EF',
                fontSize: 14,
                fontFamily: Design.typography.fontMedium,
              }}>
              Snap your meal and get instant macro estimates.
            </Text>
          </LinearGradient>

          <View
            style={{
              borderColor: Design.colors.line,
              borderRadius: Design.radius.lg,
              borderWidth: 1,
              padding: Design.spacing.lg,
              backgroundColor: Design.colors.surface,
              marginBottom: Design.spacing.lg,
              ...Design.shadow.soft,
            }}>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 14,
                fontFamily: Design.typography.fontSemiBold,
                marginBottom: 10,
              }}>
              Capture Meal
            </Text>
            {localImageUri ? (
              <Image
                source={{ uri: localImageUri }}
                style={{ width: '100%', height: 200, borderRadius: 14, marginBottom: 12 }}
              />
            ) : null}
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <Pressable
                onPress={pickFromCamera}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: Design.colors.ink,
                  alignItems: 'center',
                  marginRight: 10,
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                  Use Camera
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setLocalImageUri(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: Design.colors.accentSoft,
                  alignItems: 'center',
                }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                  Paste URL
                </Text>
              </Pressable>
            </View>
            <Text style={{ color: Design.colors.muted, fontSize: 12, marginBottom: 8 }}>
              Food image URL (optional)
            </Text>
            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              autoCapitalize="none"
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
            <Pressable
              onPress={analyzeFood}
              style={{
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: Design.colors.accent,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                {loading ? 'Analyzing...' : uploading ? 'Uploading...' : 'Analyze Meal'}
              </Text>
            </Pressable>
          </View>

          {analysis ? (
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
                  marginBottom: 8,
                }}>
                Estimate
              </Text>
              <Text style={{ color: Design.colors.ink, fontSize: 14, marginBottom: 4 }}>
                Calories: {analysis.totalCalories ?? '—'}
              </Text>
              <Text style={{ color: Design.colors.ink, fontSize: 14, marginBottom: 4 }}>
                Protein: {analysis.protein_g ?? '—'} g
              </Text>
              <Text style={{ color: Design.colors.ink, fontSize: 14, marginBottom: 4 }}>
                Carbs: {analysis.carbs_g ?? '—'} g
              </Text>
              <Text style={{ color: Design.colors.ink, fontSize: 14, marginBottom: 10 }}>
                Fat: {analysis.fat_g ?? '—'} g
              </Text>
              {analysis.items?.length ? (
                <View>
                  {analysis.items.map((item) => (
                    <Text key={item.name} style={{ color: Design.colors.muted, fontSize: 12 }}>
                      - {item.name} ({item.calories ?? '—'} kcal)
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
