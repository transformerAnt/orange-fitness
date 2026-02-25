import React, { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Design } from "@/constants/design";
import { useAuth } from "@clerk/clerk-expo";

const LIGHT_THEME = {
  background: "#F6F7FB",
  surface: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  overlay: "rgba(0,0,0,0.35)",
  chipVioletBg: "rgba(125, 57, 235, 0.12)",
  chipLimeBg: "rgba(198, 255, 51, 0.18)",
  chipNeutralBg: "rgba(17, 24, 39, 0.08)",
  iconBg: "#F3F4F6",
};

export default function AccountScreen() {
  const theme = LIGHT_THEME;
  const { signOut, isSignedIn } = useAuth();
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [tone, setTone] = useState<"Motivating" | "Direct">("Motivating");

  return (
    <SafeAreaProvider
      style={{ flex: 1, backgroundColor: theme.background, marginTop: 30 }}
    >
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{
            paddingHorizontal: Design.spacing.lg,
            paddingTop: 20,
            paddingBottom: 12,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 22,
              fontFamily: Design.typography.fontBold,
            }}
          >
            Account
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: Design.spacing.lg,
            paddingBottom: 24,
          }}
        >
          <Text
            style={{
              color: theme.muted,
              fontSize: 14,
              marginBottom: 12,
              fontFamily: Design.typography.fontSemiBold,
            }}
          >
            Tone
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            {(["Motivating", "Direct"] as const).map((option) => {
              const active = tone === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setTone(option)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: active ? Design.colors.violet : theme.border,
                    backgroundColor: active
                      ? Design.colors.violet
                      : "transparent",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: active ? Design.colors.white : theme.text,
                      fontSize: 14,
                      fontFamily: Design.typography.fontSemiBold,
                    }}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ gap: 16, marginBottom: 32 }}>
            {[
              {
                label: "Notifications",
                value: notifications,
                onChange: setNotifications,
              },
              {
                label: "Smart Suggestions",
                value: smartSuggestions,
                onChange: setSmartSuggestions,
              },
              {
                label: "Auto Sync",
                value: autoSync,
                onChange: setAutoSync,
              },
            ].map((setting) => (
              <View
                key={setting.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontFamily: Design.typography.fontMedium,
                  }}
                >
                  {setting.label}
                </Text>
                <Switch
                  value={setting.value}
                  onValueChange={setting.onChange}
                  trackColor={{
                    true: Design.colors.lime,
                    false: theme.border,
                  }}
                  thumbColor={theme.surface}
                />
              </View>
            ))}
          </View>

          {isSignedIn ? (
            <Pressable
              onPress={() => {
                signOut();
              }}
              style={({ pressed }) => [
                {
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: theme.surface,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={{
                  color: "#FF4444",
                  fontSize: 16,
                  fontFamily: Design.typography.fontBold,
                }}
              >
                Sign Out
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}
