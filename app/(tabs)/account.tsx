import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Design } from '@/constants/design';
import { apiPost } from '@/lib/api';
import { useAuth, useUser } from '@clerk/clerk-expo';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type Product = {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
  tag: string;
};

const SUGGESTIONS = [
  'Suggest a high-protein snack',
  'How many calories left today?',
  'Give a balanced lunch idea',
];

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Lays Classic Salted',
    brand: 'PepsiCo',
    calories: 160,
    protein: 2,
    carbs: 15,
    fats: 10,
    serving: '1 oz (28g)',
    tag: 'Snack · Chips',
  },
  {
    id: '2',
    name: 'Cadbury Dairy Milk Chocolate',
    brand: 'Cadbury',
    calories: 235,
    protein: 3,
    carbs: 26,
    fats: 13,
    serving: '1 bar (45g)',
    tag: 'Sweet · Chocolate',
  },
  {
    id: '3',
    name: 'Kellogg\'s Corn Flakes',
    brand: 'Kellogg\'s',
    calories: 100,
    protein: 2,
    carbs: 22,
    fats: 0,
    serving: '1 cup (30g)',
    tag: 'Breakfast · Cereal',
  },
  {
    id: '4',
    name: 'Maggi 2-Minute Noodles',
    brand: 'Nestlé',
    calories: 290,
    protein: 8,
    carbs: 42,
    fats: 11,
    serving: '1 pack (70g)',
    tag: 'Quick meal · Instant',
  },
  {
    id: '5',
    name: 'Amul Butter',
    brand: 'Amul',
    calories: 72,
    protein: 0,
    carbs: 0,
    fats: 8,
    serving: '1 tbsp (10g)',
    tag: 'Dairy · Spread',
  },
  {
    id: '6',
    name: 'Coca-Cola',
    brand: 'The Coca-Cola Company',
    calories: 140,
    protein: 0,
    carbs: 39,
    fats: 0,
    serving: '1 can (330ml)',
    tag: 'Beverage · Soft drink',
  },
  {
    id: '7',
    name: 'Parle-G Biscuits',
    brand: 'Parle',
    calories: 67,
    protein: 1,
    carbs: 11,
    fats: 2,
    serving: '2 biscuits (14g)',
    tag: 'Snack · Biscuit',
  },
  {
    id: '8',
    name: 'Britannia Good Day Butter',
    brand: 'Britannia',
    calories: 70,
    protein: 1,
    carbs: 9,
    fats: 4,
    serving: '2 biscuits (16g)',
    tag: 'Snack · Cookie',
  },
];

export default function AccountScreen() {
  const { user } = useUser();
  const { signOut, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hey! I’m your AI nutrition coach. Ask me about macros, meals, or goals.',
    },
  ]);
  const [input, setInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [tone, setTone] = useState<'Motivating' | 'Direct'>('Motivating');
  const [mode, setMode] = useState<'chat' | 'products'>('chat');

  const canSend = input.trim().length > 0;

  const onSend = async () => {
    if (!canSend) return;
    const newMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: input.trim(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    const history = messages.map((msg) => ({
      role: msg.role,
      content: msg.text,
    }));

    const response = await apiPost<{ reply: string }>('/chat', {
      message: newMessage.text,
      history,
      userId: user?.id,
    });

    if (response.error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          role: 'assistant',
          text: 'Sorry, I could not reach the AI service. Please try again.',
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-bot`,
        role: 'assistant',
        text: response.data.reply || 'Got it.',
      },
    ]);
  };

  const headerTitle = useMemo(() => 'AI Chat', []);
  const displayName = useMemo(
    () =>
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      user?.primaryEmailAddress?.emailAddress ||
      'User',
    [user]
  );
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? '';

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <View style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View
          style={{
            paddingHorizontal: Design.spacing.lg,
            paddingTop: 20,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 26,
              fontFamily: Design.typography.fontBold,
            }}>
            {headerTitle}
          </Text>
          <Pressable onPress={() => setSettingsOpen(true)}>
            <Ionicons name="settings-outline" size={22} color={Design.colors.ink} />
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: Design.spacing.lg,
            marginBottom: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: Design.colors.line,
            backgroundColor: Design.colors.surface,
            overflow: 'hidden',
          }}>
          {[
            { key: 'chat', label: 'Chat' },
            { key: 'products', label: 'Products' },
          ].map((item) => {
            const active = mode === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setMode(item.key as 'chat' | 'products')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: active ? Design.colors.ink : 'transparent',
                }}>
                <Text
                  style={{
                    color: active ? '#FFFFFF' : Design.colors.ink,
                    fontSize: 12,
                    fontFamily: Design.typography.fontSemiBold,
                  }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'chat' ? (
          <>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: Design.spacing.lg, paddingBottom: 16 }}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor:
                      message.role === 'user' ? Design.colors.ink : Design.colors.surface,
                    borderRadius: 16,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 10,
                    maxWidth: '78%',
                    borderWidth: message.role === 'user' ? 0 : 1,
                    borderColor: Design.colors.line,
                  }}>
                  <Text
                    style={{
                      color: message.role === 'user' ? '#FFFFFF' : Design.colors.ink,
                      fontSize: 13,
                      lineHeight: 18,
                      fontFamily: Design.typography.fontMedium,
                    }}>
                    {message.text}
                  </Text>
                </View>
              ))}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {SUGGESTIONS.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => setInput(suggestion)}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: Design.colors.line,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: Design.colors.surface,
                    }}>
                    <Text style={{ color: Design.colors.ink, fontSize: 12 }}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View
              style={{
                paddingHorizontal: Design.spacing.lg,
                paddingBottom: 16,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: Design.colors.line,
                backgroundColor: Design.colors.background,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask Mistral..."
                  placeholderTextColor={Design.colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: Design.colors.line,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: Design.colors.surface,
                    fontFamily: Design.typography.fontMedium,
                  }}
                />
                <Pressable
                  onPress={onSend}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: canSend ? Design.colors.accent : Design.colors.line,
                  }}>
                  <Ionicons name="send" size={18} color={canSend ? '#FFFFFF' : Design.colors.muted} />
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: Design.spacing.lg,
              paddingBottom: 16,
              paddingTop: 4,
            }}>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 16,
                fontFamily: Design.typography.fontSemiBold,
                marginBottom: 10,
              }}>
              Product breakdown
            </Text>
            <Text
              style={{
                color: Design.colors.muted,
                fontSize: 12,
                marginBottom: 16,
              }}>
              Explore ready-made items with their calorie and macro breakdown, similar to Instamart cards.
            </Text>

            {PRODUCTS.map((product) => (
              <View
                key={product.id}
                style={{
                  borderColor: Design.colors.line,
                  borderRadius: 16,
                  borderWidth: 1,
                  padding: 14,
                  backgroundColor: Design.colors.surface,
                  marginBottom: 12,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 6,
                  }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text
                      style={{
                        color: Design.colors.ink,
                        fontSize: 14,
                        fontFamily: Design.typography.fontSemiBold,
                      }}>
                      {product.name}
                    </Text>
                    {product.brand ? (
                      <Text
                        style={{
                          color: Design.colors.muted,
                          fontSize: 11,
                          marginTop: 2,
                        }}>
                        {product.brand}
                      </Text>
                    ) : null}
                    <Text
                      style={{
                        color: Design.colors.muted,
                        fontSize: 11,
                        marginTop: 4,
                      }}>
                      {product.serving}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: Design.colors.ink,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontFamily: Design.typography.fontSemiBold,
                      }}>
                      {product.calories} kcal
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 8,
                  }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: '#E0F7F4',
                      }}>
                      <Text style={{ color: Design.colors.ink, fontSize: 11 }}>
                        P {product.protein}g
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: '#FFF3D6',
                      }}>
                      <Text style={{ color: Design.colors.ink, fontSize: 11 }}>
                        C {product.carbs}g
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: '#FDE4EB',
                      }}>
                      <Text style={{ color: Design.colors.ink, fontSize: 11 }}>
                        F {product.fats}g
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: Design.colors.line,
                      maxWidth: '55%',
                    }}>
                    <Text
                      style={{
                        color: Design.colors.muted,
                        fontSize: 10,
                      }}
                      numberOfLines={1}>
                      {product.tag}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <Modal visible={settingsOpen} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              padding: 24,
            }}>
            <View
              style={{
                backgroundColor: Design.colors.surface,
                borderRadius: 20,
                padding: 20,
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: Design.colors.ink, fontSize: 16, fontFamily: Design.typography.fontBold }}>
                  Chat Settings
                </Text>
                <Pressable onPress={() => setSettingsOpen(false)}>
                  <Ionicons name="close" size={20} color={Design.colors.muted} />
                </Pressable>
              </View>

              <Text style={{ color: Design.colors.muted, fontSize: 12, marginBottom: 8 }}>Tone</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {(['Motivating', 'Direct'] as const).map((option) => {
                  const active = tone === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setTone(option)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: active ? Design.colors.ink : Design.colors.line,
                        backgroundColor: active ? Design.colors.ink : Design.colors.surface,
                      }}>
                      <Text style={{ color: active ? '#FFFFFF' : Design.colors.ink, fontSize: 12 }}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Notifications', value: notifications, onChange: setNotifications },
                  { label: 'Smart Suggestions', value: smartSuggestions, onChange: setSmartSuggestions },
                  { label: 'Auto Sync', value: autoSync, onChange: setAutoSync },
                ].map((setting) => (
                  <View
                    key={setting.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                      borderTopWidth: 1,
                      borderTopColor: Design.colors.line,
                    }}>
                    <Text style={{ color: Design.colors.ink, fontSize: 13 }}>{setting.label}</Text>
                    <Switch
                      value={setting.value}
                      onValueChange={setting.onChange}
                      trackColor={{ true: Design.colors.accent, false: Design.colors.line }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                ))}
              </View>

              {isSignedIn ? (
                <Pressable
                  onPress={signOut}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: Design.colors.ink,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
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
