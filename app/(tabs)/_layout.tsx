import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { Design } from '@/constants/design';

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: { navigate: (name: string) => void };
};

const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  running: {
    label: 'Workout',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/d0wz7m8f_expires_30_days.png',
  },
  calories: {
    label: 'Calories',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/9ggbov0j_expires_30_days.png',
  },
  index: {
    label: 'Dashboard',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/m374bjld_expires_30_days.png',
  },
  account: {
    label: 'AI Chat',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/wk2egzhu_expires_30_days.png',
  },
};

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View
      style={{
        backgroundColor: Design.colors.background,
        paddingHorizontal: Design.spacing.md,
        paddingBottom: 6,
        paddingTop: 6,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Design.colors.surface,
          borderRadius: Design.radius.xl,
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderColor: Design.colors.line,
          borderWidth: 1,
          ...Design.shadow.lift,
        }}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name];
          const label = descriptors[route.key]?.options?.title ?? config?.label ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 4,
              }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: Design.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isFocused ? Design.colors.accentSoft : 'transparent',
                }}>
                <Image source={{ uri: config?.icon }} resizeMode="contain" style={{ width: 24, height: 24 }} />
              </View>
              <Text
                style={{
                  color: isFocused ? Design.colors.ink : Design.colors.muted,
                  fontSize: 10,
                  marginTop: 4,
                  fontFamily: isFocused ? Design.typography.fontSemiBold : Design.typography.fontMedium,
                }}>
                {label}
              </Text>
              {isFocused ? (
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: Design.colors.accent,
                    marginTop: 4,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: any) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Workout' }} />
      <Tabs.Screen name="calories" options={{ title: 'Calories' }} />
      <Tabs.Screen name="running" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="ai chat" options={{ title: 'AI Chat' }} />
    </Tabs>
  );
}
