import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Design } from "@/constants/design";
import { apiPost } from "@/lib/api";
import { useAuth, useUser } from "@clerk/clerk-expo";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SUGGESTIONS = [
  "Suggest a high-protein snack",
  "How many calories left today?",
  "Give a balanced lunch idea",
];

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
  const { user } = useUser();
  const { signOut, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey! I’m your AI nutrition coach. Ask me about macros, meals, or goals.",
    },
  ]);
  const [input, setInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [tone, setTone] = useState<"Motivating" | "Direct">("Motivating");

  const canSend = input.trim().length > 0;

  const onSend = async () => {
    if (!canSend) return;
    const newMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    const history = messages.map((msg) => ({
      role: msg.role,
      content: msg.text,
    }));

    const response = await apiPost<{ reply: string }>("/chat", {
      message: newMessage.text,
      history,
      userId: user?.id,
    });

    if (response.error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          role: "assistant",
          text: "Sorry, I could not reach the AI service. Please try again.",
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-bot`,
        role: "assistant",
        text: response.data.reply || "Got it.",
      },
    ]);
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: Design.spacing.lg,
              paddingBottom: 16,
            }}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={{
                  alignSelf:
                    message.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    message.role === "user"
                      ? Design.colors.violet
                      : theme.surface,
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 10,
                  maxWidth: "85%",
                  borderWidth: message.role === "user" ? 0 : 1,
                  borderColor: theme.border,
                  ...Design.shadow.soft,
                }}
              >
                <Text
                  style={{
                    color:
                      message.role === "user"
                        ? Design.colors.white
                        : theme.text,
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: Design.typography.fontRegular,
                  }}
                >
                  {message.text}
                </Text>
              </View>
            ))}

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 12,
              }}
            >
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => setInput(suggestion)}
                  style={({ pressed }) => [
                    {
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.border,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: theme.surface,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={{
                      color: Design.colors.violet,
                      fontSize: 13,
                      fontFamily: Design.typography.fontMedium,
                    }}
                  >
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View
            style={{
              paddingHorizontal: Design.spacing.lg,
              paddingBottom: 24,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              backgroundColor: theme.background,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask Coach..."
                placeholderTextColor={theme.muted}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: theme.surface,
                  color: theme.text,
                  fontFamily: Design.typography.fontRegular,
                  fontSize: 15,
                }}
              />
              <Pressable
                onPress={onSend}
                style={({ pressed }) => [
                  {
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: canSend
                      ? Design.colors.lime
                      : theme.surface,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={canSend ? Design.colors.black : theme.muted}
                />
              </Pressable>
            </View>
          </View>
        </>

        <Modal visible={settingsOpen} transparent animationType="slide">
          <View
            style={{
              flex: 1,
              backgroundColor: theme.overlay,
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: theme.surface,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                padding: 24,
                paddingBottom: 40,
                borderTopWidth: 1,
                borderTopColor: theme.border,
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
                    color: theme.text,
                    fontSize: 20,
                    fontFamily: Design.typography.fontBold,
                  }}
                >
                  Settings
                </Text>
                <Pressable
                  onPress={() => setSettingsOpen(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: theme.iconBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color={theme.text} />
                </Pressable>
              </View>

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
                        borderColor: active
                          ? Design.colors.violet
                          : theme.border,
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
                    setSettingsOpen(false);
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
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaProvider>
  );
}
