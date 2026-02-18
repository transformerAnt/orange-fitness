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
  index: {
    label: 'Dashboard',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/m374bjld_expires_30_days.png',
  },
  calories: {
    label: 'Calories',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/9ggbov0j_expires_30_days.png',
  },
  running: {
    label: 'Running',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/d0wz7m8f_expires_30_days.png',
  },
  account: {
    label: 'Account',
    icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/wk2egzhu_expires_30_days.png',
  },
};

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View
      style={{
        backgroundColor: Design.colors.background,
        paddingHorizontal: Design.spacing.lg,
        paddingBottom: Design.spacing.md,
        paddingTop: Design.spacing.sm,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Design.colors.surface,
          borderRadius: Design.radius.xl,
          paddingVertical: 12,
          paddingHorizontal: 18,
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
                paddingVertical: 6,
              }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: Design.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isFocused ? Design.colors.accentSoft : 'transparent',
                }}>
                <Image source={{ uri: config?.icon }} resizeMode="contain" style={{ width: 20, height: 20 }} />
              </View>
              <Text
                style={{
                  color: isFocused ? Design.colors.ink : Design.colors.muted,
                  fontSize: 11,
                  marginTop: 6,
                  fontFamily: isFocused ? Design.typography.fontSemiBold : Design.typography.fontMedium,
                }}>
                {label}
              </Text>
              {isFocused ? (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: Design.colors.accent,
                    marginTop: 6,
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
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="calories" options={{ title: 'Calories' }} />
      <Tabs.Screen name="running" options={{ title: 'Running' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
