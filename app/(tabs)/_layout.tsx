import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { Design } from "@/constants/design";

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: { navigate: (name: string) => void };
};

const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
  }
> = {
  running: {
    label: "Workout",
    icon: (props) => <Ionicons name="barbell-outline" {...props} />,
  },
  calories: {
    label: "Calories",
    icon: (props) => <Ionicons name="flame-outline" {...props} />,
  },
  index: {
    label: "Playlist",
    icon: (props) => <Ionicons name="grid-outline" {...props} />,
  },
  account: {
    label: "AI Chat",
    icon: (props) => <Ionicons name="chatbubble-ellipses-outline" {...props} />,
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
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Design.colors.surface,
          borderRadius: Design.radius.xl,
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderColor: Design.colors.line,
          borderWidth: 1,
          ...Design.shadow.lift,
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name];
          const Icon =
            config?.icon ??
            ((props) => <Ionicons name="grid-outline" {...props} />);
          const label =
            descriptors[route.key]?.options?.title ??
            config?.label ??
            route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 4,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: Design.radius.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isFocused
                    ? Design.colors.accentSoft
                    : "transparent",
                }}
              >
                <Icon
                  color={isFocused ? Design.colors.accent : Design.colors.muted}
                  size={22}
                />
              </View>
              <Text
                style={{
                  color: isFocused ? Design.colors.ink : Design.colors.muted,
                  fontSize: 10,
                  marginTop: 4,
                  fontFamily: isFocused
                    ? Design.typography.fontSemiBold
                    : Design.typography.fontMedium,
                }}
              >
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
      tabBar={(props: any) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="calories" options={{ title: "Calories" }} />
      <Tabs.Screen name="running" options={{ title: "Playlist" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
